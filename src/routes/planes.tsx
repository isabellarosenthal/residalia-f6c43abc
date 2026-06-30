import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Crown, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui-pentos";
import { getMyPlanUsage } from "@/lib/plan-usage.functions";

export const Route = createFileRoute("/planes")({
  component: PlanesPage,
});

const PLANES = [
  {
    nombre: "Lobby",
    precio: 990,
    edificios: 1,
    unidades: 60,
    admins: 2,
    features: ["1 edificio", "Hasta 60 unidades", "2 administradores", "Control de accesos", "Finanzas básicas"],
  },
  {
    nombre: "Torre",
    precio: 2490,
    edificios: 3,
    unidades: 150,
    admins: 5,
    features: ["3 edificios", "Hasta 150 unidades por edificio", "5 administradores", "Reportes avanzados", "Soporte prioritario"],
    popular: true,
  },
  {
    nombre: "Penthouse",
    precio: 4990,
    edificios: null,
    unidades: null,
    admins: null,
    features: ["Edificios ilimitados", "Unidades ilimitadas", "Admins ilimitados", "Integraciones a medida", "Soporte dedicado"],
  },
];

function PlanesPage() {
  const fetchUsage = useServerFn(getMyPlanUsage);
  const { data } = useQuery({ queryKey: ["plan-usage"], queryFn: () => fetchUsage() });
  const actual = data?.plan.nombre;

  const contactarHref = (plan: string) =>
    `mailto:ventas@residalia.com?subject=${encodeURIComponent(`Quiero contratar el plan ${plan}`)}&body=${encodeURIComponent(`Hola, me interesa contratar el plan ${plan} de Residalia.`)}`;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1C1D]">Planes</h1>
          <p className="text-sm text-[#64748B]">Elige el plan que mejor se ajusta a tu operación.</p>
        </div>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-[#4A154B] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        {data?.estado === "trial" && data.activa && data.diasRestantes !== null && (
          <Card className="p-4 bg-[#FEF3C7] border-[#FCD34D]">
            <p className="text-sm text-[#92400E]">
              Estás en prueba gratis del plan <b>{actual}</b>. Te quedan <b>{data.diasRestantes} {data.diasRestantes === 1 ? "día" : "días"}</b>.
              Cuando termine, la cuenta quedará en solo lectura hasta que actives un plan.
            </p>
          </Card>
        )}
        {data && !data.activa && (
          <Card className="p-4 bg-[#FEF2F2] border-[#FCA5A5]">
            <p className="text-sm text-[#7F1D1D]">
              Tu prueba gratis terminó. La cuenta está en solo lectura. Contáctanos para activar tu plan.
            </p>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          {PLANES.map((p) => {
            const esActual = actual?.toLowerCase() === p.nombre.toLowerCase();
            return (
              <Card key={p.nombre} className={`p-6 relative ${p.popular ? "border-2 border-[#4A154B]" : "border-[#E2E8F0]"} ${esActual ? "ring-2 ring-[#10B981]" : ""}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4A154B] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                    Más popular
                  </div>
                )}
                {esActual && (
                  <div className="absolute -top-3 right-4 bg-[#10B981] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full">
                    Tu plan
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-[#4A154B]" />
                  <h3 className="text-xl font-bold text-[#1D1C1D]">{p.nombre}</h3>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-[#1D1C1D]">L {p.precio.toLocaleString()}</span>
                  <span className="text-sm text-[#64748B]"> /mes</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#334155]">
                      <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={contactarHref(p.nombre)}
                  className={`block text-center font-semibold py-2.5 rounded-full transition ${
                    p.popular
                      ? "bg-[#4A154B] text-white hover:bg-[#350d36]"
                      : "border border-[#4A154B] text-[#4A154B] hover:bg-[#4A154B] hover:text-white"
                  }`}
                >
                  {esActual ? "Activar este plan" : "Contactar"}
                </a>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-[#64748B]">
          Todos los planes incluyen 14 días de prueba gratis. Para activar tu plan escríbenos a{" "}
          <a href="mailto:ventas@residalia.com" className="text-[#4A154B] hover:underline">ventas@residalia.com</a>.
        </p>
      </div>
    </AppShell>
  );
}
