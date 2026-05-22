import { Link } from "@tanstack/react-router";
import {
  Check, ArrowRight, Wallet, KeyRound, Users, Wrench, MessageSquare, Calendar,
  Building2, TrendingUp, FileText, BarChart3, ShieldCheck, Zap, Clock, HeartHandshake,
} from "lucide-react";

const PLANS = [
  {
    id: "lobby",
    icon: "🚪",
    name: "Lobby",
    price: "890",
    tagline: "Para condominios pequeños que quieren digitalizarse",
    cta: "Empezar con Lobby",
    highlight: false,
    limits: [
      "Hasta 1 condominio",
      "Hasta 50 unidades",
      "Hasta 3 usuarios administradores",
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
      "Hasta 5 condominios",
      "Hasta 300 unidades",
      "Hasta 10 usuarios administradores",
      "Firma digital: 10/mes",
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
      "Condominios ilimitados",
      "Unidades ilimitadas",
      "Usuarios administradores ilimitados",
      "Firma digital ilimitada",
      "Gerente de cuenta dedicado",
      "Soporte 24/7",
    ],
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#2d1200]">
      {/* Nav */}
      <header className="border-b border-[#e8ddd8] bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-display font-extrabold text-xl">PropCloud</div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-[#4a2800] hover:text-[#c94f0c]">Iniciar sesión</Link>
            <Link to="/login" className="text-sm font-semibold bg-[#c94f0c] text-white px-4 py-2 rounded-full hover:bg-[#a33d08]">
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-[#f5ede8] text-[#c94f0c] px-3 py-1 rounded-full mb-5">
          Hecho en Honduras 🇭🇳
        </span>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight leading-[1.05]">
          Administra tu condominio<br />sin hojas de cálculo.
        </h1>
        <p className="mt-6 text-lg text-[#6b4a3a] max-w-2xl mx-auto">
          Cobros, accesos, residentes, mantenimiento y propiedades en venta o renta —
          todo desde un solo panel con CRM inmobiliario integrado.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="inline-flex items-center gap-2 bg-[#c94f0c] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#a33d08]">
            Crear mi cuenta gratis <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#planes" className="inline-flex items-center gap-2 border border-[#e8ddd8] bg-white px-6 py-3 rounded-full font-semibold text-[#4a2800] hover:border-[#c94f0c]">
            Ver planes
          </a>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#9a7060]">
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#2d6a2d]" /> Sin tarjeta de crédito</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#2d6a2d]" /> Configuración en 5 minutos</span>
          <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-[#2d6a2d]" /> Soporte en español</span>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-[#2d1200] text-[#f5ede8] py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
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

      {/* What is PropCloud */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl">Todo lo que necesita un edificio, en un solo lugar</h2>
          <p className="mt-3 text-[#6b4a3a]">
            Reemplaza WhatsApp, Excel y cuadernos por un sistema que ordena la operación
            financiera, comercial y de seguridad de tu condominio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { i: Wallet, t: "Cobros y estados de cuenta", d: "Genera cuotas mensuales en lote, registra pagos, emite recibos y controla morosidad en tiempo real." },
            { i: KeyRound, t: "Control de accesos con QR", d: "Autoriza visitantes con códigos QR de un solo uso, controla entradas y salidas, lleva bitácora completa." },
            { i: Users, t: "Residentes y unidades", d: "Lleva un padrón limpio de propietarios, inquilinos, vehículos y personas autorizadas por cada unidad." },
            { i: Wrench, t: "Mantenimiento e incidencias", d: "Levanta tickets, asigna proveedores, controla costos estimados vs reales y cierra órdenes con evidencia." },
            { i: MessageSquare, t: "Comunicados al condominio", d: "Envía avisos por grupo de residentes — emergencias, asambleas, cortes de servicio — con historial completo." },
            { i: Calendar, t: "Reserva de áreas comunes", d: "Salón social, gimnasio, piscina o cancha: los residentes ven disponibilidad y reservan en minutos." },
            { i: Building2, t: "CRM inmobiliario", d: "Pública las unidades en venta o renta, captura prospectos por origen, asígnales agente y precio." },
            { i: TrendingUp, t: "Pipeline y agenda", d: "Arrastra prospectos entre etapas (nuevo → visita → oferta → cierre) y agenda visitas con recordatorios." },
            { i: BarChart3, t: "Reportes y KPIs", d: "Flujo de caja, ocupación, cartera vencida, conversión del pipeline. Exporta a PDF o CSV." },
          ].map((f) => (
            <div key={f.t} className="bg-white rounded-2xl border border-[#e8ddd8] p-6 hover:border-[#c94f0c] hover:shadow-md transition">
              <div className="w-11 h-11 rounded-xl bg-[#f5ede8] flex items-center justify-center text-[#c94f0c] mb-4">
                <f.i className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg">{f.t}</h3>
              <p className="text-sm text-[#6b4a3a] mt-1.5">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-[#e8ddd8] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl">Empieza a operar hoy mismo</h2>
            <p className="mt-3 text-[#6b4a3a]">Cuatro pasos guiados por nuestro asistente de configuración.</p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { n: "1", t: "Crea tu cuenta", d: "Te volvés dueño de tu propio espacio aislado. Nadie más ve tus datos." },
              { n: "2", t: "Registra tu edificio", d: "Nombre, dirección, moneda y cuota base. Genera unidades en lote." },
              { n: "3", t: "Invita residentes", d: "Asóciales sus unidades, vehículos y datos de contacto." },
              { n: "4", t: "Genera tu primer cobro", d: "Un clic para emitir las cuotas del mes a todas las unidades ocupadas." },
            ].map((s) => (
              <li key={s.n} className="relative">
                <div className="w-10 h-10 rounded-full bg-[#c94f0c] text-white font-display font-extrabold flex items-center justify-center mb-3">{s.n}</div>
                <h3 className="font-display font-bold text-lg">{s.t}</h3>
                <p className="text-sm text-[#6b4a3a] mt-1">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Why PropCloud */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl">¿Por qué PropCloud?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { i: ShieldCheck, t: "Datos aislados por cuenta", d: "Multi-tenant real: tu condominio sólo lo ven tú y los usuarios que invitás. Nadie más, ni siquiera otros clientes nuestros." },
            { i: Zap, t: "Pensado para Honduras", d: "Lempiras, fechas en español, conceptos como cuota de mantenimiento, mora, parqueo de visita. No es un sistema gringo traducido." },
            { i: Clock, t: "Sin instalación ni servidores", d: "Es web. Tus administradores entran desde cualquier laptop. Tus residentes desde el navegador del celular." },
            { i: HeartHandshake, t: "Soporte humano", d: "Te respondemos por WhatsApp en horario hondureño, no por chatbots ni tickets que tardan días." },
          ].map((b) => (
            <div key={b.t} className="flex gap-4 bg-white rounded-2xl border border-[#e8ddd8] p-6">
              <div className="w-12 h-12 rounded-xl bg-[#f5ede8] flex items-center justify-center text-[#c94f0c] shrink-0">
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
      <section id="planes" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl">Planes simples y honestos</h2>
          <p className="mt-3 text-[#6b4a3a]">Elige el que te queda. Cambia cuando quieras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border bg-white p-7 flex flex-col ${
                p.highlight ? "border-[#c94f0c] ring-4 ring-[#c94f0c]/10 shadow-xl scale-[1.02]" : "border-[#e8ddd8]"
              }`}
            >
              {p.highlight && (
                <span className="self-start text-xs font-bold uppercase tracking-wider bg-[#c94f0c] text-white px-3 py-1 rounded-full mb-4">
                  Más popular
                </span>
              )}
              <div className="text-3xl">{p.icon}</div>
              <h3 className="font-display font-extrabold text-2xl mt-2">{p.name}</h3>
              <p className="text-sm text-[#6b4a3a] mt-1 min-h-[2.5rem]">{p.tagline}</p>
              <div className="mt-5">
                <span className="text-4xl font-extrabold">L {p.price}</span>
                <span className="text-[#9a7060] text-sm">/mes</span>
              </div>
              <ul className="mt-6 space-y-2.5 flex-1">
                {p.limits.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-sm text-[#4a2800]">
                    <Check className="w-4 h-4 mt-0.5 text-[#2d6a2d] shrink-0" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className={`mt-7 text-center font-semibold py-3 rounded-full transition-colors ${
                  p.highlight
                    ? "bg-[#c94f0c] text-white hover:bg-[#a33d08]"
                    : "border border-[#e8ddd8] text-[#4a2800] hover:border-[#c94f0c]"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t border-[#e8ddd8] py-20">
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
              <details key={f.q} className="group bg-[#fffaf5] border border-[#e8ddd8] rounded-2xl p-5 hover:border-[#c94f0c] transition">
                <summary className="font-semibold cursor-pointer flex justify-between items-center text-[#2d1200]">
                  {f.q}
                  <span className="text-[#c94f0c] group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-[#6b4a3a]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display font-extrabold text-3xl md:text-4xl">¿Listo para ordenar tu condominio?</h2>
        <p className="mt-4 text-[#6b4a3a]">Crea tu cuenta gratis y configurá tu primer edificio en menos de 5 minutos.</p>
        <Link to="/login" className="mt-8 inline-flex items-center gap-2 bg-[#c94f0c] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#a33d08]">
          Empezar ahora <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Ecosystem */}
      <section className="border-t border-[#e8ddd8] bg-white py-10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-wider text-[#9a7060] mb-4">Parte del ecosistema</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            <a href="https://zafra.cloud" target="_blank" rel="noopener noreferrer" className="text-[#2d1200] font-display font-extrabold text-lg hover:text-[#c94f0c] transition">
              Zafra Cloud
            </a>
            <span className="text-[#e8ddd8] hidden md:inline">|</span>
            <a href="https://firmax.cloud" target="_blank" rel="noopener noreferrer" className="text-[#6b4a3a] font-semibold text-sm hover:text-[#c94f0c] transition">
              Firmax Cloud
            </a>
            <a href="https://trabajoshonduras.com" target="_blank" rel="noopener noreferrer" className="text-[#6b4a3a] font-semibold text-sm hover:text-[#c94f0c] transition">
              Trabajos Honduras
            </a>
            <a href="https://propcloud.app" target="_blank" rel="noopener noreferrer" className="text-[#c94f0c] font-semibold text-sm hover:text-[#a33d08] transition">
              PropCloud
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8ddd8] py-8 text-center text-sm text-[#9a7060]">
        © {new Date().getFullYear()} PropCloud · Hecho en Honduras 🇭🇳
      </footer>
    </div>
  );
}
