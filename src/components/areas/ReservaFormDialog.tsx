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
});
type FormVals = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

const nowLocal = (addH = 0) => {
  const d = new Date(); d.setHours(d.getHours() + addH); d.setMinutes(0 - d.getTimezoneOffset(), 0, 0);
  return d.toISOString().slice(0, 16);
};

export function ReservaFormDialog({
  open, onOpenChange, reserva, defaultCondominioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; reserva?: Reserva | null; defaultCondominioId?: string }) {
  const save = useSaveReserva();
  const { data: edificios = [] } = useEdificios();
  const { data: residentes = [] } = useResidentes();
  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    defaultValues: {
      condominio_id: defaultCondominioId ?? "", area_id: "",
      unidad_id: null, residente_id: null,
      fecha_inicio: nowLocal(1), fecha_fin: nowLocal(3),
      num_personas: 0, estado: "confirmada", descripcion: "",
    },
  });
  const condominioId = form.watch("condominio_id");
  const areaId = form.watch("area_id");
  const fIni = form.watch("fecha_inicio");
  const fFin = form.watch("fecha_fin");
  const { data: areas = [] } = useAreas(condominioId || undefined);
  const { data: unidades = [] } = useUnidades(condominioId || undefined);
  const { data: allReservas = [] } = useReservas(condominioId || undefined);

  const conflicto = (() => {
    if (!areaId || !fIni || !fFin) return null;
    const ini = new Date(fIni).getTime();
    const fin = new Date(fFin).getTime();
    if (!(fin > ini)) return { tipo: "rango", mensaje: "La hora fin debe ser posterior al inicio." };
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
      area_id: reserva?.area_id ?? "",
      unidad_id: reserva?.unidad_id ?? null,
      residente_id: reserva?.residente_id ?? null,
      fecha_inicio: reserva?.fecha_inicio ? new Date(reserva.fecha_inicio).toISOString().slice(0, 16) : nowLocal(1),
      fecha_fin: reserva?.fecha_fin ? new Date(reserva.fecha_fin).toISOString().slice(0, 16) : nowLocal(3),
      num_personas: reserva?.num_personas ?? 0,
      estado: (reserva?.estado as any) ?? "confirmada",
      descripcion: reserva?.descripcion ?? "",
    });
  }, [open, reserva, defaultCondominioId, form]);

  const onSubmit = async (v: FormOut) => {
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
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-xl text-[#2d1200]">{reserva ? "Editar reserva" : "Nueva reserva"}</DialogTitle></DialogHeader>
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
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending} className="bg-[#c94f0c] hover:bg-[#a33d08]">{save.isPending ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
