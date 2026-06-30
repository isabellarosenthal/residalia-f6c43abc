import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveReserva, useEdificios, useAreas, useUnidades, useResidentes, useReservas, type Reserva } from "@/lib/queries";
import { AlertTriangle } from "lucide-react";

const schema = z.object({
  condominio_id: z.string().uuid("Selecciona edificio"),
  area_id: z.string().uuid("Selecciona área"),
  unidad_id: z.string().nullable().optional(),
  residente_id: z.string().nullable().optional(),
  fecha_inicio: z.string().min(1, "Requerido"),
  fecha_fin: z.string().min(1, "Requerido"),
  num_personas: z.coerce.number().int().min(0).optional(),
  estado: z.enum(["confirmada", "pendiente", "cancelada"]),
  descripcion: z.string().max(500).optional().or(z.literal("")),
  monto_extra: z.coerce.number().min(0).default(0),
  pagado_extra: z.boolean().default(false),
});

type FormVals = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

const toLocalInput = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const nowLocal = (addH = 0) => {
  const d = new Date(); d.setHours(d.getHours() + addH, 0, 0, 0);
  return toLocalInput(d);
};

export function ReservaFormDialog({
  open, onOpenChange, reserva, defaultCondominioId, initialStart, initialEnd, defaultAreaId,
}: { open: boolean; onOpenChange: (v: boolean) => void; reserva?: Reserva | null; defaultCondominioId?: string; initialStart?: Date | null; initialEnd?: Date | null; defaultAreaId?: string }) {
  const save = useSaveReserva();
  const { data: edificios = [] } = useEdificios();
  const { data: residentes = [] } = useResidentes();
  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    defaultValues: {
      condominio_id: defaultCondominioId ?? "", area_id: "",
      unidad_id: null, residente_id: null,
      fecha_inicio: nowLocal(1), fecha_fin: nowLocal(3),
      num_personas: 0, estado: "confirmada", descripcion: "", monto_extra: 0, pagado_extra: false,
    },
  });
  const condominioId = form.watch("condominio_id");
  const areaId = form.watch("area_id");
  const fIni = form.watch("fecha_inicio");
  const fFin = form.watch("fecha_fin");
  const { data: areas = [] } = useAreas(condominioId || undefined);
  const { data: unidades = [] } = useUnidades(condominioId || undefined);
  const { data: allReservas = [] } = useReservas(condominioId || undefined);

  const areaSel = areas.find((a) => a.id === areaId);

  const conflicto = (() => {
    if (!areaId || !fIni || !fFin) return null;
    const iniD = new Date(fIni);
    const finD = new Date(fFin);
    const ini = iniD.getTime();
    const fin = finD.getTime();
    if (!(fin > ini)) return { tipo: "rango", mensaje: "La hora fin debe ser posterior al inicio." };

    // Horario del área
    if (areaSel?.horario_inicio && areaSel?.horario_fin) {
      const [hi, mi] = areaSel.horario_inicio.split(":").map(Number);
      const [hf, mf] = areaSel.horario_fin.split(":").map(Number);
      const startMin = hi * 60 + (mi || 0);
      const endMin = hf * 60 + (mf || 0);
      const cruzaMedianoche = endMin <= startMin;
      const inMin = iniD.getHours() * 60 + iniD.getMinutes();
      const finMin = finD.getHours() * 60 + finD.getMinutes();
      const dentro = (m: number) =>
        cruzaMedianoche ? (m >= startMin || m <= endMin) : (m >= startMin && m <= endMin);
      const fmt = (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      // Cuando la reserva dura varios días o cruza fuera del horario diario
      const mismoDia = iniD.toDateString() === finD.toDateString();
      const valido = mismoDia && dentro(inMin) && dentro(finMin) && (cruzaMedianoche || finMin >= inMin);
      if (!valido) return {
        tipo: "horario",
        mensaje: `${areaSel.nombre} solo está disponible de ${fmt(hi, mi || 0)} a ${fmt(hf, mf || 0)}.`,
      };
    }

    const choque = allReservas.find((r) =>
      r.area_id === areaId &&
      r.estado !== "cancelada" &&
      r.id !== reserva?.id &&
      new Date(r.fecha_inicio).getTime() < fin &&
      new Date(r.fecha_fin).getTime() > ini
    );
    if (choque) return {
      tipo: "overlap",
      mensaje: `Conflicto con otra reserva: ${new Date(choque.fecha_inicio).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" })} – ${new Date(choque.fecha_fin).toLocaleString("es-HN", { timeStyle: "short" })}`,
    };
    return null;
  })();

  useEffect(() => {
    if (!open) return;
    form.reset({
      condominio_id: reserva?.condominio_id ?? defaultCondominioId ?? "",
      area_id: reserva?.area_id ?? defaultAreaId ?? "",
      unidad_id: reserva?.unidad_id ?? null,
      residente_id: reserva?.residente_id ?? null,
      fecha_inicio: reserva?.fecha_inicio
        ? toLocalInput(new Date(reserva.fecha_inicio))
        : initialStart ? toLocalInput(initialStart) : nowLocal(1),
      fecha_fin: reserva?.fecha_fin
        ? toLocalInput(new Date(reserva.fecha_fin))
        : initialEnd ? toLocalInput(initialEnd) : nowLocal(3),
      num_personas: reserva?.num_personas ?? 0,
      estado: (reserva?.estado as any) ?? "confirmada",
      descripcion: reserva?.descripcion ?? "",
      monto_extra: Number((reserva as any)?.monto_extra ?? 0),
      pagado_extra: (reserva as any)?.pagado_extra ?? false,
    });
  }, [open, reserva, defaultCondominioId, defaultAreaId, initialStart, initialEnd, form]);

  const personas = form.watch("num_personas") ?? 0;
  const excedeCap = !!(areaSel?.capacidad && personas > areaSel.capacidad);
  const personasExtra = excedeCap ? personas - (areaSel!.capacidad as number) : 0;
  const horasReserva = fIni && fFin ? Math.max(0, (new Date(fFin).getTime() - new Date(fIni).getTime()) / 3600000) : 0;
  const horasIncluidas = Number((areaSel as any)?.horas_incluidas ?? 0);
  const costoHora = Number((areaSel as any)?.costo_por_hora_extra ?? 0);
  const horasExtra = horasIncluidas > 0 && costoHora > 0 ? Math.max(0, horasReserva - horasIncluidas) : 0;
  const costoHoras = horasExtra * costoHora;
  const costoPersonas = personasExtra * Number((areaSel as any)?.costo_por_persona_extra ?? 0);
  const montoExtraSugerido = costoPersonas + costoHoras;

  // Auto-actualizar monto_extra cuando cambia área/personas/horas (si no fue editado manualmente y es nueva)
  useEffect(() => {
    if (reserva?.id) return; // no sobreescribir al editar
    form.setValue("monto_extra", montoExtraSugerido);
  }, [montoExtraSugerido, reserva?.id, form]);

  const onSubmit = async (v: FormOut) => {
    // admin puede ignorar conflictos de capacidad/horario; los de overlap igual los bloqueamos
    if (conflicto && conflicto.tipo === "overlap") return;
    if (conflicto && conflicto.tipo === "rango") return;
    await save.mutateAsync({
      id: reserva?.id,
      condominio_id: v.condominio_id,
      area_id: v.area_id,
      unidad_id: v.unidad_id || null,
      residente_id: v.residente_id || null,
      fecha_inicio: new Date(v.fecha_inicio).toISOString(),
      fecha_fin: new Date(v.fecha_fin).toISOString(),
      num_personas: v.num_personas ?? null,
      estado: v.estado,
      descripcion: v.descripcion || null,
      excede_capacidad: excedeCap,
      personas_extra: personasExtra,
      horas_extra: horasExtra,
      monto_extra: v.monto_extra ?? 0,
      pagado_extra: v.pagado_extra ?? false,
    } as any);
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-xl text-[#0F172A]">{reserva ? "Editar reserva" : "Nueva reserva"}</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Edificio *</Label>
              <Select value={condominioId} onValueChange={(v) => { form.setValue("condominio_id", v); form.setValue("area_id", ""); form.setValue("unidad_id", null); }}>
                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent className="max-h-72">{edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Área *</Label>
              <Select value={form.watch("area_id")} onValueChange={(v) => form.setValue("area_id", v)} disabled={!condominioId}>
                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent className="max-h-72">{areas.filter(a => a.activa).map((a) => <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>)}</SelectContent>
              </Select>
              {areaSel?.horario_inicio && areaSel?.horario_fin && (
                <p className="text-[11px] text-[#64748B] mt-1">
                  Disponible {areaSel.horario_inicio.slice(0, 5)}–{areaSel.horario_fin.slice(0, 5)}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Inicio *</Label><Input type="datetime-local" {...form.register("fecha_inicio")} /></div>
            <div><Label>Fin *</Label><Input type="datetime-local" {...form.register("fecha_fin")} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Unidad</Label>
              <Select value={form.watch("unidad_id") ?? "__none__"} onValueChange={(v) => form.setValue("unidad_id", v === "__none__" ? null : v)} disabled={!condominioId}>
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="__none__">Sin asignar</SelectItem>
                  {unidades.map((u) => <SelectItem key={u.id} value={u.id}>#{u.numero}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Residente</Label>
              <Select value={form.watch("residente_id") ?? "__none__"} onValueChange={(v) => form.setValue("residente_id", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="__none__">Sin asignar</SelectItem>
                  {residentes.map((r) => <SelectItem key={r.id} value={r.id}>{r.nombre} {r.apellido}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>N° personas</Label><Input type="number" {...form.register("num_personas")} /></div>
            <div>
              <Label>Estado</Label>
              <Select value={form.watch("estado")} onValueChange={(v) => form.setValue("estado", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Descripción</Label><Textarea rows={2} {...form.register("descripcion")} /></div>

          {excedeCap && (
            <div className="bg-[#FEF3C7] border border-[#FCD34D] text-[#78350F] rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold">Excede capacidad ({areaSel?.capacidad})</div>
                  <div className="text-xs">+{personasExtra} extra. Como administrador puedes autorizar cobrando el monto extra.</div>
                  {(reserva as any)?.solicitud_nota && <div className="text-xs italic mt-1">Nota del residente: "{(reserva as any).solicitud_nota}"</div>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[#78350F]">Monto extra (L)</Label>
                  <Input type="number" step="0.01" {...form.register("monto_extra")} />
                </div>
                <div className="flex items-end gap-2">
                  <input type="checkbox" id="pagado_extra" {...form.register("pagado_extra")} className="w-4 h-4" />
                  <Label htmlFor="pagado_extra" className="cursor-pointer">Marcar como pagado</Label>
                </div>
              </div>
            </div>
          )}

          {horasExtra > 0 && (
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] rounded-lg p-3 text-sm space-y-2">
              <div className="font-semibold">Horas extra: {horasExtra.toFixed(1)}h ({horasReserva.toFixed(1)}h reservadas − {horasIncluidas}h incluidas)</div>
              <div className="text-xs">Cargo automático: L {costoHoras.toFixed(2)} ({horasExtra.toFixed(1)}h × L {costoHora.toFixed(2)}).</div>
              {!excedeCap && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[#1E3A8A]">Monto extra (L)</Label>
                    <Input type="number" step="0.01" {...form.register("monto_extra")} />
                  </div>
                  <div className="flex items-end gap-2">
                    <input type="checkbox" id="pagado_extra_h" {...form.register("pagado_extra")} className="w-4 h-4" />
                    <Label htmlFor="pagado_extra_h" className="cursor-pointer">Marcar como pagado</Label>
                  </div>
                </div>
              )}
            </div>
          )}

          {conflicto && conflicto.tipo !== "horario" && (
            <div className="flex items-start gap-2 bg-[#fde8e2] border border-[#f5b8a8] text-[#7a2a10] rounded-lg p-3 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{conflicto.mensaje}</span>
            </div>
          )}
          {conflicto?.tipo === "horario" && (
            <div className="flex items-start gap-2 bg-[#FEF3C7] border border-[#FCD34D] text-[#78350F] rounded-lg p-3 text-sm">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{conflicto.mensaje} (Admin: se permitirá guardar igual)</span>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending || conflicto?.tipo === "overlap" || conflicto?.tipo === "rango"} className="bg-[#4A154B] hover:bg-[#350d36]">{save.isPending ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
}
