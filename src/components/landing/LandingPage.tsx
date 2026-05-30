import { Link } from "@tanstack/react-router";
import {
  Check, ArrowRight, Wallet, KeyRound, Users, Wrench, MessageSquare, Calendar,
  Building2, TrendingUp, FileText, BarChart3, ShieldCheck, Zap, Clock, HeartHandshake,
  Server,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import heroCondo from "@/assets/hero-condo.jpg";
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
    <div className="min-h-screen bg-[#ffffff] text-[#0a1e3f]">
      {/* Nav */}
      <header className="border-b border-[#e8ecf3] bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Altura Cloud" width={32} height={32} className="w-8 h-8" />
            <div className="font-display font-extrabold text-xl">Altura Cloud</div>
          </div>

          {/* Menú central */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#13294b]">
            <a href="#funciones" className="hover:text-[#ffd60a]">Funciones</a>
            <a href="#planes" className="hover:text-[#ffd60a]">Precios</a>
            <a href="#faq" className="hover:text-[#ffd60a]">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-semibold bg-[#ffd60a] text-white px-4 py-2 rounded-full hover:bg-[#e6c200]">
                  Ir al Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm font-medium text-[#13294b] hover:text-[#ffd60a] px-3 py-1.5"
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
                    className="text-sm font-medium text-[#13294b] hover:text-[#ffd60a] px-3 py-1.5 inline-flex items-center gap-1"
                  >
                    Iniciar sesión
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full pt-2 w-56 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 focus-within:visible focus-within:opacity-100 focus-within:translate-y-0 transition">
                    <div className="bg-white border border-[#e8ecf3] rounded-2xl shadow-lg overflow-hidden">
                      <Link to="/login" className="block px-4 py-3 text-sm text-[#0a1e3f] hover:bg-[#fff4ec]">
                        <div className="font-semibold">Como administrador</div>
                        <div className="text-xs text-[#6b7a99] mt-0.5">Gestiona tu condominio</div>
                      </Link>
                      <div className="border-t border-[#f0e6df]" />
                      <Link to="/login" search={{ as: "residente" }} className="block px-4 py-3 text-sm text-[#0a1e3f] hover:bg-[#fff4ec]">
                        <div className="font-semibold">Como residente</div>
                        <div className="text-xs text-[#6b7a99] mt-0.5">Portal de residentes</div>
                      </Link>
                    </div>
                  </div>
                </div>

                <Link to="/login" className="text-sm font-semibold bg-[#ffd60a] text-white px-4 py-2 rounded-full hover:bg-[#e6c200]">
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
            <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-[#fffdf5] text-[#ffd60a] px-3 py-1 rounded-full mb-5">
              Hecho en Honduras 🇭🇳
            </span>
            <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
              Administra tu condominio <span className="text-[#ffd60a]">sin hojas de cálculo</span>. 🏢
            </h1>
            <p className="mt-6 text-lg text-[#6b4a3a] max-w-xl mx-auto md:mx-0">
              💰 Cobros, 🔑 accesos, 👥 residentes, 🔧 mantenimiento y 🏘️ propiedades en venta o renta —
              todo desde un solo panel con CRM inmobiliario integrado.
            </p>
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 bg-[#ffd60a] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#e6c200]">
                Crear mi cuenta gratis <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#planes" className="inline-flex items-center gap-2 border border-[#e8ecf3] bg-white px-6 py-3 rounded-full font-semibold text-[#13294b] hover:border-[#ffd60a]">
                Ver planes
              </a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-[#6b7a99]">
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
      <section className="relative overflow-hidden bg-[#0a1e3f] text-[#fffdf5] py-10">
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
              <div className="text-xs uppercase tracking-wider text-[#c9a896] mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What is Altura Cloud */}
      <section id="funciones" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl">Todo lo que necesita un edificio, en un solo lugar</h2>
          <p className="mt-3 text-[#6b4a3a]">
            Reemplaza WhatsApp, Excel y cuadernos por un sistema que ordena la operación
            financiera, comercial y de seguridad de tu condominio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { i: Wallet, e: "💰", t: "Cobros y estados de cuenta", d: "Genera cuotas mensuales en lote, registra pagos, emite recibos y controla morosidad en tiempo real." },
            { i: KeyRound, e: "🔑", t: "Control de accesos con QR", d: "Autoriza visitantes con códigos QR de un solo uso, controla entradas y salidas, lleva bitácora completa." },
            { i: Users, e: "👨‍👩‍👧", t: "Residentes y unidades", d: "Lleva un padrón limpio de propietarios, inquilinos, vehículos y personas autorizadas por cada unidad." },
            { i: Wrench, e: "🔧", t: "Mantenimiento e incidencias", d: "Levanta tickets, asigna proveedores, controla costos estimados vs reales y cierra órdenes con evidencia." },
            { i: MessageSquare, e: "📣", t: "Comunicados al condominio", d: "Envía avisos por grupo de residentes — emergencias, asambleas, cortes de servicio — con historial completo." },
            { i: Calendar, e: "🏊", t: "Reserva de áreas comunes", d: "Salón social, gimnasio, piscina o cancha: los residentes ven disponibilidad y reservan en minutos." },
            { i: Building2, e: "🏘️", t: "CRM inmobiliario", d: "Pública las unidades en venta o renta, captura prospectos por origen, asígnales agente y precio." },
            { i: TrendingUp, e: "📈", t: "Pipeline y agenda", d: "Arrastra prospectos entre etapas (nuevo → visita → oferta → cierre) y agenda visitas con recordatorios." },
            { i: BarChart3, e: "📊", t: "Reportes y KPIs", d: "Flujo de caja, ocupación, cartera vencida, conversión del pipeline. Exporta a PDF o CSV." },
          ].map((f) => (
            <div key={f.t} className="bg-white rounded-2xl border border-[#e8ecf3] p-6 hover:border-[#ffd60a] hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#fffdf5] flex items-center justify-center text-[#ffd60a]">
                  <f.i className="w-5 h-5" />
                </div>
                <span className="text-2xl" aria-hidden>{f.e}</span>
              </div>
              <h3 className="font-display font-bold text-lg">{f.t}</h3>
              <p className="text-sm text-[#6b4a3a] mt-1.5">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden bg-white border-y border-[#e8ecf3] py-20">
        <img src={logoUrl} alt="" aria-hidden width={100} height={100} className="absolute top-10 left-4 w-16 md:w-24 h-auto float-slow opacity-80 pointer-events-none" />
        <img src={logoUrl} alt="" aria-hidden width={100} height={100} className="absolute bottom-10 right-6 w-20 md:w-28 h-auto float-med opacity-80 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl">Empieza a operar hoy mismo</h2>
            <p className="mt-3 text-[#6b4a3a]">Cuatro pasos guiados por nuestro asistente de configuración.</p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { n: "1", e: "🧾", t: "Crea tu cuenta", d: "Te volvés dueño de tu propio espacio aislado. Nadie más ve tus datos." },
              { n: "2", e: "🏢", t: "Registra tu edificio", d: "Nombre, dirección, moneda y cuota base. Genera unidades en lote." },
              { n: "3", e: "✉️", t: "Invita residentes", d: "Asóciales sus unidades, vehículos y datos de contacto." },
              { n: "4", e: "💸", t: "Genera tu primer cobro", d: "Un clic para emitir las cuotas del mes a todas las unidades ocupadas." },
            ].map((s) => (
              <li key={s.n} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#ffd60a] text-white font-display font-extrabold flex items-center justify-center">{s.n}</div>
                  <span className="text-3xl" aria-hidden>{s.e}</span>
                </div>
                <h3 className="font-display font-bold text-lg">{s.t}</h3>
                <p className="text-sm text-[#6b4a3a] mt-1">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why Altura Cloud */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl">¿Por qué Altura Cloud?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { i: ShieldCheck, t: "Datos aislados por cuenta", d: "Multi-tenant real: tu condominio sólo lo ven tú y los usuarios que invitás. Nadie más, ni siquiera otros clientes nuestros." },
            { i: Zap, t: "Pensado para Honduras", d: "Lempiras, fechas en español, conceptos como cuota de mantenimiento, mora, parqueo de visita. No es un sistema gringo traducido." },
            { i: Clock, t: "Sin instalación ni servidores", d: "Es web. Tus administradores entran desde cualquier laptop. Tus residentes desde el navegador del celular." },
            { i: HeartHandshake, t: "Soporte humano", d: "Te respondemos por WhatsApp en horario hondureño, no por chatbots ni tickets que tardan días." },
          ].map((b) => (
            <div key={b.t} className="flex gap-4 bg-white rounded-2xl border border-[#e8ecf3] p-6">
              <div className="w-12 h-12 rounded-xl bg-[#fffdf5] flex items-center justify-center text-[#ffd60a] shrink-0">
                <b.i className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">{b.t}</h3>
                <p className="text-sm text-[#6b4a3a] mt-1.5">{b.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Plans */}
      <section id="planes" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl">Planes simples y honestos</h2>
          <p className="mt-3 text-[#6b4a3a]">Elige el que te queda. Cambia cuando quieras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border bg-white p-7 flex flex-col ${
                p.highlight ? "border-[#ffd60a] ring-4 ring-[#ffd60a]/10 shadow-xl scale-[1.02]" : "border-[#e8ecf3]"
              }`}
            >
              {p.highlight && (
                <span className="self-start text-xs font-bold uppercase tracking-wider bg-[#ffd60a] text-white px-3 py-1 rounded-full mb-4">
                  Más popular
                </span>
              )}
              <div className="text-3xl">{p.icon}</div>
              <h3 className="font-display font-extrabold text-2xl mt-2">{p.name}</h3>
              <p className="text-sm text-[#6b4a3a] mt-1 min-h-[2.5rem]">{p.tagline}</p>
              <div className="mt-5">
                <span className="text-4xl font-extrabold">L {p.price}</span>
                <span className="text-[#6b7a99] text-sm">/mes</span>
              </div>
              <ul className="mt-6 space-y-2.5 flex-1">
                {p.limits.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-sm text-[#13294b]">
                    <Check className="w-4 h-4 mt-0.5 text-[#166534] shrink-0" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className={`mt-7 text-center font-semibold py-3 rounded-full transition-colors ${
                  p.highlight
                    ? "bg-[#ffd60a] text-white hover:bg-[#e6c200]"
                    : "border border-[#e8ecf3] text-[#13294b] hover:border-[#ffd60a]"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white border-t border-[#e8ecf3] py-20">
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
              <details key={f.q} className="group bg-[#ffffff] border border-[#e8ecf3] rounded-2xl p-5 hover:border-[#ffd60a] transition">
                <summary className="font-semibold cursor-pointer flex justify-between items-center text-[#0a1e3f]">
                  {f.q}
                  <span className="text-[#ffd60a] group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#6b4a3a]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative max-w-4xl mx-auto px-6 py-20 text-center">
        <img src={logoUrl} alt="" aria-hidden width={160} height={160} className="mx-auto w-28 md:w-36 h-auto float-slow mb-6" />
        <h2 className="font-display font-extrabold text-3xl md:text-4xl">¿Listo para ordenar tu condominio?</h2>
        <p className="mt-4 text-[#6b4a3a]">Crea tu cuenta gratis y configurá tu primer edificio en menos de 5 minutos.</p>
        <Link to="/login" className="mt-8 inline-flex items-center gap-2 bg-[#ffd60a] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#e6c200]">
          Empezar ahora <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer estilo Firmax */}
      <footer className="border-t border-[#e8ecf3] bg-[#ffffff]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Col 1: Marca */}
            <div className="space-y-4">
              <div className="font-display font-extrabold text-2xl text-[#0a1e3f]">Altura Cloud</div>
              <p className="text-sm text-[#6b4a3a] leading-relaxed">
                Plataforma de administración de condominios y propiedades para Centroamérica.
              </p>
            </div>

            {/* Col 2: Ecosistema */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#0a1e3f] uppercase tracking-wider">Ecosistema Zafra Cloud</h4>
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
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2 text-[#6b4a3a] hover:text-[#ffd60a] transition">
                        <Icon className="h-4 w-4 mt-0.5 text-[#ffd60a]/70 group-hover:text-[#ffd60a] flex-shrink-0" />
                        <div>
                          <span className="font-medium text-[#0a1e3f] group-hover:text-[#ffd60a]">{l.name}</span>
                          <p className="text-xs text-[#6b7a99]">{l.desc}</p>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Col 3: Altura Cloud */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#0a1e3f] uppercase tracking-wider">Altura Cloud</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#planes" className="text-[#6b4a3a] hover:text-[#ffd60a] transition">Planes</a></li>
                <li><a href="#como-funciona" className="text-[#6b4a3a] hover:text-[#ffd60a] transition">Cómo funciona</a></li>
                <li><Link to="/login" className="text-[#6b4a3a] hover:text-[#ffd60a] transition">Iniciar sesión</Link></li>
                <li><Link to="/login" className="text-[#6b4a3a] hover:text-[#ffd60a] transition">Crear cuenta</Link></li>
              </ul>
            </div>

            {/* Col 4: Contacto */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#0a1e3f] uppercase tracking-wider">Contacto</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="mailto:info@zafra.cloud" className="flex items-center gap-2 text-[#6b4a3a] hover:text-[#ffd60a] transition">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    info@zafra.cloud
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/50494103488" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#6b4a3a] hover:text-[#ffd60a] transition">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    WhatsApp ventas
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/50494460058" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#6b4a3a] hover:text-[#ffd60a] transition">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    +504 9446-0058
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e8ecf3]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#6b7a99]">
              <p>© {new Date().getFullYear()} New Technology, S.A. Parte de <a href="https://home.zafra.cloud" target="_blank" rel="noopener noreferrer" className="text-[#ffd60a] hover:underline">Zafra Cloud</a>.</p>
              <p className="flex items-center gap-1.5">Hecho con ❤️ en Honduras 🇭🇳</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
