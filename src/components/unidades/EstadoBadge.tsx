const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold";

export function EstadoAdminBadge({ value }: { value: "ocupada" | "disponible" | "vacia" }) {
  const map = {
    ocupada:  { cls: "bg-gray-200 text-gray-600",          l: "Ocupada" },
    disponible: { cls: "bg-emerald-100 text-emerald-700", l: "Disponible" },
    vacia:    { cls: "bg-purple-100 text-purple-700",    l: "Vacía" },
  } as const;
  const c = map[value];
  return <span className={`${base} ${c.cls}`}>{c.l}</span>;
}

export function EstadoComercialBadge({ value }: { value: "ocupada" | "disponible" | "en_venta" | "en_renta" | "en_venta_y_renta" | "reservada" }) {
  const map = {
    ocupada:         { cls: "bg-gray-200 text-gray-600",          l: "—" },
    disponible:      { cls: "bg-blue-100 text-blue-700",          l: "Disponible" },
    en_venta:        { cls: "bg-pink-100 text-pink-700",          l: "En venta" },
    en_renta:        { cls: "bg-cyan-100 text-cyan-700",          l: "En renta" },
    en_venta_y_renta:{ cls: "bg-fuchsia-100 text-fuchsia-700",    l: "Venta/Renta" },
    reservada:       { cls: "bg-amber-100 text-amber-700",        l: "Reservada" },
  } as const;
  const c = map[value];
  return <span className={`${base} ${c.cls}`}>{c.l}</span>;
}
