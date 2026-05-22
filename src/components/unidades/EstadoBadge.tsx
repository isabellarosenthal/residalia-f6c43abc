import { Badge } from "@/components/ui-pentos";

export function EstadoAdminBadge({ value }: { value: "ocupada" | "disponible" | "vacia" }) {
  const map = {
    ocupada: { v: "neutral" as const, l: "Ocupada" },
    disponible: { v: "success" as const, l: "Disponible" },
    vacia: { v: "neutral" as const, l: "Vacía" },
  };
  const c = map[value];
  return <Badge variant={c.v}>{c.l}</Badge>;
}

export function EstadoComercialBadge({ value }: { value: "ocupada" | "disponible" | "en_venta" | "en_renta" | "en_venta_y_renta" | "reservada" }) {
  const map = {
    ocupada: { v: "neutral" as const, l: "—" },
    disponible: { v: "success" as const, l: "Disponible" },
    en_venta: { v: "venta" as const, l: "En venta" },
    en_renta: { v: "renta" as const, l: "En renta" },
    en_venta_y_renta: { v: "venta" as const, l: "Venta/Renta" },
    reservada: { v: "reservada" as const, l: "Reservada" },
  };
  const c = map[value];
  return <Badge variant={c.v}>{c.l}</Badge>;
}
