import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { createResidentAccount } from "@/lib/resident-auth.functions";
import { Building } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({ as: (s.as as string) === "residente" ? "residente" : undefined }),
  component: LoginPage,
});

type SignupRole = "admin_condominio" | "residente" | "guardia";

function LoginPage() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const createResident = useServerFn(createResidentAccount);
  const { as } = Route.useSearch();
  const isResidenteFlow = as === "residente";
  const [mode, setMode] = useState<"login" | "signup">(isResidenteFlow ? "signup" : "login");
  const [signupRole, setSignupRole] = useState<SignupRole>(isResidenteFlow ? "residente" : "admin_condominio");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isResidenteFlow) {
      setMode("signup");
      setSignupRole("residente");
    }
  }, [isResidenteFlow]);

  useEffect(() => {
    if (loading || !user) return;
    if (role === "residente") navigate({ to: "/portal" });
    else if (role === "guardia") navigate({ to: "/guardia" });
    else navigate({ to: "/dashboard" });
  }, [user, role, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenido");
      } else {
        if (signupRole === "residente" && !invitationCode.trim()) {
          throw new Error("Necesitas un código de invitación del administrador.");
        }
        if (signupRole === "residente") {
          await createResident({ data: { email, password, fullName: name, invitationCode } });
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          toast.success("Cuenta creada");
          return;
        }
        const meta: Record<string, any> = { full_name: name, role: signupRole };
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: meta },
        });
        if (error) throw error;
        toast.success("Cuenta creada");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Error de autenticación");
    } finally { setBusy(false); }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg,#ffffff 0%,#fffdf5 100%)" }}>
      <div className="w-full max-w-md bg-white shadow-lg rounded-3xl p-10">
        <div className="flex items-center gap-3 justify-center mb-2">
          <div className="w-11 h-11 rounded-xl bg-[#0a1e3f] flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div className="font-display font-extrabold text-2xl text-white">
            <span className="text-[#0a1e3f]">Prop</span><span className="text-[#0a1e3f]">Cloud</span>
          </div>
        </div>
        {isResidenteFlow && (
          <div className="mt-3 mb-4 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-wider bg-[#0a1e3f] text-white px-3 py-1 rounded-full">
              Portal Residentes
            </span>
          </div>
        )}
        <p className="text-center text-sm text-[#6b7a99] mb-8">{isResidenteFlow ? "Ingresa con tu cuenta de residente o regístrate con tu código de invitación" : "Administración de condominios y CRM inmobiliario"}</p>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <>
              {!isResidenteFlow && (
                <div>
                  <label className="block text-sm font-medium text-[#0a1e3f] mb-1.5">Soy</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([["admin_condominio", "Admin"], ["residente", "Residente"], ["guardia", "Guardia"]] as const).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setSignupRole(v)}
                        className={`text-sm py-2 rounded-lg border ${signupRole === v ? "bg-[#0a1e3f] text-white border-[#ffd60a]" : "border-[#ffe87a] text-[#0a1e3f] hover:border-[#ffd60a]"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                  {signupRole === "residente" && (
                    <p className="text-xs text-[#6b7a99] mt-2">Necesitas un código de invitación enviado por el administrador.</p>
                  )}
                </div>
              )}
              {signupRole === "residente" && (
                <div>
                  <label className="block text-sm font-medium text-[#0a1e3f] mb-1.5">Código de invitación</label>
                  <input value={invitationCode} onChange={(e) => setInvitationCode(e.target.value.toUpperCase())} required
                    placeholder="ABC123" maxLength={6}
                    className="w-full border border-[#ffe87a] rounded-xl px-4 py-2.5 text-[#0a1e3f] font-mono tracking-widest uppercase outline-none focus:border-[#ffd60a] focus:ring-2 focus:ring-[#ffd60a]/20" />
                  <p className="text-xs text-[#6b7a99] mt-1.5">Tu administrador te lo envió por WhatsApp o correo.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#0a1e3f] mb-1.5">Nombre completo</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full border border-[#ffe87a] rounded-xl px-4 py-2.5 text-[#0a1e3f] outline-none focus:border-[#ffd60a] focus:ring-2 focus:ring-[#ffd60a]/20" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-[#0a1e3f] mb-1.5">Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com"
              className="w-full border border-[#ffe87a] rounded-xl px-4 py-2.5 text-[#0a1e3f] placeholder:text-[#6b7a99] outline-none focus:border-[#ffd60a] focus:ring-2 focus:ring-[#ffd60a]/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0a1e3f] mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full border border-[#ffe87a] rounded-xl px-4 py-2.5 text-[#0a1e3f] outline-none focus:border-[#ffd60a] focus:ring-2 focus:ring-[#ffd60a]/20" />
          </div>
          <button type="submit" disabled={busy}
            className="w-full bg-[#0a1e3f] hover:bg-[#001a4d] text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-60">
            {busy ? "Procesando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full mt-4 text-sm text-[#6b7a99] hover:text-[#0a1e3f] transition-colors">
          {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Iniciar sesión"}
        </button>

        <div className="mt-6 text-center text-xs text-[#6b7a99]">
          <Link to="/" className="hover:text-[#0a1e3f]">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
