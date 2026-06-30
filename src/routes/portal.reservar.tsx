import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMiResidente, useAreas, useReservas, useSaveReserva } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CalendarCheck } from "lucide-react";
import { PortalLoading, PortalSinResidente } from "@/components/portal/PortalStates";
import { toast } from "sonner";

export const Route = createFileRoute("/portal/reservar")({ component: Reservar });

const nowLocal = (addH = 1) => {
  const d = new Date(); d.setHours(d.getHours() + addH, 0, 0, 0);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const fmtDT = (s: string) => new Date(s).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" });

function Reservar() {
  const { data: residente, isLoading } = useMiResidente();
  const condoId = residente?.condominio_id;
  const { data: areas = [] } = useAreas(condoId);
  const { data: reservas = [] } = useReservas(condoId);
  const save = useSaveReserva();
  const navigate = useNavigate();

  const [areaId, setAreaId] = useState("");
  const [ini, setIni] = useState(nowLocal(1));
  const [fin, setFin] = useState(nowLocal(3));
  const [personas, setPersonas] = useState(1);
  const [descripcion, setDescripcion] = useState("");

  if (isLoading) return <PortalLoading />;
  if (!residente) return <PortalSinResidente />;

  const area = areas.find((a) => a.id === areaId);
  const excedeCap = !!(area?.capacidad && personas > area.capacidad);
  const personasExtra = excedeCap ? personas - (area!.capacidad as number) : 0;
  const costoPersonas = personasExtra * Number((area as any)?.costo_por_persona_extra ?? 0);
  const horasReserva = ini && fin ? Math.max(0, (new Date(fin).getTime() - new Date(ini).getTime()) / 3600000) : 0;
  const horasIncluidas = Number((area as any)?.horas_incluidas ?? 0);
  const costoHora = Number((area as any)?.costo_por_hora_extra ?? 0);
  const horasExtra = horasIncluidas > 0 && costoHora > 0 ? Math.max(0, horasReserva - horasIncluidas) : 0;
  const costoHoras = horasExtra * costoHora;
  const costoExtra = costoPersonas + costoHoras;
  const permiteExceso = (area as { permite_exceso?: boolean } | undefined)?.permite_exceso !== false;

  const conflicto = (() => {
    if (!areaId || !ini || !fin) return null;
    const i = new Date(ini).getTime(), f = new Date(fin).getTime();
    if (!(f > i)) return "La hora fin debe ser posterior al inicio.";
    if (area?.horario_inicio && area?.horario_fin) {
      const iD = new Date(ini), fD = new Date(fin);
      const [hi, mi] = area.horario_inicio.split(":").map(Number);
      const [hf, mf] = area.horario_fin.split(":").map(Number);
      const sMin = hi * 60 + (mi || 0), eMin = hf * 60 + (mf || 0);
      const iMin = iD.getHours() * 60 + iD.getMinutes(), fMin = fD.getHours() * 60 + fD.getMinutes();
      if (iD.toDateString() !== fD.toDateString() || iMin < sMin || fMin > eMin)
        return `${area.nombre} solo está disponible de ${area.horario_inicio.slice(0,5)} a ${area.horario_fin.slice(0,5)}.`;
    }
    const choque = reservas.find((r) =>
      r.area_id === areaId && r.estado !== "cancelada" &&
      new Date(r.fecha_inicio).getTime() < f && new Date(r.fecha_fin).getTime() > i
    );
    if (choque) return `Conflicto con otra reserva: ${fmtDT(choque.fecha_inicio)} – ${new Date(choque.fecha_fin).toLocaleTimeString("es-HN", { timeStyle: "short" })}`;
    if (excedeCap && !permiteExceso) return `Esta área no permite exceder la capacidad (${area?.capacidad}).`;
    return null;
  })();

  const [nota, setNota] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (conflicto || !areaId || !condoId) return;
    if (excedeCap && !nota.trim()) {
      return; // forzar nota cuando excede
    }
    try {
      await save.mutateAsync({
        condominio_id: condoId,
        area_id: areaId,
        unidad_id: residente.unidad_id,
        residente_id: residente.id,
        fecha_inicio: new Date(ini).toISOString(),
        fecha_fin: new Date(fin).toISOString(),
        num_personas: personas,
        estado: "pendiente",
        descripcion: descripcion || null,
        excede_capacidad: excedeCap,
        personas_extra: personasExtra,
        horas_extra: horasExtra,
        monto_extra: costoExtra,
        solicitud_nota: excedeCap ? nota : null,
      } as Parameters<typeof save.mutateAsync>[0]);
      toast.success(excedeCap ? "Solicitud enviada — espera autorización" : "Reserva solicitada");
      navigate({ to: "/portal/reservar" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear la reserva");
    }
  };


  const proximas = reservas
    .filter((r) => r.residente_id === residente.id && new Date(r.fecha_fin) >= new Date())
    .sort((a, b) => +new Date(a.fecha_inicio) - +new Date(b.fecha_inicio));

  return (
    <div className="space-y-5">
      <h1 className="font-display font-extrabold text-xl text-[#0F172A]">Reservar área común</h1>

      <form onSubmit={submit} className="space-y-4 bg-white border border-[#E2E8F0] rounded-2xl p-5">
        <div>
          <Label>Área *</Label>
          <Select value={areaId} onValueChange={setAreaId}>
            <SelectTrigger><SelectValue placeholder="Selecciona un área" /></SelectTrigger>
            <SelectContent>{areas.filter(a => a.activa).map(a => <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>)}</SelectContent>
          </Select>
          {area?.horario_inicio && area?.horario_fin && (
            <p className="text-[11px] text-[#64748B] mt-1">Disponible {area.horario_inicio.slice(0,5)}–{area.horario_fin.slice(0,5)}{area.capacidad ? ` · Capacidad ${area.capacidad}` : ""}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Inicio *</Label><Input type="datetime-local" value={ini} onChange={(e) => setIni(e.target.value)} required /></div>
          <div><Label>Fin *</Label><Input type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} required /></div>
        </div>
        <div>
          <Label>N° personas</Label>
          <Input type="number" min={1} value={personas} onChange={(e) => setPersonas(Math.max(1, Number(e.target.value) || 1))} />
        </div>
        <div><Label>Motivo / notas</Label><Textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej: Cumpleaños familiar" /></div>

        {excedeCap && permiteExceso && (
          <div className="bg-[#FEF3C7] border border-[#FCD34D] text-[#78350F] rounded-lg p-3 text-sm space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold">Excedes la capacidad ({area?.capacidad})</div>
                <div className="text-xs">+{personasExtra} {personasExtra === 1 ? "persona" : "personas"} extra. Necesita autorización del administrador{costoExtra > 0 ? ` y pago adicional de L ${costoExtra.toFixed(2)}` : ""}.</div>
              </div>
            </div>
            <Textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Explica al administrador por qué necesitas exceder la capacidad…" required />
          </div>
        )}

        {horasExtra > 0 && (
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] rounded-lg p-3 text-sm">
            <div className="font-semibold">Horas extra: {horasExtra.toFixed(1)}h</div>
            <div className="text-xs">Incluye {horasIncluidas}h. Cargo adicional: L {costoHoras.toFixed(2)} ({horasExtra.toFixed(1)}h × L {costoHora.toFixed(2)}).</div>
          </div>
        )}

        {conflicto && (
          <div className="flex items-start gap-2 bg-[#fde8e2] border border-[#f5b8a8] text-[#7a2a10] rounded-lg p-3 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{conflicto}
          </div>
        )}
        <Button type="submit" disabled={save.isPending || !!conflicto || !areaId || (excedeCap && !nota.trim())} className="w-full bg-[#4A154B] hover:bg-[#350d36]">
          {save.isPending ? "Reservando…" : excedeCap ? "Solicitar autorización" : "Solicitar reserva"}
        </Button>
        <p className="text-xs text-[#64748B] text-center">La administración confirmará tu reserva.</p>

      </form>

      {proximas.length > 0 && (
        <div>
          <h2 className="font-display font-extrabold text-lg text-[#0F172A] mb-2">Mis próximas reservas</h2>
          <div className="space-y-2">
            {proximas.map((r) => {
              const a = areas.find((x) => x.id === r.area_id);
              return (
                <div key={r.id} className="bg-white border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-3">
                  <CalendarCheck className="w-5 h-5 text-[#4A154B]" />
                  <div className="flex-1">
                    <div className="font-semibold text-[#4A154B]">{a?.nombre ?? "Área"}</div>
                    <div className="text-xs text-[#64748B]">{fmtDT(r.fecha_inicio)} – {new Date(r.fecha_fin).toLocaleTimeString("es-HN", { timeStyle: "short" })}</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide bg-[#fde8e2] text-[#4A154B] px-2 py-0.5 rounded-full">{r.estado}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
