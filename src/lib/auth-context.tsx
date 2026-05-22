import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "super_admin" | "admin_condominio" | "junta_directiva" | "residente" | "agente_inmobiliario" | "gerente_crm";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: { full_name: string; email: string; avatar_url: string | null } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({ user: null, session: null, role: null, profile: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<AuthCtx["profile"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let currentUserId: string | null = null;
    let metaLoadedFor: string | null = null;

    const applySession = (nextSession: Session | null) => {
      if (!alive) return;
      currentUserId = nextSession?.user?.id ?? null;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
      if (!nextSession?.user) {
        metaLoadedFor = null;
        setRole(null);
        setProfile(null);
      }
    };

    const loadUserMeta = async (userId: string) => {
      if (metaLoadedFor === userId) return;
      metaLoadedFor = userId;
      const [{ data: r }, { data: p }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
        supabase.from("profiles").select("full_name,email,avatar_url").eq("id", userId).maybeSingle(),
      ]);
      if (!alive || currentUserId !== userId) return;
      setRole((r?.role as AppRole) ?? null);
      setProfile(p as any);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      applySession(s);
      if (s?.user) {
        setTimeout(() => void loadUserMeta(s.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
      if (session?.user) void loadUserMeta(session.user.id);
    }).catch(() => {
      applySession(null);
    });

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };

  return <Ctx.Provider value={{ user, session, role, profile, loading, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
