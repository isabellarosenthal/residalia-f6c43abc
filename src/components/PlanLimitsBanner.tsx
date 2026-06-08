import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Crown, Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui-pentos";
import { getMyPlanUsage } from "@/lib/plan-usage.functions";

type Focus = "edificios" | "unidades" | "admins" | "all";

export function PlanLimitsBanner({ focus = "all" }: { focus?: Focus }) {
  const fetchUsage = useServerFn(getMyPlanUsage);
  const { data, isLoading } = useQuery({ queryKey: ["plan-usage"], queryFn: () => fetchUsage() });
  if (isLoading || !data) return null;
  const unl = data.unlimited;
  const fmt = (m: number) => (m >= unl ? "∞" : m.toString());

  const totalUnid = data.porEdificio.reduce((a, e) => a + e.unidades.used, 0);
  const maxUnid = data.porEdificio.reduce((a, e) => a + (e.unidades.max >= unl ? unl : e.unidades.max), 0);

  const items = [
    { label: "Edificios", used: data.edificios.used, max: data.edificios.max, show: focus === "edificios" || focus === "all" },
    { label: "Unidades", used: totalUnid, max: maxUnid, show: focus === "unidades" || focus === "all" },
    { label: "Admins", used: data.admins.used, max: data.admins.max, show: focus === "admins" || focus === "all" },
  ];

  const enTrial = data.estado === "trial" && data.activa;
  const expirada = !data.activa;

  return (
    <div className="space-y-2">
      {expirada && (
        <Card className="p-3 bg-[#FEF2F2] border-[#FCA5A5]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-[#7F1D1D]">
              <AlertTriangle className="w-4 h-4" />
              <b>Tu prueba terminó.</b> La cuenta está en solo lectura.
            </div>
            <Link to="/planes" className="text-xs font-semibold bg-[#DC2626] text-white px-3 py-1.5 rounded-full hover:bg-[#B91C1C]">
              Elegir plan
            </Link>
          </div>
        </Card>
      )}
      <Card className="p-3 bg-[#ffffff] border-[#E2E8F0]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Crown className="w-3.5 h-3.5 text-[#4A154B]" />
            <span className="font-medium text-[#4A154B]">{data.plan.nombre}</span>
          </div>
          {enTrial && data.diasRestantes !== null && (
            <Link to="/planes" className="flex items-center gap-1.5 text-xs bg-[#FEF3C7] text-[#92400E] px-2.5 py-1 rounded-full font-medium hover:bg-[#FDE68A]">
              <Clock className="w-3 h-3" />
              Prueba gratis: {data.diasRestantes} {data.diasRestantes === 1 ? "día" : "días"} restantes
            </Link>
          )}
          {items.filter(i => i.show).map(i => (
            <div key={i.label} className="text-xs text-[#5a4030]">
              <span className="text-[#64748B]">{i.label}:</span> <b>{i.used}</b> / {fmt(i.max)}
            </div>
          ))}
          <Link to="/planes" className="ml-auto text-xs text-[#4A154B] hover:underline">Ver planes</Link>
        </div>
      </Card>
    </div>
  );
}
