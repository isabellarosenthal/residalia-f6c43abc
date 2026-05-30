import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveOrden, useProveedores, type OrdenMantenimiento } from "@/lib/queries";

export function OrdenFormDialog({ open, onOpenChange, orden, defaultCondominioId }: { open: boolean; onOpenChange: (v: boolean) => void; orden: OrdenMantenimiento | null; defaultCondominioId?: string }) {
  const save = useSaveOrden();
  const { data: proveedores = [] } = useProveedores(defaultCondominioId);
  const [form, setForm] = useState({
    condominio_id: defaultCondominioId ?? "",
    titulo: "",
    descripcion: "",
    area: "",
    proveedor_id: null as string | null,
    prioridad: "media" as "baja" | "media" | "alta" | "urgente",
    estado: "pendiente" as "pendiente" | "en_proceso" | "completado" | "cancelado",
    fecha_limite: "",
    costo_estimado: "" as string | number,
    costo_real: "" as string | number,
  });
  useEffect(() => {
    if (orden) setForm({
      condominio_id: orden.condominio_id, titulo: orden.titulo, descripcion: orden.descripcion ?? "",
      area: orden.area ?? "", proveedor_id: orden.proveedor_id, prioridad: (orden.prioridad ?? "media") as any,
      estado: orden.estado as any, fecha_limite: orden.fecha_limite ?? "",
      costo_estimado: orden.costo_estimado ?? "", costo_real: orden.costo_real ?? "",
    });
    else setForm((f) => ({ ...f, condominio_id: defaultCondominioId ?? f.condominio_id }));
  }, [orden, defaultCondominioId]);

  const submit = async () => {
    if (!form.condominio_id || !form.titulo) return;
    await save.mutateAsync({
      ...form, id: orden?.id,
      fecha_limite: form.fecha_limite || null,
      costo_estimado: form.costo_estimado === "" ? null : Number(form.costo_estimado),
      costo_real: form.costo_real === "" ? null : Number(form.costo_real),
      proveedor_id: form.proveedor_id || null,
    } as any);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{orden ? "Editar orden" : "Nueva orden de trabajo"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
          <div><Label>Descripción</Label><Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Área</Label><Input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Lobby, piscina..." /></div>
            <div><Label>Proveedor</Label>
              <Select value={form.proveedor_id ?? "_"} onValueChange={(v) => setForm({ ...form, proveedor_id: v === "_" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">— Sin asignar —</SelectItem>
                  {proveedores.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Prioridad</Label>
              <Select value={form.prioridad} onValueChange={(v: any) => setForm({ ...form, prioridad: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["baja","media","alta","urgente"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Estado</Label>
              <Select value={form.estado} onValueChange={(v: any) => setForm({ ...form, estado: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["pendiente","en_proceso","completado","cancelado"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Fecha límite</Label><Input type="date" value={form.fecha_limite} onChange={(e) => setForm({ ...form, fecha_limite: e.target.value })} /></div>
            <div><Label>Costo estimado (L)</Label><Input type="number" value={form.costo_estimado} onChange={(e) => setForm({ ...form, costo_estimado: e.target.value })} /></div>
            <div><Label>Costo real (L)</Label><Input type="number" value={form.costo_real} onChange={(e) => setForm({ ...form, costo_real: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-[#ffd60a] hover:bg-[#e6c200]" onClick={submit} disabled={save.isPending}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
