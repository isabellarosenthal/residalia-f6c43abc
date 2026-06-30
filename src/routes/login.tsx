import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { createResidentAccount } from "@/lib/resident-auth.functions";
import { Building } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    as: (s.as as string) === "residente" ? "residente" : undefined,
    mode: (s.mode as string) === "signup" ? "signup" : undefined,
  }),
  component: LoginPage,
});

type SignupRole = "admin_condominio" | "residente" | "guardia";

function LoginPage() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const createResident = useServerFn(createResidentAccount);
  const { as, mode: searchMode } = Route.useSearch();
  const isResidenteFlow = as === "residente";
  const [mode, setMode] = useState<"login" | "signup">(isResidenteFlow || searchMode === "signup" ? "signup" : "login");
  const [signupRole, setSignupRole] = useState<SignupRole>(isResidenteFlow ? "residente" : "admin_condominio");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [planNombre, setPlanNombre] = useState<"Lobby" | "Torre" | "Penthouse">("Lobby");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isResidenteFlow) {
      setMode("signup");
      setSignupRole("residente");
    } else {
      setSignupRole("admin_condominio");
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
        if (signupRole === "admin_condominio") meta.plan_nombre = planNombre;
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg,#ffffff 0%,#F8FAFC 100%)" }}>
      <div className="w-full max-w-md bg-white shadow-lg rounded-3xl p-10">
        <div className="flex items-center gap-3 justify-center mb-2">
          <div className="w-11 h-11 rounded-xl bg-[#4A154B] flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div className="font-display font-extrabold text-2xl text-[#1D1C1D]">
            <span className="text-[#4A154B]">Altura</span><span className="text-[#4A154B]">Cloud</span>
          </div>
        </div>
        <p className="text-center text-sm text-[#64748B] mb-5">{isResidenteFlow ? "Ingresa con tu cuenta de residente o regístrate con tu código de invitación" : "Administración de condominios y CRM inmobiliario"}</p>

        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] rounded-full mb-6">
          <button
            type="button"
            onClick={() => { navigate({ to: "/login", search: {} }); }}
            className={`text-sm font-semibold py-2 rounded-full transition ${!isResidenteFlow ? "bg-[#4A154B] text-white shadow" : "text-[#4A154B] hover:bg-white/60"}`}
          >
            Administrador
          </button>
          <button
            type="button"
            onClick={() => { navigate({ to: "/login", search: { as: "residente" } }); }}
            className={`text-sm font-semibold py-2 rounded-full transition ${isResidenteFlow ? "bg-[#4A154B] text-white shadow" : "text-[#4A154B] hover:bg-white/60"}`}
          >
            Residente
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <>
              {signupRole === "residente" && (
                <div>
                  <label className="block text-sm font-medium text-[#4A154B] mb-1.5">Código de invitación</label>
                  <input value={invitationCode} onChange={(e) => setInvitationCode(e.target.value.toUpperCase())} required
                    placeholder="ABC123" maxLength={6}
                    className="w-full border border-[#E8E8E8] rounded-xl px-4 py-2.5 text-[#4A154B] font-mono tracking-widest uppercase outline-none focus:border-[#4A154B] focus:ring-2 focus:ring-[#4A154B]/20" />
                  <p className="text-xs text-[#64748B] mt-1.5">Tu administrador te lo envió por WhatsApp o correo.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#4A154B] mb-1.5">Nombre completo</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full border border-[#E8E8E8] rounded-xl px-4 py-2.5 text-[#4A154B] outline-none focus:border-[#4A154B] focus:ring-2 focus:ring-[#4A154B]/20" />
              </div>
              {signupRole === "admin_condominio" && (
                <div>
                  <label className="block text-sm font-medium text-[#4A154B] mb-1.5">Elige tu plan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { n: "Lobby", p: "$990" },
                      { n: "Torre", p: "$2,490" },
                      { n: "Penthouse", p: "$4,990" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.n}
                        type="button"
                        onClick={() => setPlanNombre(opt.n)}
                        className={`text-xs font-semibold px-2 py-2.5 rounded-xl border transition ${
                          planNombre === opt.n
                            ? "border-[#4A154B] bg-[#4A154B] text-white"
                            : "border-[#E2E8F0] text-[#1D1C1D] hover:border-[#4A154B]"
                        }`}
                      >
                        <div>{opt.n}</div>
                        <div className={`text-[10px] font-normal mt-0.5 ${planNombre === opt.n ? "text-white/80" : "text-[#64748B]"}`}>{opt.p}/mes</div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1.5">14 días de prueba gratis incluidos en todos los planes.</p>
                </div>
              )}
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-[#4A154B] mb-1.5">Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com"
              className="w-full border border-[#E8E8E8] rounded-xl px-4 py-2.5 text-[#4A154B] placeholder:text-[#64748B] outline-none focus:border-[#4A154B] focus:ring-2 focus:ring-[#4A154B]/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4A154B] mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full border border-[#E8E8E8] rounded-xl px-4 py-2.5 text-[#4A154B] outline-none focus:border-[#4A154B] focus:ring-2 focus:ring-[#4A154B]/20" />
          </div>
          <button type="submit" disabled={busy}
            className="w-full bg-[#4A154B] hover:bg-[#350d36] text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-60">
            {busy ? "Procesando…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full mt-4 text-sm text-[#64748B] hover:text-[#4A154B] transition-colors">
          {mode === "login" ? "¿No tienes cuenta? Crear una" : "¿Ya tienes cuenta? Iniciar sesión"}
        </button>

        <div className="mt-6 text-center text-xs text-[#64748B]">
          <Link to="/" className="hover:text-[#4A154B]">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
