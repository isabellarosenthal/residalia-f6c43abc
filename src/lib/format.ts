export const fmtL = (n: number | null | undefined) =>
  typeof n === "number" ? `L ${n.toLocaleString("es-HN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : "L 0";

export const fmtDate = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("es-HN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const fmtPhone = (p: string | null | undefined) => p || "—";

export const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
