import { Link } from "@tanstack/react-router";
import {
  Check, ArrowRight, Wallet, KeyRound, Users, Wrench, MessageSquare, Calendar,
  Building2, TrendingUp, FileText, BarChart3, ShieldCheck, Zap, Clock, HeartHandshake,
  Server,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import heroAstronaut from "@/assets/hero-astronaut.png";
import logoUrl from "@/assets/altura-cloud-logo.png";

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

export function LandingPage() {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#2D3748]">
      {/* Nav */}
      <header className="border-b border-[#E2E8F0] bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Altura Cloud" width={32} height={32} className="w-8 h-8" />
            <div className="font-display font-extrabold text-xl">Altura Cloud</div>
          </div>

          {/* Menú central */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#1E293B]">
            <a href="#funciones" className="hover:text-[#2D3748]">Funciones</a>
            <a href="#planes" className="hover:text-[#2D3748]">Precios</a>
            <a href="#faq" className="hover:text-[#2D3748]">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-semibold bg-[#D97757] text-[#2D3748] px-5 py-2.5 rounded-full hover:bg-[#E8916F] shadow-sm">
                  Ir al Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm font-medium text-[#1E293B] hover:text-[#2D3748] px-3 py-1.5"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                {/* Dropdown Iniciar sesión */}
                <div className="relative group">
                  <button
                    type="button"
                    className="text-sm font-medium text-[#1E293B] hover:text-[#2D3748] px-3 py-1.5 inline-flex items-center gap-1"
                  >
                    Iniciar sesión
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full pt-2 w-56 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 focus-within:visible focus-within:opacity-100 focus-within:translate-y-0 transition">
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-lg overflow-hidden">
                      <Link to="/login" className="block px-4 py-3 text-sm text-[#2D3748] hover:bg-[#fff4ec]">
                        <div className="font-semibold">Como administrador</div>
                        <div className="text-xs text-[#64748B] mt-0.5">Gestiona tu condominio</div>
                      </Link>
                      <div className="border-t border-[#f0e6df]" />
                      <Link to="/login" search={{ as: "residente" }} className="block px-4 py-3 text-sm text-[#2D3748] hover:bg-[#fff4ec]">
                        <div className="font-semibold">Como residente</div>
                        <div className="text-xs text-[#64748B] mt-0.5">Portal de residentes</div>
                      </Link>
                    </div>
                  </div>
                </div>

                <Link to="/login" className="text-sm font-semibold bg-[#D97757] text-[#2D3748] px-5 py-2.5 rounded-full hover:bg-[#E8916F] shadow-sm">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="text-center md:text-left">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-[#F8FAFC] text-[#2D3748] px-3 py-1 rounded-full mb-5">
              Hecho en Honduras 🇭🇳
            </span>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] text-[#2D3748]">
              Administra tu condominio sin hojas de cálculo.
            </h1>
            <p className="mt-6 text-lg text-[#64748B] max-w-xl mx-auto md:mx-0">
              💰 Cobros, 🔑 accesos, 👥 residentes, 🔧 mantenimiento y 🏘️ propiedades en venta o renta —
              todo desde un solo panel con CRM inmobiliario integrado.
            </p>
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 bg-[#2D3748] text-white px-7 py-3.5 rounded-full font-semibold hover:bg-[#1F2937] shadow-md">
                Crear mi cuenta gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#planes" className="inline-flex items-center gap-2 border border-[#E2E8F0] bg-white px-6 py-3 rounded-full font-semibold text-[#1E293B] hover:border-[#D97757]">
                Ver planes
              </a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-[#64748B]">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#166534]" /> Sin tarjeta de crédito</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#166534]" /> Listo en 5 minutos</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#166534]" /> Soporte en español</span>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroCondo}
              alt="Ilustración de condominio administrado con Altura Cloud"
              width={1280}
              height={1024}
              className="relative w-full h-auto"
              style={{ maskImage: 'radial-gradient(ellipse 80% 75% at center, black 60%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 75% at center, black 60%, transparent 100%)' }}
            />
            <img src={logoUrl} alt="" aria-hidden width={120} height={120} className="absolute -top-6 -right-2 w-24 md:w-32 h-auto float-slow drop-shadow-xl pointer-events-none" />
            <img src={logoUrl} alt="" aria-hidden width={80} height={80} className="absolute bottom-4 -left-4 w-16 md:w-20 h-auto float-fast opacity-90 pointer-events-none" />
          </div>





        </div>
      </section>

      {/* Stats band */}
      <section className="relative overflow-hidden bg-[#2D3748] text-[#F8FAFC] py-10">
        <img src={logoUrl} alt="" aria-hidden width={140} height={140} className="absolute -top-6 right-8 w-28 h-auto float-med opacity-90 pointer-events-none hidden md:block" />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative">
          {[
            { n: "13+", l: "Módulos integrados" },
            { n: "100%", l: "Aislado por condominio" },
            { n: "L", l: "Lempiras nativos" },
            { n: "24/7", l: "Acceso desde la nube" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display font-extrabold text-3xl text-white">{s.n}</div>
              <div className="text-xs uppercase tracking-wider text-[#D97757] mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What is Altura Cloud */}
      <section id="funciones" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl">Todo lo que necesita un edificio, en un solo lugar</h2>
          <p className="mt-3 text-[#64748B]">
            Reemplaza WhatsApp, Excel y cuadernos por un sistema que ordena la operación
            financiera, comercial y de seguridad de tu condominio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { i: Wallet, t: "Cobros y estados de cuenta", d: "Genera cuotas mensuales en lote, registra pagos, emite recibos y controla morosidad en tiempo real.", bg: "#F8F7F5", fg: "#2D3748", sub: "#64748B", accent: "#2D3748", link: "Ver cobros", iconBg: "#16a34a", iconFg: "#ffffff" },
            { i: KeyRound, t: "Control de accesos con QR", d: "Autoriza visitantes con códigos QR de un solo uso, controla entradas y salidas, lleva bitácora completa.", bg: "#F8F7F5", fg: "#2D3748", sub: "#64748B", accent: "#2D3748", link: "Ver accesos", iconBg: "#D97757", iconFg: "#2D3748" },
            { i: Users, t: "Residentes y unidades", d: "Lleva un padrón limpio de propietarios, inquilinos, vehículos y personas autorizadas por cada unidad.", bg: "#F8F7F5", fg: "#2D3748", sub: "#64748B", accent: "#2D3748", link: "Ver residentes", iconBg: "#8b5cf6", iconFg: "#ffffff" },
            { i: Wrench, t: "Mantenimiento e incidencias", d: "Levanta tickets, asigna proveedores, controla costos estimados vs reales y cierra órdenes con evidencia.", bg: "#F8F7F5", fg: "#2D3748", sub: "#64748B", accent: "#2D3748", link: "Ver tickets", iconBg: "#f97316", iconFg: "#ffffff" },
            { i: MessageSquare, t: "Comunicados al condominio", d: "Envía avisos por grupo de residentes — emergencias, asambleas, cortes de servicio — con historial completo.", bg: "#F8F7F5", fg: "#2D3748", sub: "#64748B", accent: "#2D3748", link: "Ver comunicados", iconBg: "#0ea5e9", iconFg: "#ffffff" },
            { i: Calendar, t: "Reserva de áreas comunes", d: "Salón social, gimnasio, piscina o cancha: los residentes ven disponibilidad y reservan en minutos.", bg: "#F8F7F5", fg: "#2D3748", sub: "#64748B", accent: "#2D3748", link: "Ver áreas", iconBg: "#ec4899", iconFg: "#ffffff" },
            { i: Building2, t: "CRM inmobiliario", d: "Pública las unidades en venta o renta, captura prospectos por origen, asígnales agente y precio.", bg: "#F8F7F5", fg: "#2D3748", sub: "#64748B", accent: "#2D3748", link: "Ver CRM", iconBg: "#14b8a6", iconFg: "#ffffff" },
            { i: TrendingUp, t: "Pipeline y agenda", d: "Arrastra prospectos entre etapas (nuevo → visita → oferta → cierre) y agenda visitas con recordatorios.", bg: "#F8F7F5", fg: "#2D3748", sub: "#64748B", accent: "#2D3748", link: "Ver pipeline", iconBg: "#ef4444", iconFg: "#ffffff" },
            { i: BarChart3, t: "Reportes y KPIs", d: "Flujo de caja, ocupación, cartera vencida, conversión del pipeline. Exporta a PDF o CSV.", bg: "#F8F7F5", fg: "#2D3748", sub: "#64748B", accent: "#2D3748", link: "Ver reportes", iconBg: "#6366f1", iconFg: "#ffffff" },
          ].map((f) => {
            
            return (
            <div
              key={f.t}
              className="rounded-[1.75rem] p-7 flex flex-col min-h-[260px] transition hover:-translate-y-1 hover:shadow-xl bg-[#F8F7F5]"
              style={{ color: f.fg }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-sm"
                style={{ backgroundColor: f.iconBg, color: f.iconFg }}
              >
                <f.i className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-xl leading-tight text-[#2D3748]">{f.t}</h3>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: f.sub }}>{f.d}</p>
              <Link to="/login" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: f.accent }}>
                {f.link} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden bg-white py-20">
        <img src={logoUrl} alt="" aria-hidden width={100} height={100} className="absolute top-10 left-4 w-16 md:w-24 h-auto float-slow opacity-80 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[#2D3748] tracking-tight">Empieza a operar hoy mismo</h2>
            <p className="mt-3 text-lg text-[#64748B]">Configuración guiada en cuatro simples pasos.</p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { n: "1", t: "Crea tu cuenta", d: "Tu espacio privado y seguro listo en segundos." },
              { n: "2", t: "Registra el edificio", d: "Define unidades y cuotas de mantenimiento." },
              { n: "3", t: "Suma residentes", d: "Invita a propietarios y carga sus contactos." },
              { n: "4", t: "Genera cobros", d: "Emite cuotas masivas con un solo clic." },
            ].map((s) => (
              <li key={s.n} className="group flex flex-col items-start text-left">
                <div className="w-14 h-14 rounded-2xl bg-[#D97757] flex items-center justify-center text-[#2D3748] font-display font-extrabold text-xl mb-6 shadow-lg shadow-yellow-200/50 group-hover:scale-110 transition-transform">
                  {s.n}
                </div>
                <h3 className="font-display font-bold text-xl text-[#2D3748] mb-2">{s.t}</h3>
                <p className="text-[#64748B] leading-relaxed">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why Altura Cloud */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="relative bg-[#2D3748] rounded-[2.5rem] p-10 md:p-16 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D97757] rounded-full opacity-10 blur-3xl pointer-events-none" />
          <div className="text-center mb-14 relative">
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white tracking-tight">¿Por qué Altura Cloud?</h2>
            <p className="mt-3 text-lg text-slate-300">La plataforma diseñada para la realidad de Honduras.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {[
              { i: ShieldCheck, t: "Privacidad total", d: "Tus datos están 100% aislados. Nadie externo tiene acceso a tu información." },
              { i: Zap, t: "ADN Hondureño", d: "Lempiras, leyes locales y conceptos adaptados a nuestra normativa." },
              { i: Clock, t: "100% en la Nube", d: "Sin instalaciones. Accede desde cualquier lugar mediante móvil o web." },
              { i: HeartHandshake, t: "Soporte Real", d: "Ayuda directa por WhatsApp en horario local. Cero robots, solo expertos." },
            ].map((b) => (
              <div key={b.t} className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group">
                <div className="w-12 h-12 mb-5 text-[#D97757]">
                  <b.i className="w-full h-full" strokeWidth={2} />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-2 group-hover:text-[#D97757] transition-colors">{b.t}</h3>
                <p className="text-slate-400 leading-relaxed">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>




      {/* Plans */}
      <section id="planes" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl">Planes simples y honestos</h2>
          <p className="mt-3 text-[#64748B]">Elige el que te queda. Cambia cuando quieras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((p, idx) => {
            const palette = p.highlight
              ? { bg: "#2D3748", fg: "#ffffff", sub: "#9aa8c2", check: "#D97757", btnBg: "#ffffff", btnFg: "#2D3748", btnHover: "hover:bg-[#F1F5F9]", iconBg: "rgba(255,214,10,0.15)" }
              : idx === 0
              ? { bg: "#F8F7F5", fg: "#2D3748", sub: "#64748B", check: "#2D3748", btnBg: "#2D3748", btnFg: "#ffffff", btnHover: "hover:bg-[#1F2937]", iconBg: "rgba(10,30,63,0.08)" }
              : { bg: "#F8FAFC", fg: "#2D3748", sub: "#64748B", check: "#2D3748", btnBg: "#2D3748", btnFg: "#ffffff", btnHover: "hover:bg-[#1F2937]", iconBg: "rgba(10,30,63,0.08)" };
            return (
              <div
                key={p.id}
                className={`rounded-[1.75rem] p-8 flex flex-col transition hover:-translate-y-1 hover:shadow-2xl ${p.highlight ? "shadow-xl scale-[1.02]" : "shadow-sm"}`}
                style={{ backgroundColor: palette.bg, color: palette.fg }}
              >
                {p.highlight && (
                  <span className="self-start text-xs font-bold uppercase tracking-wider bg-[#D97757] text-[#2D3748] px-3 py-1 rounded-full mb-4">
                    Más popular
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3" style={{ backgroundColor: palette.iconBg }}>
                  {p.icon}
                </div>
                <h3 className="font-display font-extrabold text-2xl" style={{ color: palette.fg }}>{p.name}</h3>
                <p className="text-sm mt-1 min-h-[2.5rem]" style={{ color: palette.sub }}>{p.tagline}</p>
                <div className="mt-5">
                  <span className="text-5xl font-extrabold">L {p.price}</span>
                  <span className="text-sm ml-1" style={{ color: palette.sub }}>/mes</span>
                </div>
                <ul className="mt-6 space-y-2.5 flex-1">
                  {p.limits.map((l) => (
                    <li key={l} className="flex items-start gap-2 text-sm">
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
      <section id="faq" className="bg-white border-t border-[#E2E8F0] py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-center mb-12">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: "¿Mis datos están seguros y separados de otros condominios?", a: "Sí. Cada cuenta tiene su propio espacio aislado. Las políticas de seguridad a nivel de base de datos impiden que un usuario vea información de otro, aunque conozca los IDs." },
              { q: "¿Necesito instalar algo?", a: "No. Todo corre en la nube. Abrís el navegador, iniciás sesión y listo. Funciona en Windows, Mac y celulares." },
              { q: "¿Puedo administrar más de un condominio con una sola cuenta?", a: "Sí, desde el plan Torre podés tener hasta 5 condominios. El plan Penthouse es ilimitado." },
              { q: "¿Puedo invitar a otros usuarios a mi cuenta?", a: "Sí. Podés agregar miembros (administradores, conserjes, agentes inmobiliarios) según los límites de tu plan." },
              { q: "¿Puedo cambiar o cancelar mi plan después?", a: "Sí, en cualquier momento. Te cobramos sólo lo del mes en curso." },
              { q: "¿Manejan lempiras y conceptos hondureños?", a: "Sí. La plataforma está hecha en Honduras, para Honduras: lempiras nativos, IVA, cuotas extraordinarias, mora, todo en español." },
            ].map((f) => (
              <details key={f.q} className="group bg-[#ffffff] border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#D97757] transition">
                <summary className="font-semibold cursor-pointer flex justify-between items-center text-[#2D3748]">
                  {f.q}
                  <span className="text-[#2D3748] group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#64748B]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Preview cards — un vistazo al producto */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-[#2D3748]">Un vistazo a lo que vas a usar</h2>
          <p className="mt-3 text-[#64748B]">Tres módulos centrales del panel, exactamente como los vas a ver.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Cobros */}
          <div className="bg-[#F8F7F5] rounded-3xl p-8 flex flex-col">
            <h3 className="font-display font-extrabold text-2xl text-[#2D3748]">Cobros en un clic</h3>
            <p className="mt-2 text-sm text-[#1E293B]/80">Genera las cuotas del mes para todas las unidades ocupadas y controla quién pagó.</p>
            <Link to="/login" className="mt-3 text-sm font-semibold text-[#2D3748] inline-flex items-center gap-1 hover:gap-2 transition-all">Ver cobros <ArrowRight className="w-4 h-4" /></Link>
            <div className="mt-6 bg-white rounded-2xl shadow-lg p-4 border border-white">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-[#2D3748]">Cobros · Noviembre</div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F8F7F5] text-[#2D3748] px-2 py-0.5 rounded-full">42 unidades</span>
              </div>
              <div className="space-y-2">
                {[
                  { u: "A-101", n: "M. López", m: "L 3,200", s: "pagado" },
                  { u: "A-204", n: "J. Mejía", m: "L 3,200", s: "pagado" },
                  { u: "B-305", n: "K. Núñez", m: "L 4,500", s: "pendiente" },
                  { u: "B-402", n: "R. Cruz", m: "L 3,200", s: "moroso" },
                ].map((r) => (
                  <div key={r.u} className="flex items-center justify-between text-xs py-1.5 border-b border-[#f1f5f9] last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#F8FAFC] text-[#2D3748] flex items-center justify-center text-[9px] font-bold">{r.u}</div>
                      <span className="text-[#1E293B]">{r.n}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#2D3748]">{r.m}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${r.s === "pagado" ? "bg-[#dcfce7] text-[#166534]" : r.s === "pendiente" ? "bg-[#F8F7F5] text-[#92580a]" : "bg-[#fce7f3] text-[#be185d]"}`}>{r.s}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Accesos QR (navy) */}
          <div className="bg-[#2D3748] rounded-3xl p-8 flex flex-col text-white">
            <h3 className="font-display font-extrabold text-2xl text-white">Accesos con QR</h3>
            <p className="mt-2 text-sm text-white/70">Tus residentes generan códigos de un solo uso desde el celular. Tu guardia los valida en 2 segundos.</p>
            <Link to="/login" className="mt-3 text-sm font-semibold text-[#D97757] inline-flex items-center gap-1 hover:gap-2 transition-all">Ver accesos <ArrowRight className="w-4 h-4" /></Link>
            <div className="mt-6 bg-white rounded-2xl shadow-2xl p-5 text-[#2D3748]">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold">Pase #A7F2K9</div>
                <span className="text-[10px] font-bold uppercase bg-[#dcfce7] text-[#166534] px-2 py-0.5 rounded-full">Válido</span>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-center justify-center mb-3">
                <div className="w-28 h-28 grid grid-cols-8 gap-px bg-[#2D3748] p-1.5 rounded-lg">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const seed = (i * 73 + 17) % 100;
                    return <div key={i} className={seed > 45 ? "bg-white" : "bg-[#2D3748]"} />;
                  })}
                </div>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between"><span className="text-[#64748B]">Visitante</span><span className="font-semibold">Carlos Ramírez</span></div>
                <div className="flex justify-between"><span className="text-[#64748B]">Unidad</span><span className="font-semibold">B-305</span></div>
                <div className="flex justify-between"><span className="text-[#64748B]">Vence</span><span className="font-semibold">Hoy · 8:00 PM</span></div>
              </div>
            </div>
          </div>

          {/* Card 3: Pipeline */}
          <div className="bg-[#F8FAFC] rounded-3xl p-8 flex flex-col">
            <h3 className="font-display font-extrabold text-2xl text-[#2D3748]">Pipeline inmobiliario</h3>
            <p className="mt-2 text-sm text-[#1E293B]/80">Arrastra prospectos entre etapas, agenda visitas y nunca pierdas una venta o renta.</p>
            <Link to="/login" className="mt-3 text-sm font-semibold text-[#2D3748] inline-flex items-center gap-1 hover:gap-2 transition-all">Ver pipeline <ArrowRight className="w-4 h-4" /></Link>
            <div className="mt-6 bg-white rounded-2xl shadow-lg p-3 border border-[#E2E8F0]">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { t: "Nuevo", c: "#F8F7F5", items: [{ n: "A. Pérez", m: "L 1.2M" }, { n: "L. Gómez", m: "L 850K" }] },
                  { t: "Visita", c: "#E2E8F0", items: [{ n: "M. Soto", m: "L 2.1M" }] },
                  { t: "Cierre", c: "#dcfce7", items: [{ n: "J. Ríos", m: "L 1.6M" }] },
                ].map((col) => (
                  <div key={col.t} className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-1">{col.t}</div>
                    {col.items.map((it) => (
                      <div key={it.n} className="rounded-lg p-2 text-[10px]" style={{ background: col.c }}>
                        <div className="font-semibold text-[#2D3748]">{it.n}</div>
                        <div className="text-[#1E293B]/70 mt-0.5">{it.m}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA final */}
        <div className="mt-16 bg-[#2D3748] rounded-[2.5rem] p-10 md:p-14 text-center" style={{ borderTopLeftRadius: '3rem', borderBottomRightRadius: '3rem' }}>
          <h3 className="font-display font-extrabold text-3xl md:text-4xl text-white">¿Listo para ordenar tu condominio?</h3>
          <p className="mt-3 text-white/80 max-w-xl mx-auto">Crea tu cuenta gratis y configurá tu primer edificio en menos de 5 minutos.</p>
          <Link to="/login" className="mt-7 inline-flex items-center gap-2 bg-[#D97757] text-[#2D3748] px-9 py-4 rounded-full font-semibold text-lg hover:bg-[#E8916F] shadow-lg">
            Empezar ahora <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer estilo Firmax */}
      <footer className="border-t border-[#E2E8F0] bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Col 1: Marca */}
            <div className="space-y-4">
              <div className="font-display font-extrabold text-2xl text-[#2D3748]">Altura Cloud</div>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Plataforma de administración de condominios y propiedades para Centroamérica.
              </p>
            </div>

            {/* Col 2: Ecosistema */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#2D3748] uppercase tracking-wider">Ecosistema Zafra Cloud</h4>
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
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2 text-[#64748B] hover:text-[#2D3748] transition">
                        <Icon className="h-4 w-4 mt-0.5 text-[#2D3748]/70 group-hover:text-[#2D3748] flex-shrink-0" />
                        <div>
                          <span className="font-medium text-[#2D3748] group-hover:text-[#2D3748]">{l.name}</span>
                          <p className="text-xs text-[#64748B]">{l.desc}</p>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Col 3: Altura Cloud */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#2D3748] uppercase tracking-wider">Altura Cloud</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#planes" className="text-[#64748B] hover:text-[#2D3748] transition">Planes</a></li>
                <li><a href="#como-funciona" className="text-[#64748B] hover:text-[#2D3748] transition">Cómo funciona</a></li>
                <li><Link to="/login" className="text-[#64748B] hover:text-[#2D3748] transition">Iniciar sesión</Link></li>
                <li><Link to="/login" className="text-[#64748B] hover:text-[#2D3748] transition">Crear cuenta</Link></li>
              </ul>
            </div>

            {/* Col 4: Contacto */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#2D3748] uppercase tracking-wider">Contacto</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="mailto:info@zafra.cloud" className="flex items-center gap-2 text-[#64748B] hover:text-[#2D3748] transition">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    info@zafra.cloud
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/50494103488" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#64748B] hover:text-[#2D3748] transition">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    WhatsApp ventas
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/50494460058" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#64748B] hover:text-[#2D3748] transition">
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
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#64748B]">
              <p>© {new Date().getFullYear()} New Technology, S.A. Parte de <a href="https://home.zafra.cloud" target="_blank" rel="noopener noreferrer" className="text-[#2D3748] hover:underline">Zafra Cloud</a>.</p>
              <p className="flex items-center gap-1.5">Hecho con ❤️ en Honduras 🇭🇳</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
