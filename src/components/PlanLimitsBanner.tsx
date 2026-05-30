import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Crown } from "lucide-react";
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
  const totalAdm = data.porEdificio.reduce((a, e) => a + e.admins.used, 0);
  const maxAdm = data.porEdificio.reduce((a, e) => a + (e.admins.max >= unl ? unl : e.admins.max), 0);

  const items = [
    { label: "Edificios", used: data.edificios.used, max: data.edificios.max, show: focus === "edificios" || focus === "all" },
    { label: "Unidades", used: totalUnid, max: maxUnid, show: focus === "unidades" || focus === "all" },
    { label: "Admins", used: totalAdm, max: maxAdm, show: focus === "admins" || focus === "all" },
  ];

  return (
    <Card className="p-3 bg-[#ffffff] border-[#E2E8F0]">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Crown className="w-3.5 h-3.5 text-[#374151]" />
          <span className="font-medium text-[#374151]">{data.plan.nombre}</span>
        </div>
        {items.filter(i => i.show).map(i => (
          <div key={i.label} className="text-xs text-[#5a4030]">
            <span className="text-[#64748B]">{i.label}:</span> <b>{i.used}</b> / {fmt(i.max)}
          </div>
        ))}
      </div>
    </Card>
  );
}
