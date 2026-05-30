import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
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
  const { as } = Route.useSearch();
  const isResidenteFlow = as === "residente";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [signupRole, setSignupRole] = useState<SignupRole>(isResidenteFlow ? "residente" : "admin_condominio");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (role === "residente") navigate({ to: "/portal" });
    else if (role === "guardia") navigate({ to: "/guardia" });
    else navigate({ to: "/" });
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
        const meta: Record<string, any> = { full_name: name, role: signupRole };
        if (signupRole === "residente") meta.invitation_code = invitationCode.trim().toUpperCase();
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg,#faf9f7 0%,#f5ede8 100%)" }}>
      <div className="w-full max-w-md bg-white shadow-lg rounded-3xl p-10">
        <div className="flex items-center gap-3 justify-center mb-2">
          <div className="w-11 h-11 rounded-xl bg-[#c94f0c] flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div className="font-display font-extrabold text-2xl">
            <span className="text-[#2d1200]">Prop</span><span className="text-[#c94f0c]">Cloud</span>
          </div>
        </div>
        <p className="text-center text-sm text-[#9a7060] mb-8">{isResidenteFlow ? "Portal del residente — ingresa o crea tu cuenta con tu código de invitación" : "Administración de condominios y CRM inmobiliario"}</p>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <>
              {!isResidenteFlow && (
                <div>
                  <label className="block text-sm font-medium text-[#2d1200] mb-1.5">Soy</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([["admin_condominio", "Admin"], ["residente", "Residente"], ["guardia", "Guardia"]] as const).map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setSignupRole(v)}
                        className={`text-sm py-2 rounded-lg border ${signupRole === v ? "bg-[#c94f0c] text-white border-[#c94f0c]" : "border-[#c9b8b0] text-[#2d1200] hover:border-[#c94f0c]"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                  {signupRole === "residente" && (
                    <p className="text-xs text-[#9a7060] mt-2">Necesitas un código de invitación enviado por el administrador.</p>
                  )}
                </div>
              )}
              {signupRole === "residente" && (
                <div>
                  <label className="block text-sm font-medium text-[#2d1200] mb-1.5">Código de invitación</label>
                  <input value={invitationCode} onChange={(e) => setInvitationCode(e.target.value.toUpperCase())} required
                    placeholder="ABC123" maxLength={6}
                    className="w-full border border-[#c9b8b0] rounded-xl px-4 py-2.5 text-[#2d1200] font-mono tracking-widest uppercase outline-none focus:border-[#c94f0c] focus:ring-2 focus:ring-[#c94f0c]/20" />
                  <p className="text-xs text-[#9a7060] mt-1.5">Tu administrador te lo envió por WhatsApp o correo.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#2d1200] mb-1.5">Nombre completo</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full border border-[#c9b8b0] rounded-xl px-4 py-2.5 text-[#2d1200] outline-none focus:border-[#c94f0c] focus:ring-2 focus:ring-[#c94f0c]/20" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-[#2d1200] mb-1.5">Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com"
              className="w-full border border-[#c9b8b0] rounded-xl px-4 py-2.5 text-[#2d1200] placeholder:text-[#9a7060] outline-none focus:border-[#c94f0c] focus:ring-2 focus:ring-[#c94f0c]/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2d1200] mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full border border-[#c9b8b0] rounded-xl px-4 py-2.5 text-[#2d1200] outline-none focus:border-[#c94f0c] focus:ring-2 focus:ring-[#c94f0c]/20" />
          </div>
          <button type="submit" disabled={busy}
            className="w-full bg-[#c94f0c] hover:bg-[#a33d08] text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-60">
            {busy ? "Procesando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full mt-4 text-sm text-[#9a7060] hover:text-[#c94f0c] transition-colors">
          {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Iniciar sesión"}
        </button>

        <div className="mt-6 text-center text-xs text-[#9a7060]">
          <Link to="/" className="hover:text-[#c94f0c]">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
