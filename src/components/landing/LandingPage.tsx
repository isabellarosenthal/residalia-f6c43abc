import { Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";

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
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight leading-[1.05]">
          Administra tu condominio<br />sin hojas de cálculo.
        </h1>
        <p className="mt-6 text-lg text-[#6b4a3a] max-w-2xl mx-auto">
          Cobros, accesos, residentes y propiedades en venta o renta — todo en un solo panel.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/login" className="inline-flex items-center gap-2 bg-[#c94f0c] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#a33d08]">
            Crear mi cuenta <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#planes" className="inline-flex items-center gap-2 border border-[#e8ddd8] bg-white px-6 py-3 rounded-full font-semibold text-[#4a2800] hover:border-[#c94f0c]">
            Ver planes
          </a>
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

      <footer className="border-t border-[#e8ddd8] py-8 text-center text-sm text-[#9a7060]">
        © {new Date().getFullYear()} PropCloud · Honduras
      </footer>
    </div>
  );
}
