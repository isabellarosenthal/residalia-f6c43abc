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
import { useSaveCobro, useEdificios, useUnidades, useResidentes, type Cobro } from "@/lib/queries";

const schema = z.object({
  condominio_id: z.string().uuid("Selecciona edificio"),
  unidad_id: z.string().nullable().optional(),
  residente_id: z.string().nullable().optional(),
  concepto: z.string().min(1, "Requerido").max(200),
  monto: z.coerce.number().min(0),
  fecha_vencimiento: z.string().min(1, "Requerido"),
  estado: z.enum(["pendiente", "pagado", "parcial", "vencido"]),
  metodo_pago: z.string().max(40).optional().or(z.literal("")),
  notas: z.string().max(500).optional().or(z.literal("")),
});
type FormVals = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

export function CobroFormDialog({
  open, onOpenChange, cobro, defaultCondominioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; cobro?: Cobro | null; defaultCondominioId?: string }) {
  const save = useSaveCobro();
  const { data: edificios = [] } = useEdificios();
  const { data: residentes = [] } = useResidentes();
  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      condominio_id: defaultCondominioId ?? "",
      unidad_id: null, residente_id: null,
      concepto: "", monto: 0,
      fecha_vencimiento: new Date().toISOString().slice(0, 10),
      estado: "pendiente", metodo_pago: "", notas: "",
    },
  });
  const condominioId = form.watch("condominio_id");
  const { data: unidades = [] } = useUnidades(condominioId || undefined);

  useEffect(() => {
    if (!open) return;
    form.reset({
      condominio_id: cobro?.condominio_id ?? defaultCondominioId ?? "",
      unidad_id: cobro?.unidad_id ?? null,
      residente_id: cobro?.residente_id ?? null,
      concepto: cobro?.concepto ?? "",
      monto: cobro?.monto ?? 0,
      fecha_vencimiento: cobro?.fecha_vencimiento ?? new Date().toISOString().slice(0, 10),
      estado: (cobro?.estado as any) ?? "pendiente",
      metodo_pago: cobro?.metodo_pago ?? "",
      notas: cobro?.notas ?? "",
    });
  }, [open, cobro, defaultCondominioId, form]);

  const onSubmit = async (v: FormOut) => {
    await save.mutateAsync({
      id: cobro?.id,
      condominio_id: v.condominio_id,
      unidad_id: v.unidad_id || null,
      residente_id: v.residente_id || null,
      concepto: v.concepto,
      monto: v.monto,
      fecha_vencimiento: v.fecha_vencimiento,
      estado: v.estado,
      metodo_pago: v.metodo_pago || null,
      notas: v.notas || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-xl text-[#2d1200]">{cobro ? "Editar cobro" : "Nuevo cobro"}</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Edificio *</Label>
            <Select value={condominioId} onValueChange={(v) => { form.setValue("condominio_id", v); form.setValue("unidad_id", null); }}>
              <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent className="max-h-72">{edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
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
          <div><Label>Concepto *</Label><Input {...form.register("concepto")} placeholder="Cuota mantenimiento octubre" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Monto *</Label><Input type="number" step="0.01" {...form.register("monto")} /></div>
            <div><Label>Vencimiento *</Label><Input type="date" {...form.register("fecha_vencimiento")} /></div>
            <div>
              <Label>Estado</Label>
              <Select value={form.watch("estado")} onValueChange={(v) => form.setValue("estado", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Método de pago</Label>
            <Select value={form.watch("metodo_pago") || "__none__"} onValueChange={(v) => form.setValue("metodo_pago", v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Notas</Label><Textarea rows={2} {...form.register("notas")} /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending} className="bg-[#c94f0c] hover:bg-[#a33d08]">{save.isPending ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
