import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2, KeyRound, Wallet, FileText, MessageSquare, Calendar,
  Users, TrendingUp, FileSignature, Crown, Check, X, ArrowRight, Sparkles,
  Shield, Zap, HeartHandshake,
} from "lucide-react";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "PropCloud — Administra tu condominio sin hojas de cálculo" },
      { name: "description", content: "Software de administración de condominios con CRM inmobiliario integrado. Cobros, accesos, residentes y propiedades en venta/renta. Desde L 890/mes." },
      { property: "og:title", content: "PropCloud — Administración de condominios" },
      { property: "og:description", content: "La plataforma todo-en-uno para administradoras de condominios en Honduras." },
    ],
  }),
  component: LandingPage,
});

const PALETTE = {
  bg: "#fffaf5",
  card: "#ffffff",
  border: "#e8ddd8",
  ink: "#2d1200",
  muted: "#9a7060",
  primary: "#c94f0c",
  primaryDark: "#a33d08",
  cream: "#f5ede8",
  success: "#2d6a2d",
  danger: "#c0392b",
};

const PLANS = [
  {
    id: "lobby",
    icon: "🚪",
    name: "Lobby",
    price: "890",
    tagline: "Para condominios pequeños que quieren digitalizarse",
    cta: "Empezar con Lobby",
    highlight: false,
    features: [
      { ok: true, t: "Panel de administrador web" },
      { ok: true, t: "App para residentes (iOS y Android)" },
      { ok: true, t: "Avisos de cobro y estados de cuenta" },
      { ok: true, t: "Control de accesos con QR" },
      { ok: true, t: "Registro de ingresos y egresos" },
      { ok: true, t: "Reportes básicos en PDF" },
      { ok: true, t: "Comunicados y anuncios" },
      { ok: true, t: "Reserva de áreas comunes" },
      { ok: true, t: "Soporte por WhatsApp (Lun-Vie)" },
      { ok: false, t: "CRM inmobiliario" },
      { ok: false, t: "Pipeline de prospectos" },
      { ok: false, t: "Multi-condominio" },
      { ok: false, t: "Firma digital de contratos" },
      { ok: false, t: "Reportes avanzados Excel" },
    ],
  },
  {
    id: "torre",
    icon: "🏢",
    name: "Torre",
    price: "2,490",
    tagline: "Para administradoras profesionales con varios edificios",
    cta: "Elegir Torre",
    highlight: true,
    features: [
      { ok: true, t: "Todo lo del plan Lobby" },
      { ok: true, t: "CRM inmobiliario integrado" },
      { ok: true, t: "Propiedades en venta/renta desde el edificio" },
      { ok: true, t: "Pipeline de prospectos" },
      { ok: true, t: "Agenda de agentes" },
      { ok: true, t: "Hasta 5 condominios" },
      { ok: true, t: "Reportes completos PDF y Excel" },
      { ok: true, t: "Firma digital de contratos (10 firmas/mes)" },
      { ok: true, t: "Soporte prioritario WhatsApp (Lun-Sáb)" },
      { ok: true, t: "Onboarding asistido por video" },
      { ok: false, t: "Condominios ilimitados" },
      { ok: false, t: "Firmas ilimitadas" },
      { ok: false, t: "Gerente de cuenta dedicado" },
      { ok: false, t: "Integraciones personalizadas" },
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
    features: [
      { ok: true, t: "Todo lo del plan Torre" },
      { ok: true, t: "Condominios ilimitados" },
      { ok: true, t: "Firma digital ilimitada" },
      { ok: true, t: "Gerente de cuenta dedicado" },
      { ok: true, t: "Capacitación presencial en SPS o TGU" },
      { ok: true, t: "API access para integraciones" },
      { ok: true, t: "SLA 99.9% uptime garantizado" },
      { ok: true, t: "Reportes ejecutivos mensuales" },
      { ok: true, t: "Soporte 24/7 por WhatsApp directo" },
      { ok: true, t: "Personalización de logo en la app" },
      { ok: true, t: "Revisión trimestral de cuenta" },
      { ok: true, t: "Integración Zafra Cloud (facturación SAR)" },
    ],
  },
];

const FEATURES = [
  { icon: Wallet, title: "Cobros automáticos", desc: "Genera cobros mensuales de mantenimiento en un clic y marca pagados conforme llegan." },
  { icon: KeyRound, title: "Accesos con QR", desc: "Visitantes autorizados por residentes con código QR único y vencimiento." },
  { icon: Users, title: "CRM inmobiliario", desc: "Pipeline de prospectos para vender y rentar las unidades de tus edificios." },
  { icon: Building2, title: "Multi-edificio", desc: "Administra varias torres desde una sola plataforma con vista consolidada." },
  { icon: FileText, title: "Reportes en PDF y Excel", desc: "Flujo mensual, ocupación, morosidad y exportaciones para tu junta." },
  { icon: Calendar, title: "Reserva de áreas", desc: "Piscina, gimnasio y salón con horarios y capacidad por área." },
  { icon: MessageSquare, title: "Comunicados", desc: "Envía avisos a todos los residentes por la app y WhatsApp." },
  { icon: FileSignature, title: "Firma digital", desc: "Contratos de arrendamiento firmados desde el celular, sin imprimir." },
];

const FAQS = [
  { q: "¿Necesito instalar algo?", a: "No. PropCloud funciona 100% en el navegador. Los residentes descargan la app móvil desde la tienda." },
  { q: "¿Cuánto tarda la implementación?", a: "Menos de 1 hora con el wizard de onboarding. Configuras tu edificio, generas las unidades en lote y registras a los residentes." },
  { q: "¿Puedo cambiar de plan?", a: "Sí, en cualquier momento. Subes o bajas de plan sin perder datos y se prorratea automáticamente." },
  { q: "¿Aceptan pago con tarjeta o transferencia?", a: "Ambos. Tarjeta mensual recurrente o transferencia anual con descuento de 15%." },
  { q: "¿Dónde están alojados mis datos?", a: "En servidores con encriptación AES-256 y respaldos diarios. Cumplimos con buenas prácticas de seguridad." },
];

function LandingPage() {
  return (
    <div style={{ background: PALETTE.bg }} className="min-h-screen font-sans text-[#2d1200]">
      <Nav />
      <Hero />
      <SocialProof />
      <FeaturesGrid />
      <PlansSection />
      <Comparison />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-40 backdrop-blur bg-[#fffaf5]/85 border-b border-[#e8ddd8]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#c94f0c] flex items-center justify-center text-white font-display font-extrabold">P</div>
          <span className="font-display font-extrabold text-lg">PropCloud</span>
        </div>
        <div className="hidden md:flex items-center gap-7 text-sm text-[#4a2800]">
          <a href="#features" className="hover:text-[#c94f0c] transition-colors">Funcionalidades</a>
          <a href="#planes" className="hover:text-[#c94f0c] transition-colors">Planes</a>
          <a href="#comparar" className="hover:text-[#c94f0c] transition-colors">Comparar</a>
          <a href="#faq" className="hover:text-[#c94f0c] transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm font-medium text-[#4a2800] hover:text-[#c94f0c] px-3 py-2">Ingresar</Link>
          <Link to="/login" className="text-sm font-semibold bg-[#c94f0c] hover:bg-[#a33d08] text-white px-4 py-2 rounded-full transition-colors">
            Probar gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e8a87c]/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#c94f0c]/15 rounded-full blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#e8ddd8] rounded-full px-4 py-1.5 text-xs font-medium text-[#4a2800] mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#c94f0c]" />
          Hecho en Honduras 🇭🇳 para administradoras de condominios
        </div>
        <h1 className="font-display font-extrabold text-5xl md:text-7xl tracking-tight leading-[1.05] max-w-4xl mx-auto">
          Administra tu condominio <span className="text-[#c94f0c]">sin hojas de cálculo</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-[#6b4530] max-w-2xl mx-auto">
          Cobros, accesos, residentes y propiedades en venta/renta — todo en una sola plataforma con CRM inmobiliario integrado.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="bg-[#c94f0c] hover:bg-[#a33d08] text-white font-semibold px-7 py-3.5 rounded-full inline-flex items-center gap-2 transition-colors shadow-lg shadow-[#c94f0c]/25">
            Empezar gratis 14 días <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#planes" className="bg-white border border-[#e8ddd8] hover:border-[#c94f0c] text-[#2d1200] font-semibold px-7 py-3.5 rounded-full transition-colors">
            Ver planes
          </a>
        </div>
        <div className="mt-6 text-xs text-[#9a7060]">Sin tarjeta de crédito · Cancela cuando quieras</div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="mt-16 relative max-w-5xl mx-auto">
      <div className="bg-white border border-[#e8ddd8] rounded-3xl shadow-2xl shadow-[#2d1200]/10 overflow-hidden">
        <div className="bg-[#f5ede8] px-4 py-2.5 flex items-center gap-1.5 border-b border-[#e8ddd8]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          <div className="flex-1 text-center text-xs text-[#9a7060]">propcloud.app/dashboard</div>
        </div>
        <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          {[
            { l: "Recaudación", v: "L 48,500", c: "#c94f0c" },
            { l: "Morosos", v: "4", c: "#c0392b" },
            { l: "Accesos hoy", v: "32", c: "#2d1200" },
            { l: "Prospectos", v: "8", c: "#9b72cf" },
          ].map((k) => (
            <div key={k.l} className="bg-[#fffaf5] border border-[#f0e6e0] rounded-2xl p-4">
              <div className="text-xs text-[#9a7060]">{k.l}</div>
              <div className="font-display font-extrabold text-2xl mt-1" style={{ color: k.c }}>{k.v}</div>
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 bg-gradient-to-br from-[#fffaf5] to-[#f5ede8] border border-[#f0e6e0] rounded-2xl p-5">
            <div className="text-xs text-[#9a7060] uppercase tracking-widest mb-3">Recaudación últimos 6 meses</div>
            <div className="flex items-end gap-2 h-24">
              {[42, 51, 47, 55, 58, 48].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, background: i === 5 ? "#c94f0c" : "#e8a87c" }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialProof() {
  return (
    <section className="border-y border-[#e8ddd8] bg-white py-8">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { n: "+120", l: "Edificios" },
          { n: "+3,500", l: "Unidades administradas" },
          { n: "99.9%", l: "Uptime" },
          { n: "L 28M", l: "Cobrados al mes" },
        ].map((s) => (
          <div key={s.l}>
            <div className="font-display font-extrabold text-3xl text-[#c94f0c]">{s.n}</div>
            <div className="text-xs text-[#9a7060] uppercase tracking-widest mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesGrid() {
  return (
    <section id="features" className="py-24 max-w-6xl mx-auto px-6">
      <div className="text-center mb-14">
        <div className="text-xs uppercase tracking-widest text-[#c94f0c] font-bold mb-2">Funcionalidades</div>
        <h2 className="font-display font-extrabold text-4xl md:text-5xl">Todo lo que necesitas para operar</h2>
        <p className="text-[#6b4530] mt-3 max-w-2xl mx-auto">Desde el cobro de mantenimiento hasta la venta de la unidad — un solo sistema, sin integraciones complicadas.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-white border border-[#e8ddd8] rounded-2xl p-5 hover:border-[#c94f0c] hover:shadow-lg transition-all group">
            <div className="w-11 h-11 rounded-xl bg-[#f5ede8] group-hover:bg-[#c94f0c] flex items-center justify-center mb-4 transition-colors">
              <f.icon className="w-5 h-5 text-[#c94f0c] group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-display font-bold text-lg">{f.title}</h3>
            <p className="text-sm text-[#6b4530] mt-1.5 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlansSection() {
  return (
    <section id="planes" className="py-24 bg-white border-y border-[#e8ddd8]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-widest text-[#c94f0c] font-bold mb-2">Planes</div>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl">Precios claros, sin sorpresas</h2>
          <p className="text-[#6b4530] mt-3 max-w-2xl mx-auto">Empieza con Lobby y crece a tu ritmo. Cambia de plan cuando quieras.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-3xl p-7 flex flex-col ${
                p.highlight
                  ? "bg-gradient-to-b from-[#2d1200] to-[#4a2800] text-white shadow-2xl shadow-[#2d1200]/30 scale-[1.03] border-2 border-[#c94f0c]"
                  : "bg-[#fffaf5] border border-[#e8ddd8]"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c94f0c] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                  ⭐ Más popular
                </div>
              )}
              <div className="text-4xl mb-2">{p.icon}</div>
              <h3 className={`font-display font-extrabold text-2xl ${p.highlight ? "text-white" : "text-[#2d1200]"}`}>{p.name}</h3>
              <p className={`text-sm mt-1 mb-5 ${p.highlight ? "text-[#f5e6de]/80" : "text-[#9a7060]"}`}>{p.tagline}</p>
              <div className="mb-6">
                <span className={`text-sm ${p.highlight ? "text-[#f5e6de]/70" : "text-[#9a7060]"}`}>L</span>
                <span className={`font-display font-extrabold text-5xl ml-1 ${p.highlight ? "text-white" : "text-[#2d1200]"}`}>{p.price}</span>
                <span className={`text-sm ml-1 ${p.highlight ? "text-[#f5e6de]/70" : "text-[#9a7060]"}`}>/mes</span>
              </div>
              <Link
                to="/login"
                className={`w-full text-center font-semibold rounded-full py-3 transition-colors ${
                  p.highlight
                    ? "bg-[#c94f0c] hover:bg-[#a33d08] text-white"
                    : "bg-white border border-[#e8ddd8] hover:border-[#c94f0c] text-[#2d1200]"
                }`}
              >
                {p.cta}
              </Link>
              <ul className="mt-7 space-y-2.5 text-sm">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    {f.ok ? (
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? "text-[#a8e6a8]" : "text-[#2d6a2d]"}`} />
                    ) : (
                      <X className={`w-4 h-4 mt-0.5 shrink-0 ${p.highlight ? "text-[#f5e6de]/40" : "text-[#cbb5ab]"}`} />
                    )}
                    <span className={`${!f.ok ? (p.highlight ? "text-[#f5e6de]/50 line-through" : "text-[#cbb5ab] line-through") : (p.highlight ? "text-[#f5e6de]" : "text-[#4a2800]")}`}>
                      {f.t}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 text-sm text-[#9a7060]">
          💸 Paga anual y ahorra 15% · 🇭🇳 Facturas con RTN incluidas · 🔒 Sin contratos forzosos
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const rows = [
    ["Unidades incluidas", "Hasta 50", "Hasta 200", "Hasta 500"],
    ["Condominios", "1", "Hasta 5", "Ilimitados"],
    ["Unidad extra", "L 35 c/u", "L 25 c/u", "L 15 c/u"],
    ["CRM inmobiliario", "—", "✓", "✓"],
    ["Firma digital", "—", "10/mes", "Ilimitada"],
    ["API & integraciones", "—", "—", "✓"],
    ["Gerente de cuenta", "—", "—", "✓"],
    ["Soporte", "L-V WhatsApp", "L-S Prioritario", "24/7 directo"],
  ];
  return (
    <section id="comparar" className="py-24 max-w-6xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="font-display font-extrabold text-4xl">Comparar planes</h2>
      </div>
      <div className="bg-white border border-[#e8ddd8] rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f5ede8] text-[#2d1200]">
              <th className="text-left px-6 py-4 font-semibold"></th>
              <th className="px-6 py-4 font-display font-bold">🚪 Lobby</th>
              <th className="px-6 py-4 font-display font-bold bg-[#c94f0c]/10">🏢 Torre</th>
              <th className="px-6 py-4 font-display font-bold">👑 Penthouse</th>
            </tr>
          </thead>
          <tbody className="text-[#4a2800]">
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-[#f0e6e0]">
                <td className="px-6 py-3.5 font-medium text-[#2d1200]">{r[0]}</td>
                <td className="px-6 py-3.5 text-center">{r[1]}</td>
                <td className="px-6 py-3.5 text-center bg-[#c94f0c]/5 font-medium">{r[2]}</td>
                <td className="px-6 py-3.5 text-center">{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="py-24 bg-white border-y border-[#e8ddd8]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold text-4xl">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <details key={i} className="group bg-[#fffaf5] border border-[#e8ddd8] rounded-2xl p-5 hover:border-[#c94f0c] transition-colors">
              <summary className="flex items-center justify-between cursor-pointer font-display font-bold text-[#2d1200] list-none">
                {f.q}
                <span className="text-[#c94f0c] text-2xl transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-[#6b4530] leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 max-w-5xl mx-auto px-6">
      <div className="bg-gradient-to-br from-[#2d1200] to-[#4a2800] rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#c94f0c]/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#e8a87c]/20 rounded-full blur-3xl" />
        <div className="relative">
          <h2 className="font-display font-extrabold text-4xl md:text-5xl">¿Listo para digitalizar tu administración?</h2>
          <p className="text-[#f5e6de]/80 mt-4 max-w-xl mx-auto">Configura tu primer edificio en menos de 1 hora con nuestro asistente guiado.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="bg-[#c94f0c] hover:bg-[#a33d08] text-white font-semibold px-7 py-3.5 rounded-full inline-flex items-center gap-2 transition-colors shadow-xl shadow-[#c94f0c]/40">
              Probar gratis 14 días <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="https://wa.me/50499999999" target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-full transition-colors">
              Hablar por WhatsApp
            </a>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-[#f5e6de]/60">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Datos seguros</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Setup en 1 hora</span>
            <span className="flex items-center gap-1.5"><HeartHandshake className="w-3.5 h-3.5" /> Soporte en español</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#e8ddd8] py-10 text-sm text-[#9a7060]">
      <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#c94f0c] flex items-center justify-center text-white font-display font-extrabold text-sm">P</div>
          <span className="font-display font-bold text-[#2d1200]">PropCloud</span>
          <span>· © {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-[#c94f0c]">Términos</a>
          <a href="#" className="hover:text-[#c94f0c]">Privacidad</a>
          <a href="mailto:hola@propcloud.hn" className="hover:text-[#c94f0c]">hola@propcloud.hn</a>
        </div>
      </div>
    </footer>
  );
}
