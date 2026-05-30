import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSaveProveedor, type Proveedor } from "@/lib/queries";

export function ProveedorFormDialog({ open, onOpenChange, proveedor, defaultCondominioId }: { open: boolean; onOpenChange: (v: boolean) => void; proveedor: Proveedor | null; defaultCondominioId?: string }) {
  const save = useSaveProveedor();
  const [form, setForm] = useState({ condominio_id: defaultCondominioId ?? null as string | null, nombre: "", servicio: "", telefono: "", email: "", calificacion: "" as string | number });
  useEffect(() => {
    if (proveedor) setForm({
      condominio_id: proveedor.condominio_id, nombre: proveedor.nombre, servicio: proveedor.servicio ?? "",
      telefono: proveedor.telefono ?? "", email: proveedor.email ?? "", calificacion: proveedor.calificacion ?? "",
    });
    else setForm((f) => ({ ...f, condominio_id: defaultCondominioId ?? f.condominio_id }));
  }, [proveedor, defaultCondominioId]);

  const submit = async () => {
    if (!form.nombre) return;
    await save.mutateAsync({
      ...form, id: proveedor?.id,
      calificacion: form.calificacion === "" ? null : Number(form.calificacion),
    } as any);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{proveedor ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Nombre</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
          <div><Label>Servicio</Label><Input value={form.servicio} onChange={(e) => setForm({ ...form, servicio: e.target.value })} placeholder="Plomería, electricidad..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Teléfono</Label><Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div><Label>Calificación (1-5)</Label><Input type="number" min={1} max={5} step={0.5} value={form.calificacion} onChange={(e) => setForm({ ...form, calificacion: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-[#173B7A] hover:bg-[#0f2659]" onClick={submit} disabled={save.isPending}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
