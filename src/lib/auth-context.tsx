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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(async () => {
          const [{ data: r }, { data: p }] = await Promise.all([
            supabase.from("user_roles").select("role").eq("user_id", s.user.id).maybeSingle(),
            supabase.from("profiles").select("full_name,email,avatar_url").eq("id", s.user.id).maybeSingle(),
          ]);
          setRole((r?.role as AppRole) ?? null);
          setProfile(p as any);
        }, 0);
      } else {
        setRole(null);
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };

  return <Ctx.Provider value={{ user, session, role, profile, loading, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
