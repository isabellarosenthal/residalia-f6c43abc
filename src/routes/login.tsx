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

        {!isResidenteFlow && (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#E2E8F0]" />
              <span className="text-xs text-[#64748B]">o</span>
              <div className="flex-1 h-px bg-[#E2E8F0]" />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const result = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (result.error) throw new Error(result.error.message ?? "Error con Google");
                  if (result.redirected) return;
                } catch (err: any) {
                  toast.error(err?.message ?? "Error con Google");
                } finally { setBusy(false); }
              }}
              className="w-full flex items-center justify-center gap-3 border border-[#E2E8F0] hover:border-[#4A154B] bg-white text-[#1D1C1D] font-semibold py-3 rounded-full transition-colors disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
              Continuar con Google
            </button>
          </>
        )}

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
