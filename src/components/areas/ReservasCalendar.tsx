import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, CalendarRange } from "lucide-react";
import { useReservas, useAreas, type Reserva } from "@/lib/queries";
import { ReservaFormDialog } from "./ReservaFormDialog";

const DOW = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0..23

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // lunes=0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

const colorFor = (id: string) => {
  const palette = ["#c94f0c", "#2d6a2d", "#7a3aa3", "#0d6f8a", "#a83a5a", "#8a5a00"];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
};

export function ReservasCalendar({ edificioId }: { edificioId: string }) {
  const [areaFilter, setAreaFilter] = useState("all");
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Reserva | null>(null);
  const [slot, setSlot] = useState<{ start: Date; end: Date } | null>(null);
  const { data: reservas = [] } = useReservas(edificioId === "all" ? undefined : edificioId);
  const { data: areas = [] } = useAreas(edificioId === "all" ? undefined : edificioId);

  const openCreate = (start: Date) => {
    const end = new Date(start); end.setHours(end.getHours() + 1);
    setEditing(null); setSlot({ start, end }); setDialogOpen(true);
  };
  const openEdit = (r: Reserva) => { setEditing(r); setSlot(null); setDialogOpen(true); };

  const weekEnd = useMemo(() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); return d; }, [weekStart]);

  const visibles = useMemo(() => reservas.filter((r) => {
    if (r.estado === "cancelada") return false;
    if (areaFilter !== "all" && r.area_id !== areaFilter) return false;
    const ini = new Date(r.fecha_inicio).getTime();
    return ini >= weekStart.getTime() && ini < weekEnd.getTime();
  }), [reservas, areaFilter, weekStart, weekEnd]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
  }), [weekStart]);

  const areaName = (id: string) => areas.find((a) => a.id === id)?.nombre ?? "—";

  const shift = (n: number) => { const d = new Date(weekStart); d.setDate(d.getDate() + n * 7); setWeekStart(d); };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => shift(-1)}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>Hoy</Button>
          <Button variant="outline" size="sm" onClick={() => shift(1)}><ChevronRight className="w-4 h-4" /></Button>
          <span className="text-sm text-[#5a3a2a] ml-2">
            {weekStart.toLocaleDateString("es-HN", { day: "numeric", month: "short" })} – {new Date(weekEnd.getTime() - 86400000).toLocaleDateString("es-HN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las áreas</SelectItem>
            {areas.map((a) => <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-[#e8ddd8] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-[#e8ddd8] bg-[#f5ede8]">
          <div></div>
          {days.map((d, i) => {
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div key={i} className={`text-center py-2 text-xs font-semibold ${isToday ? "text-[#c94f0c]" : "text-[#2d1200]"}`}>
                {DOW[i]}<br /><span className="text-base font-display">{d.getDate()}</span>
              </div>
            );
          })}
        </div>
        <div className="relative grid grid-cols-[60px_repeat(7,1fr)]" style={{ minHeight: HOURS.length * 36 }}>
          <div className="border-r border-[#f0e6e0]">
            {HOURS.map((h) => (
              <div key={h} className="h-9 text-[10px] text-[#9a7060] text-right pr-1 -mt-1">{h}:00</div>
            ))}
          </div>
          {days.map((d, di) => {
            const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
            const dayReservas = visibles.filter((r) => {
              const ini = new Date(r.fecha_inicio); return ini >= dayStart && ini <= dayEnd;
            });
            return (
              <div key={di} className="relative border-r border-[#f0e6e0] last:border-r-0">
                {HOURS.map((h) => <div key={h} className="h-9 border-b border-[#f5ede8]" />)}
                {dayReservas.map((r) => {
                  const ini = new Date(r.fecha_inicio);
                  const fin = new Date(r.fecha_fin);
                  const startMin = ini.getHours() * 60 + ini.getMinutes() - HOURS[0] * 60;
                  const durMin = Math.max(20, (fin.getTime() - ini.getTime()) / 60000);
                  if (startMin < 0 || startMin > HOURS.length * 60) return null;
                  const top = (startMin / 60) * 36;
                  const height = (durMin / 60) * 36;
                  const c = colorFor(r.area_id);
                  return (
                    <div key={r.id}
                      className="absolute left-1 right-1 rounded-md text-white text-[10px] leading-tight px-1.5 py-1 overflow-hidden shadow-sm"
                      style={{ top, height, backgroundColor: c, opacity: r.estado === "pendiente" ? 0.7 : 1 }}
                      title={`${areaName(r.area_id)} · ${ini.toLocaleTimeString("es-HN", { timeStyle: "short" })} – ${fin.toLocaleTimeString("es-HN", { timeStyle: "short" })}`}
                    >
                      <div className="font-semibold truncate">{areaName(r.area_id)}</div>
                      <div className="opacity-90">{ini.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {visibles.length === 0 && (
        <div className="text-center text-[#9a7060] py-6 text-sm flex items-center justify-center gap-2">
          <CalendarRange className="w-4 h-4" />Sin reservas esta semana.
        </div>
      )}
    </div>
  );
}
