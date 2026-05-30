import { Link } from "@tanstack/react-router";
import {
  Check, ArrowRight, Wallet, KeyRound, Users, Wrench, MessageSquare, Calendar,
  Building2, TrendingUp, FileText, BarChart3, ShieldCheck, Zap, Clock, HeartHandshake,
  Server,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import heroAstronaut from "@/assets/hero-astronaut.png";
import astronautChecklist from "@/assets/astronaut-checklist.png";
import logoUrl from "@/assets/altura-cloud-logo.png";

// Brand kit Altura Cloud v1.0
const C = {
  primary: "#4F46E5",      // Royal Blue
  primaryDark: "#4338CA",  // Deep Indigo
  primarySoft: "#7AA2FF",  // Cornflower Blue
  lavender: "#E9E2FF",     // Lavender Mist
  text: "#0F172A",         // Text Primary
  textMuted: "#475569",    // Text Secondary
  border: "#E2E8F0",
  surface: "#F1F5F9",
  success: "#16A34A",
  successBg: "#DCFCE7",
  info: "#3B82F6",
  warning: "#F59E0B",
  error: "#EF4444",
  neutral: "#8B5CF6",
};

const PLANS = [
  {
    id: "lobby",
    icon: "🚪",
    name: "Lobby",
    price: "990",
    tagline: "Para un condominio pequeño que quiere digitalizarse",
    cta: "Empezar con Lobby",
    highlight: false,
    limits: [
      "1 edificio",
      "Hasta 60 unidades",
      "2 administradores",
      "Soporte por WhatsApp (Lun–Vie)",
    ],
  },
  {
    id: "torre",
    icon: "🏢",
    name: "Torre",
    price: "2,490",
    tagline: "Para administradoras con varios edificios",
    cta: "Elegir Torre",
    highlight: true,
    limits: [
      "Hasta 3 edificios",
      "Hasta 150 unidades por edificio",
      "5 administradores",
      "Soporte prioritario WhatsApp (Lun–Sáb)",
    ],
  },
  {
    id: "penthouse",
    icon: "👑",
    name: "Penthouse",
    price: "4,990",
    tagline: "Para empresas administradoras con grandes carteras",
    cta: "Hablar con ventas",
    highlight: false,
    limits: [
      "Edificios ilimitados",
      "Unidades ilimitadas",
      "Administradores ilimitados",
      "Gerente de cuenta dedicado",
      "Soporte 24/7",
    ],
  },
];

const FEATURE_ICONS = [
  { i: Wallet, t: "Cobros y estados de cuenta", d: "Genera cuotas mensuales en lote, registra pagos, emite recibos y controla morosidad en tiempo real.", link: "Ver cobros", iconBg: C.success },
  { i: KeyRound, t: "Control de accesos con QR", d: "Autoriza visitantes con códigos QR de un solo uso, controla entradas y salidas, lleva bitácora completa.", link: "Ver accesos", iconBg: C.primary },
  { i: Users, t: "Residentes y unidades", d: "Lleva un padrón limpio de propietarios, inquilinos, vehículos y personas autorizadas por cada unidad.", link: "Ver residentes", iconBg: C.neutral },
  { i: Wrench, t: "Mantenimiento e incidencias", d: "Levanta tickets, asigna proveedores, controla costos estimados vs reales y cierra órdenes con evidencia.", link: "Ver tickets", iconBg: C.warning },
  { i: MessageSquare, t: "Comunicados al condominio", d: "Envía avisos por grupo de residentes — emergencias, asambleas, cortes de servicio — con historial completo.", link: "Ver comunicados", iconBg: C.info },
  { i: Calendar, t: "Reserva de áreas comunes", d: "Salón social, gimnasio, piscina o cancha: los residentes ven disponibilidad y reservan en minutos.", link: "Ver áreas", iconBg: C.primarySoft },
  { i: Building2, t: "CRM inmobiliario", d: "Pública las unidades en venta o renta, captura prospectos por origen, asígnales agente y precio.", link: "Ver CRM", iconBg: C.primaryDark },
  { i: TrendingUp, t: "Pipeline y agenda", d: "Arrastra prospectos entre etapas (nuevo → visita → oferta → cierre) y agenda visitas con recordatorios.", link: "Ver pipeline", iconBg: C.error },
  { i: BarChart3, t: "Reportes y KPIs", d: "Flujo de caja, ocupación, cartera vencida, conversión del pipeline. Exporta a PDF o CSV.", link: "Ver reportes", iconBg: C.primary },
];

export function LandingPage() {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-white text-[#0F172A] relative overflow-x-hidden">
      {/* Ambient gradient orbs (global) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full opacity-40 blur-3xl float-slow" style={{ background: "radial-gradient(circle, #7AA2FF 0%, transparent 70%)" }} />
        <div className="absolute top-[40%] -right-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl float-med" style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/3 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl float-fast" style={{ background: "radial-gradient(circle, #E9E2FF 0%, transparent 70%)" }} />
      </div>
      {/* Nav */}
      <header className="border-b border-white/40 bg-white/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Altura Cloud" width={32} height={32} className="w-8 h-8" />
            <div className="font-display font-extrabold text-xl text-[#0F172A]">Altura Cloud</div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#475569]">
            <a href="#funciones" className="hover:text-[#4F46E5]">Funciones</a>
            <a href="#planes" className="hover:text-[#4F46E5]">Precios</a>
            <a href="#faq" className="hover:text-[#4F46E5]">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-semibold bg-[#4F46E5] text-white px-5 py-2.5 rounded-full hover:bg-[#4338CA] shadow-sm transition-colors">
                  Ir al Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm font-medium text-[#475569] hover:text-[#4F46E5] px-3 py-1.5"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <div className="relative group">
                  <button
                    type="button"
                    className="text-sm font-medium text-[#475569] hover:text-[#4F46E5] px-3 py-1.5 inline-flex items-center gap-1"
                  >
                    Iniciar sesión
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full pt-2 w-56 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 focus-within:visible focus-within:opacity-100 focus-within:translate-y-0 transition">
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-lg overflow-hidden">
                      <Link to="/login" className="block px-4 py-3 text-sm hover:bg-[#E9E2FF]">
                        <div className="font-semibold text-[#0F172A]">Como administrador</div>
                        <div className="text-xs text-[#475569] mt-0.5">Gestiona tu condominio</div>
                      </Link>
                      <div className="border-t border-[#E2E8F0]" />
                      <Link to="/login" search={{ as: "residente" }} className="block px-4 py-3 text-sm hover:bg-[#E9E2FF]">
                        <div className="font-semibold text-[#0F172A]">Como residente</div>
                        <div className="text-xs text-[#475569] mt-0.5">Portal de residentes</div>
                      </Link>
                    </div>
                  </div>
                </div>

                <Link to="/login" search={{ mode: "signup" }} className="text-sm font-semibold bg-[#4F46E5] text-white px-5 py-2.5 rounded-full hover:bg-[#4338CA] shadow-sm transition-colors">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-12">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="text-center md:text-left">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-[#E9E2FF] text-[#4338CA] px-3 py-1 rounded-full mb-5">
              Hecho en Honduras 🇭🇳
            </span>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-[#0F172A]">
              Administra tu condominio sin hojas de cálculo.
            </h1>
            <p className="mt-6 text-lg text-[#475569] max-w-xl mx-auto md:mx-0">
              Cobros, accesos, residentes, mantenimiento y propiedades en venta o renta —
              todo desde un solo panel con CRM inmobiliario integrado.
            </p>
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
              <Link to="/login" search={{ mode: "signup" }} className="inline-flex items-center gap-2 bg-[#4F46E5] text-white px-7 py-3.5 rounded-full font-semibold hover:bg-[#4338CA] shadow-md transition-colors">
                Crear mi cuenta gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#planes" className="inline-flex items-center gap-2 border border-[#E2E8F0] bg-white px-6 py-3 rounded-full font-semibold text-[#0F172A] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors">
                Ver planes
              </a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-[#475569]">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#16A34A]" /> Sin tarjeta de crédito</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#16A34A]" /> Listo en 5 minutos</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#16A34A]" /> Soporte en español</span>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroAstronaut}
              alt="Astronauta mascota de Altura Cloud saludando"
              width={1280}
              height={1024}
              className="relative w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="relative overflow-hidden py-14" style={{ background: "linear-gradient(135deg, #7AA2FF 0%, #4F46E5 100%)" }}>
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[#8B5CF6]/30 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center relative">
          {[
            { n: "13+", l: "Módulos integrados" },
            { n: "100%", l: "Aislado por condominio" },
            { n: "L", l: "Lempiras nativos" },
            { n: "24/7", l: "Acceso desde la nube" },
          ].map((s) => (
            <div key={s.l} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-6 px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              <div className="font-display font-extrabold text-4xl text-white drop-shadow">{s.n}</div>
              <div className="text-xs uppercase tracking-wider text-[#E9E2FF] mt-2 font-semibold">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What is Altura Cloud */}
      <section id="funciones" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[#0F172A]">Todo lo que necesita un edificio, en un solo lugar</h2>
          <p className="mt-3 text-[#475569]">
            Reemplaza WhatsApp, Excel y cuadernos por un sistema que ordena la operación
            financiera, comercial y de seguridad de tu condominio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_ICONS.map((f) => (
            <div
              key={f.t}
              className="group rounded-[1.75rem] p-7 flex flex-col min-h-[260px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_8px_30px_-12px_rgba(67,56,202,0.15)]"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm text-white"
                style={{ backgroundColor: f.iconBg }}
              >
                <f.i className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-xl leading-tight text-[#0F172A]">{f.t}</h3>
              <p className="text-sm mt-2 leading-relaxed text-[#475569]">{f.d}</p>
              <Link to="/login" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#4F46E5] hover:text-[#4338CA]">
                {f.link} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden py-20" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(233,226,255,0.6) 50%, transparent 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[#0F172A] tracking-tight">Empieza a operar hoy mismo</h2>
            <p className="mt-3 text-lg text-[#475569]">Configuración guiada en cuatro simples pasos.</p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { n: "1", t: "Crea tu cuenta", d: "Tu espacio privado y seguro listo en segundos." },
              { n: "2", t: "Registra el edificio", d: "Define unidades y cuotas de mantenimiento." },
              { n: "3", t: "Suma residentes", d: "Invita a propietarios y carga sus contactos." },
              { n: "4", t: "Genera cobros", d: "Emite cuotas masivas con un solo clic." },
            ].map((s) => (
              <li key={s.n} className="group flex flex-col items-start text-left bg-white/60 backdrop-blur-xl border border-white/70 rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(67,56,202,0.15)] hover:-translate-y-1 hover:shadow-2xl transition-all">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-display font-extrabold text-xl mb-5 shadow-lg group-hover:scale-110 transition-transform" style={{ background: "linear-gradient(135deg, #4F46E5, #7AA2FF)" }}>
                  {s.n}
                </div>
                <h3 className="font-display font-bold text-xl text-[#0F172A] mb-2">{s.t}</h3>
                <p className="text-[#475569] leading-relaxed text-sm">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why Altura Cloud */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="relative rounded-[2.5rem] p-10 md:p-16 overflow-hidden" style={{ background: "linear-gradient(135deg, #4338CA 0%, #4F46E5 55%, #7AA2FF 100%)" }}>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#7AA2FF] rounded-full opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#8B5CF6] rounded-full opacity-20 blur-3xl pointer-events-none" />
          <div className="text-center mb-14 relative">
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white tracking-tight">¿Por qué Altura Cloud?</h2>
            <p className="mt-3 text-lg text-[#E9E2FF]">La plataforma diseñada para la realidad de Honduras.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {[
              { i: ShieldCheck, t: "Privacidad total", d: "Tus datos están 100% aislados. Nadie externo tiene acceso a tu información." },
              { i: Zap, t: "ADN Hondureño", d: "Lempiras, leyes locales y conceptos adaptados a nuestra normativa." },
              { i: Clock, t: "100% en la Nube", d: "Sin instalaciones. Accede desde cualquier lugar mediante móvil o web." },
              { i: HeartHandshake, t: "Soporte Real", d: "Ayuda directa por WhatsApp en horario local. Cero robots, solo expertos." },
            ].map((b) => (
              <div key={b.t} className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_20px_40px_-20px_rgba(0,0,0,0.3)] group">
                <div className="w-14 h-14 mb-5 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-[#E9E2FF] group-hover:text-white group-hover:scale-110 transition-all">
                  <b.i className="w-7 h-7" strokeWidth={2} />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-2">{b.t}</h3>
                <p className="text-[#E9E2FF] leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planes" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[#0F172A]">Planes simples y honestos</h2>
          <p className="mt-3 text-[#475569]">Elige el que te queda. Cambia cuando quieras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((p) => {
            const palette = p.highlight
              ? { bg: "#4338CA", fg: "#ffffff", sub: "#E9E2FF", check: "#7AA2FF", btnBg: "#ffffff", btnFg: "#4338CA", btnHover: "hover:bg-[#E9E2FF]", iconBg: "rgba(255,255,255,0.15)", priceColor: "#ffffff" }
              : { bg: "rgba(255,255,255,0.6)", fg: "#0F172A", sub: "#475569", check: "#16A34A", btnBg: "#4F46E5", btnFg: "#ffffff", btnHover: "hover:bg-[#4338CA]", iconBg: "#E9E2FF", priceColor: "#0F172A" };
            return (
              <div
                key={p.id}
                className={`rounded-[1.75rem] p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border ${p.highlight ? "shadow-2xl scale-[1.02] border-white/30" : "shadow-[0_8px_30px_-12px_rgba(67,56,202,0.18)] border-white/70 backdrop-blur-xl"}`}
                style={{ background: p.highlight ? "linear-gradient(160deg, #4338CA 0%, #4F46E5 60%, #7AA2FF 130%)" : palette.bg, color: palette.fg }}
              >
                {p.highlight && (
                  <span className="self-start text-xs font-bold uppercase tracking-wider bg-[#E9E2FF] text-[#4338CA] px-3 py-1 rounded-full mb-4">
                    Más popular
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ backgroundColor: palette.iconBg }}>
                  {p.icon}
                </div>
                <h3 className="font-display font-extrabold text-2xl" style={{ color: palette.fg }}>{p.name}</h3>
                <p className="text-sm mt-1 min-h-[2.5rem]" style={{ color: palette.sub }}>{p.tagline}</p>
                <div className="mt-5">
                  <span className="text-5xl font-extrabold" style={{ color: palette.priceColor }}>L {p.price}</span>
                  <span className="text-sm ml-1" style={{ color: palette.sub }}>/mes</span>
                </div>
                <ul className="mt-6 space-y-2.5 flex-1">
                  {p.limits.map((l) => (
                    <li key={l} className="flex items-start gap-2 text-sm" style={{ color: palette.fg }}>
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: palette.check }} />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className={`mt-7 text-center font-semibold py-3 rounded-full transition-colors ${palette.btnHover}`}
                  style={{ backgroundColor: palette.btnBg, color: palette.btnFg }}
                >
                  {p.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-[#F1F5F9] border-t border-[#E2E8F0] py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-center">
          <div>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-12 text-[#0F172A]">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {[
                { q: "¿Mis datos están seguros y separados de otros condominios?", a: "Sí. Cada cuenta tiene su propio espacio aislado. Las políticas de seguridad a nivel de base de datos impiden que un usuario vea información de otro, aunque conozca los IDs." },
                { q: "¿Necesito instalar algo?", a: "No. Todo corre en la nube. Abrís el navegador, iniciás sesión y listo. Funciona en Windows, Mac y celulares." },
                { q: "¿Puedo administrar más de un condominio con una sola cuenta?", a: "Sí, desde el plan Torre podés tener hasta 5 condominios. El plan Penthouse es ilimitado." },
                { q: "¿Puedo invitar a otros usuarios a mi cuenta?", a: "Sí. Podés agregar miembros (administradores, conserjes, agentes inmobiliarios) según los límites de tu plan." },
                { q: "¿Puedo cambiar o cancelar mi plan después?", a: "Sí, en cualquier momento. Te cobramos sólo lo del mes en curso." },
                { q: "¿Manejan lempiras y conceptos hondureños?", a: "Sí. La plataforma está hecha en Honduras, para Honduras: lempiras nativos, IVA, cuotas extraordinarias, mora, todo en español." },
              ].map((f) => (
                <details key={f.q} className="group bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#4F46E5] transition">
                  <summary className="font-semibold cursor-pointer flex justify-between items-center text-[#0F172A]">
                    {f.q}
                    <span className="text-[#4F46E5] group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-[#475569]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <img src={astronautChecklist} alt="Astronauta con checklist" className="w-[420px] xl:w-[520px] 2xl:w-[600px] h-auto" />
          </div>
        </div>
      </section>

      {/* Preview cards */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[#0F172A]">Un vistazo a lo que vas a usar</h2>
          <p className="mt-3 text-[#475569]">Tres módulos centrales del panel, exactamente como los vas a ver.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Cobros */}
          <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-3xl p-8 flex flex-col">
            <h3 className="font-display font-extrabold text-2xl text-[#0F172A]">Cobros en un clic</h3>
            <p className="mt-2 text-sm text-[#475569]">Genera las cuotas del mes para todas las unidades ocupadas y controla quién pagó.</p>
            <Link to="/login" className="mt-3 text-sm font-semibold text-[#4F46E5] inline-flex items-center gap-1 hover:gap-2 transition-all">Ver cobros <ArrowRight className="w-4 h-4" /></Link>
            <div className="mt-6 bg-white rounded-2xl shadow-lg p-4 border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-[#0F172A]">Cobros · Noviembre</div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E9E2FF] text-[#4338CA] px-2 py-0.5 rounded-full">42 unidades</span>
              </div>
              <div className="space-y-2">
                {[
                  { u: "A-101", n: "M. López", m: "L 3,200", s: "pagado" },
                  { u: "A-204", n: "J. Mejía", m: "L 3,200", s: "pagado" },
                  { u: "B-305", n: "K. Núñez", m: "L 4,500", s: "pendiente" },
                  { u: "B-402", n: "R. Cruz", m: "L 3,200", s: "moroso" },
                ].map((r) => (
                  <div key={r.u} className="flex items-center justify-between text-xs py-1.5 border-b border-[#F1F5F9] last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#E9E2FF] text-[#4338CA] flex items-center justify-center text-[9px] font-bold">{r.u}</div>
                      <span className="text-[#0F172A]">{r.n}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0F172A]">{r.m}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${r.s === "pagado" ? "bg-[#DCFCE7] text-[#166534]" : r.s === "pendiente" ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#FEE2E2] text-[#991B1B]"}`}>{r.s}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Accesos QR (indigo destacado) */}
          <div className="bg-[#4338CA] rounded-3xl p-8 flex flex-col text-white">
            <h3 className="font-display font-extrabold text-2xl text-white">Accesos con QR</h3>
            <p className="mt-2 text-sm text-[#E9E2FF]">Tus residentes generan códigos de un solo uso desde el celular. Tu guardia los valida en 2 segundos.</p>
            <Link to="/login" className="mt-3 text-sm font-semibold text-white inline-flex items-center gap-1 hover:gap-2 transition-all">Ver accesos <ArrowRight className="w-4 h-4" /></Link>
            <div className="mt-6 bg-white rounded-2xl shadow-2xl p-5 text-[#0F172A]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold">Pase #A7F2K9</div>
                <span className="text-[10px] font-bold uppercase bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded-full">Válido</span>
              </div>
              <div className="bg-[#F1F5F9] rounded-xl p-4 flex items-center justify-center mb-3">
                <div className="w-28 h-28 grid grid-cols-8 gap-px bg-[#4338CA] p-1.5 rounded-lg">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const seed = (i * 73 + 17) % 100;
                    return <div key={i} className={seed > 45 ? "bg-white" : "bg-[#4338CA]"} />;
                  })}
                </div>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between"><span className="text-[#475569]">Visitante</span><span className="font-semibold">Carlos Ramírez</span></div>
                <div className="flex justify-between"><span className="text-[#475569]">Unidad</span><span className="font-semibold">B-305</span></div>
                <div className="flex justify-between"><span className="text-[#475569]">Vence</span><span className="font-semibold">Hoy · 8:00 PM</span></div>
              </div>
            </div>
          </div>

          {/* Card 3: Pipeline */}
          <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-3xl p-8 flex flex-col">
            <h3 className="font-display font-extrabold text-2xl text-[#0F172A]">Pipeline inmobiliario</h3>
            <p className="mt-2 text-sm text-[#475569]">Arrastra prospectos entre etapas, agenda visitas y nunca pierdas una venta o renta.</p>
            <Link to="/login" className="mt-3 text-sm font-semibold text-[#4F46E5] inline-flex items-center gap-1 hover:gap-2 transition-all">Ver pipeline <ArrowRight className="w-4 h-4" /></Link>
            <div className="mt-6 bg-white rounded-2xl shadow-lg p-3 border border-[#E2E8F0]">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { t: "Nuevo", c: "#E9E2FF", items: [{ n: "A. Pérez", m: "L 1.2M" }, { n: "L. Gómez", m: "L 850K" }] },
                  { t: "Visita", c: "#DBEAFE", items: [{ n: "M. Soto", m: "L 2.1M" }] },
                  { t: "Cierre", c: "#DCFCE7", items: [{ n: "J. Ríos", m: "L 1.6M" }] },
                ].map((col) => (
                  <div key={col.t} className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#475569] px-1">{col.t}</div>
                    {col.items.map((it) => (
                      <div key={it.n} className="rounded-lg p-2 text-[10px]" style={{ background: col.c }}>
                        <div className="font-semibold text-[#0F172A]">{it.n}</div>
                        <div className="text-[#475569] mt-0.5">{it.m}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA final */}
        <div className="mt-16 bg-[#4338CA] rounded-[2.5rem] p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#7AA2FF] rounded-full opacity-20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#8B5CF6] rounded-full opacity-20 blur-3xl pointer-events-none" />
          <h3 className="font-display font-extrabold text-3xl md:text-4xl text-white relative">¿Listo para ordenar tu condominio?</h3>
          <p className="mt-3 text-[#E9E2FF] max-w-xl mx-auto relative">Crea tu cuenta gratis y configurá tu primer edificio en menos de 5 minutos.</p>
          <Link to="/login" className="mt-7 inline-flex items-center gap-2 bg-white text-[#4338CA] px-9 py-4 rounded-full font-semibold text-lg hover:bg-[#E9E2FF] shadow-lg relative transition-colors">
            Empezar ahora <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-4">
              <div className="font-display font-extrabold text-2xl text-[#0F172A]">Altura Cloud</div>
              <p className="text-sm text-[#475569] leading-relaxed">
                Plataforma de administración de condominios y propiedades para Centroamérica.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">Ecosistema Zafra Cloud</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { name: "Zafra Cloud", desc: "ERP, facturación electrónica y contabilidad", url: "https://home.zafra.cloud", icon: Building2 },
                  { name: "Firmax Cloud", desc: "Firma digital de documentos", url: "https://firmax.cloud", icon: FileText },
                  { name: "TecniCloud", desc: "Software de Mantenimiento", url: "https://tecnicloud.com", icon: Server },
                  { name: "Altura Cloud", desc: "Administración de condominios", url: "https://alturacloud.app", icon: KeyRound },
                  { name: "Trabajos Honduras", desc: "Reclutamiento y vacantes", url: "https://trabajoshonduras.com", icon: Users },
                ].map((l) => {
                  const Icon = l.icon;
                  return (
                    <li key={l.name}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2 text-[#475569] hover:text-[#4F46E5] transition">
                        <Icon className="h-4 w-4 mt-0.5 text-[#4F46E5]/70 group-hover:text-[#4F46E5] flex-shrink-0" />
                        <div>
                          <span className="font-medium text-[#0F172A] group-hover:text-[#4F46E5]">{l.name}</span>
                          <p className="text-xs text-[#475569]">{l.desc}</p>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">Altura Cloud</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#planes" className="text-[#475569] hover:text-[#4F46E5] transition">Planes</a></li>
                <li><a href="#funciones" className="text-[#475569] hover:text-[#4F46E5] transition">Cómo funciona</a></li>
                <li><Link to="/login" className="text-[#475569] hover:text-[#4F46E5] transition">Iniciar sesión</Link></li>
                <li><Link to="/login" className="text-[#475569] hover:text-[#4F46E5] transition">Crear cuenta</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider">Contacto</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="mailto:info@zafra.cloud" className="flex items-center gap-2 text-[#475569] hover:text-[#4F46E5] transition">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    info@zafra.cloud
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/50494103488" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#475569] hover:text-[#4F46E5] transition">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    WhatsApp ventas
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/50494460058" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#475569] hover:text-[#4F46E5] transition">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    +504 9446-0058
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#475569]">
              <p>© {new Date().getFullYear()} New Technology, S.A. Parte de <a href="https://home.zafra.cloud" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">Zafra Cloud</a>.</p>
              <p className="flex items-center gap-1.5">Hecho con ❤️ en Honduras 🇭🇳</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
