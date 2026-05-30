import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, ExternalLink, Loader2 } from "lucide-react";
import { useSaveEgreso, useEdificios, type Egreso } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const MAX_MB = 10;

export function EgresoFormDialog({
  open, onOpenChange, egreso, defaultCondominioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; egreso?: Egreso | null; defaultCondominioId?: string }) {
  const save = useSaveEgreso();
  const { data: edificios = [] } = useEdificios();
  const [uploading, setUploading] = useState(false);
  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      condominio_id: defaultCondominioId ?? "",
      categoria: "mantenimiento", proveedor: "", descripcion: "",
      monto: 0, fecha: new Date().toISOString().slice(0, 10), comprobante_url: "",
    },
  });

  const comprobanteUrl = form.watch("comprobante_url");
  const condoId = form.watch("condominio_id");

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

  const handleFile = async (file: File) => {
    if (!condoId) {
      toast.error("Selecciona el edificio primero");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Archivo muy grande (máx ${MAX_MB}MB)`);
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${condoId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("comprobantes").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type || undefined,
      });
      if (error) throw error;
      form.setValue("comprobante_url", path, { shouldDirty: true });
      toast.success("Comprobante subido");
    } catch (e: any) {
      toast.error(e?.message ?? "Error al subir");
    } finally {
      setUploading(false);
    }
  };

  const openComprobante = async () => {
    if (!comprobanteUrl) return;
    if (comprobanteUrl.startsWith("http")) {
      window.open(comprobanteUrl, "_blank");
      return;
    }
    const { data, error } = await supabase.storage.from("comprobantes").createSignedUrl(comprobanteUrl, 300);
    if (error || !data?.signedUrl) {
      toast.error("No se pudo abrir el archivo");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const removeComprobante = async () => {
    if (comprobanteUrl && !comprobanteUrl.startsWith("http")) {
      await supabase.storage.from("comprobantes").remove([comprobanteUrl]);
    }
    form.setValue("comprobante_url", "", { shouldDirty: true });
  };

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
        <DialogHeader><DialogTitle className="font-display text-xl text-[#0a1e3f]">{egreso ? "Editar egreso" : "Nuevo egreso"}</DialogTitle></DialogHeader>
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
          <div>
            <Label>Comprobante (PDF / imagen)</Label>
            {comprobanteUrl ? (
              <div className="flex items-center gap-2 rounded-lg border border-[#e8ecf3] bg-[#fcf8f5] px-3 py-2">
                <button type="button" onClick={openComprobante} className="flex-1 text-left text-sm text-[#13294b] truncate inline-flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span className="truncate">{comprobanteUrl.split("/").pop()}</span>
                </button>
                <Button type="button" size="sm" variant="ghost" onClick={removeComprobante} className="h-8 w-8 p-0 text-[#be185d]"><X className="w-4 h-4" /></Button>
              </div>
            ) : (
              <label className={`flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#d6c5bd] px-3 py-4 text-sm text-[#6b7a99] cursor-pointer hover:bg-[#fcf8f5] ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Subiendo…" : `Subir archivo (máx ${MAX_MB}MB)`}
                <input type="file" accept="image/*,application/pdf" className="hidden" disabled={uploading || !condoId} onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }} />
              </label>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending || uploading} className="bg-[#0a1e3f] hover:bg-[#001a4d]">{save.isPending ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
