import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveAcceso, useEdificios, useUnidades, type Acceso } from "@/lib/queries";

const schema = z.object({
  condominio_id: z.string().uuid("Selecciona edificio"),
  unidad_id: z.string().nullable().optional(),
  visitante_nombre: z.string().min(1, "Requerido").max(120),
  tipo: z.string().min(1),
  metodo: z.string().min(1),
  qr_code: z.string().max(120).optional().or(z.literal("")),
  fecha_entrada: z.string().min(1, "Requerido"),
  fecha_salida: z.string().optional().or(z.literal("")),
  usos_maximos: z.coerce.number().int().min(1).max(999),
  minutos_max_estadia: z.coerce.number().int().min(0).max(10080).optional().or(z.literal("")),
});
type FormVals = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

// Tiempos máximos sugeridos por tipo (en minutos). null = sin límite
const MINUTOS_DEFAULT: Record<string, number | null> = {
  delivery: 15,
  proveedor: 120,
  servicio: 240,
  visita: null,
  otro: null,
};

const nowLocal = () => {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export function AccesoFormDialog({
  open, onOpenChange, acceso, defaultCondominioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; acceso?: Acceso | null; defaultCondominioId?: string }) {
  const save = useSaveAcceso();
  const { data: edificios = [] } = useEdificios();
  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    defaultValues: {
      condominio_id: defaultCondominioId ?? "", unidad_id: null,
      visitante_nombre: "", tipo: "visita", metodo: "manual", qr_code: "",
      fecha_entrada: nowLocal(), fecha_salida: "",
      usos_maximos: 1, minutos_max_estadia: "",
    },
  });
  const condominioId = form.watch("condominio_id");
  const tipo = form.watch("tipo");
  const { data: unidades = [] } = useUnidades(condominioId || undefined);

  useEffect(() => {
    if (!open) return;
    form.reset({
      condominio_id: acceso?.condominio_id ?? defaultCondominioId ?? "",
      unidad_id: acceso?.unidad_id ?? null,
      visitante_nombre: acceso?.visitante_nombre ?? "",
      tipo: acceso?.tipo ?? "visita",
      metodo: acceso?.metodo ?? "manual",
      qr_code: acceso?.qr_code ?? "",
      fecha_entrada: acceso?.fecha_entrada ? new Date(acceso.fecha_entrada).toISOString().slice(0, 16) : nowLocal(),
      fecha_salida: acceso?.fecha_salida ? new Date(acceso.fecha_salida).toISOString().slice(0, 16) : "",
      usos_maximos: acceso?.usos_maximos ?? 1,
      minutos_max_estadia: acceso?.minutos_max_estadia ?? "",
    });
  }, [open, acceso, defaultCondominioId, form]);

  // Al cambiar tipo, autoajusta el tiempo máximo si el usuario no editó el valor
  useEffect(() => {
    if (acceso) return; // no pisar en edición
    const def = MINUTOS_DEFAULT[tipo];
    form.setValue("minutos_max_estadia", def == null ? "" : String(def) as any);
  }, [tipo, acceso, form]);

  const genCodigo = () => {
    const r = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PASE-${r}`;
  };

  const onSubmit = async (v: FormOut) => {
    await save.mutateAsync({
      id: acceso?.id,
      condominio_id: v.condominio_id,
      unidad_id: v.unidad_id || null,
      visitante_nombre: v.visitante_nombre,
      tipo: v.tipo, metodo: v.metodo,
      qr_code: v.qr_code?.trim() || acceso?.qr_code || genCodigo(),
      fecha_entrada: new Date(v.fecha_entrada).toISOString(),
      fecha_salida: v.fecha_salida ? new Date(v.fecha_salida).toISOString() : null,
      usos_maximos: v.usos_maximos,
      minutos_max_estadia: v.minutos_max_estadia === "" || v.minutos_max_estadia == null ? null : Number(v.minutos_max_estadia),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-xl text-[#2D3748]">{acceso ? "Editar acceso" : "Registrar acceso"}</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Edificio *</Label>
            <Select value={condominioId} onValueChange={(v) => { form.setValue("condominio_id", v); form.setValue("unidad_id", null); }}>
              <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent className="max-h-72">{edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Nombre del visitante *</Label><Input {...form.register("visitante_nombre")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => form.setValue("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visita">Visita</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="proveedor">Proveedor</SelectItem>
                  <SelectItem value="servicio">Servicio</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Método</Label>
              <Select value={form.watch("metodo")} onValueChange={(v) => form.setValue("metodo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="qr">QR</SelectItem>
                  <SelectItem value="biometrico">Biométrico</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Unidad destino</Label>
            <Select value={form.watch("unidad_id") ?? "__none__"} onValueChange={(v) => form.setValue("unidad_id", v === "__none__" ? null : v)} disabled={!condominioId}>
              <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="__none__">Sin asignar</SelectItem>
                {unidades.map((u) => <SelectItem key={u.id} value={u.id}>#{u.numero}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Entrada *</Label><Input type="datetime-local" {...form.register("fecha_entrada")} /></div>
            <div><Label>Salida</Label><Input type="datetime-local" {...form.register("fecha_salida")} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Entradas permitidas *</Label>
              <Input type="number" min={1} {...form.register("usos_maximos")} />
              <p className="text-xs text-[#64748B] mt-1">Por defecto 1 (un solo ingreso)</p>
            </div>
            <div>
              <Label>Tiempo máx. adentro (min)</Label>
              <Input type="number" min={0} placeholder="Sin límite" {...form.register("minutos_max_estadia")} />
              <p className="text-xs text-[#64748B] mt-1">Delivery: 15 min sugerido</p>
            </div>
          </div>
          <div><Label>Código del pase</Label><Input {...form.register("qr_code")} placeholder="Se genera automáticamente si lo dejas vacío" /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending} className="bg-[#2D3748] hover:bg-[#1F2937]">{save.isPending ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
