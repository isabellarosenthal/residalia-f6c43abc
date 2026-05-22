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
import { useSaveEgreso, useEdificios, type Egreso } from "@/lib/queries";

const schema = z.object({
  condominio_id: z.string().uuid("Selecciona edificio"),
  categoria: z.string().min(1, "Requerido"),
  proveedor: z.string().max(120).optional().or(z.literal("")),
  descripcion: z.string().max(500).optional().or(z.literal("")),
  monto: z.coerce.number().min(0),
  fecha: z.string().min(1, "Requerido"),
  comprobante_url: z.string().max(500).optional().or(z.literal("")),
});
type FormVals = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

export function EgresoFormDialog({
  open, onOpenChange, egreso, defaultCondominioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; egreso?: Egreso | null; defaultCondominioId?: string }) {
  const save = useSaveEgreso();
  const { data: edificios = [] } = useEdificios();
  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      condominio_id: defaultCondominioId ?? "",
      categoria: "mantenimiento", proveedor: "", descripcion: "",
      monto: 0, fecha: new Date().toISOString().slice(0, 10), comprobante_url: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      condominio_id: egreso?.condominio_id ?? defaultCondominioId ?? "",
      categoria: egreso?.categoria ?? "mantenimiento",
      proveedor: egreso?.proveedor ?? "",
      descripcion: egreso?.descripcion ?? "",
      monto: egreso?.monto ?? 0,
      fecha: egreso?.fecha ?? new Date().toISOString().slice(0, 10),
      comprobante_url: egreso?.comprobante_url ?? "",
    });
  }, [open, egreso, defaultCondominioId, form]);

  const onSubmit = async (v: FormOut) => {
    await save.mutateAsync({
      id: egreso?.id,
      condominio_id: v.condominio_id,
      categoria: v.categoria,
      proveedor: v.proveedor || null,
      descripcion: v.descripcion || null,
      monto: v.monto,
      fecha: v.fecha,
      comprobante_url: v.comprobante_url || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader><DialogTitle className="font-display text-xl text-[#2d1200]">{egreso ? "Editar egreso" : "Nuevo egreso"}</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Edificio *</Label>
            <Select value={form.watch("condominio_id")} onValueChange={(v) => form.setValue("condominio_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent className="max-h-72">{edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoría *</Label>
              <Select value={form.watch("categoria")} onValueChange={(v) => form.setValue("categoria", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  <SelectItem value="servicios">Servicios públicos</SelectItem>
                  <SelectItem value="seguridad">Seguridad</SelectItem>
                  <SelectItem value="limpieza">Limpieza</SelectItem>
                  <SelectItem value="reparaciones">Reparaciones</SelectItem>
                  <SelectItem value="administracion">Administración</SelectItem>
                  <SelectItem value="impuestos">Impuestos</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Proveedor</Label><Input {...form.register("proveedor")} /></div>
          </div>
          <div><Label>Descripción</Label><Textarea rows={2} {...form.register("descripcion")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Monto *</Label><Input type="number" step="0.01" {...form.register("monto")} /></div>
            <div><Label>Fecha *</Label><Input type="date" {...form.register("fecha")} /></div>
          </div>
          <div><Label>Comprobante URL</Label><Input {...form.register("comprobante_url")} placeholder="https://…" /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!form.formState.isValid || save.isPending} className="bg-[#c94f0c] hover:bg-[#a33d08]">{save.isPending ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
