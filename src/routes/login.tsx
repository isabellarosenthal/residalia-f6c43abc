import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Building } from "lucide-react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) navigate({ to: "/" }); }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenido");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Cuenta creada");
      }
      navigate({ to: "/" });
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
            <span className="text-[#2d1200]">Habita</span><span className="text-[#c94f0c]">Cloud</span>
          </div>
        </div>
        <p className="text-center text-sm text-[#9a7060] mb-8">Administración de condominios y CRM inmobiliario</p>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-[#2d1200] mb-1.5">Nombre completo</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full border border-[#c9b8b0] rounded-xl px-4 py-2.5 text-[#2d1200] outline-none focus:border-[#c94f0c] focus:ring-2 focus:ring-[#c94f0c]/20" />
            </div>
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
