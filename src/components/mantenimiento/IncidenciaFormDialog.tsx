import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveIncidencia, useUnidades, type Incidencia } from "@/lib/queries";

export function IncidenciaFormDialog({ open, onOpenChange, incidencia, defaultCondominioId }: { open: boolean; onOpenChange: (v: boolean) => void; incidencia: Incidencia | null; defaultCondominioId?: string }) {
  const save = useSaveIncidencia();
  const { data: unidades = [] } = useUnidades(defaultCondominioId);
  const [form, setForm] = useState({
    condominio_id: defaultCondominioId ?? "",
    unidad_id: "" as string | null,
    tipo: "general",
    descripcion: "",
    prioridad: "media" as "baja" | "media" | "alta" | "urgente",
    estado: "nuevo" as "nuevo" | "en_revision" | "en_proceso" | "resuelto" | "cerrado",
  });
  useEffect(() => {
    if (incidencia) setForm({
      condominio_id: incidencia.condominio_id, unidad_id: incidencia.unidad_id ?? null,
      tipo: incidencia.tipo ?? "general", descripcion: incidencia.descripcion,
      prioridad: incidencia.prioridad as any, estado: incidencia.estado as any,
    });
    else setForm((f) => ({ ...f, condominio_id: defaultCondominioId ?? f.condominio_id }));
  }, [incidencia, defaultCondominioId]);

  const submit = async () => {
    if (!form.condominio_id || !form.descripcion) return;
    await save.mutateAsync({ ...form, id: incidencia?.id, unidad_id: form.unidad_id || null } as any);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{incidencia ? "Editar incidencia" : "Nueva incidencia"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Descripción</Label><Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["general","plomeria","electricidad","ascensor","limpieza","seguridad","areas_comunes","otros"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Unidad (opcional)</Label>
              <Select value={form.unidad_id ?? "_"} onValueChange={(v) => setForm({ ...form, unidad_id: v === "_" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">— Área común —</SelectItem>
                  {unidades.map((u) => <SelectItem key={u.id} value={u.id}>{u.piso ? `P${u.piso}-` : ""}{u.numero}</SelectItem>)}
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
                <SelectContent>{["nuevo","en_revision","en_proceso","resuelto","cerrado"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-[#4F46E5] hover:bg-[#4338CA]" onClick={submit} disabled={save.isPending}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
