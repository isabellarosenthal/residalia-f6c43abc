import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveComunicado, useEdificios, type Comunicado } from "@/lib/queries";

export const TIPOS_COMUNICADO = ["aviso", "mantenimiento", "urgente", "evento", "cobranza"] as const;

const schema = z.object({
  condominio_id: z.string().uuid("Selecciona edificio"),
  titulo: z.string().min(1, "El título es obligatorio").max(140),
  cuerpo: z.string().max(4000).optional().or(z.literal("")),
  tipo: z.string().min(1),
});

type FormVals = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

export function ComunicadoFormDialog({
  open, onOpenChange, comunicado, defaultCondominioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; comunicado?: Comunicado | null; defaultCondominioId?: string }) {
  const save = useSaveComunicado();
  const { data: edificios = [] } = useEdificios();
  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    defaultValues: { condominio_id: defaultCondominioId ?? "", titulo: "", cuerpo: "", tipo: "aviso" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      condominio_id: comunicado?.condominio_id ?? defaultCondominioId ?? "",
      titulo: comunicado?.titulo ?? "",
      cuerpo: comunicado?.cuerpo ?? "",
      tipo: comunicado?.tipo ?? "aviso",
    });
  }, [open, comunicado, defaultCondominioId, form]);

  const onSubmit = async (v: FormOut) => {
    await save.mutateAsync({
      id: comunicado?.id,
      condominio_id: v.condominio_id,
      titulo: v.titulo,
      cuerpo: v.cuerpo || null,
      tipo: v.tipo,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#0F172A]">
            {comunicado ? "Editar anuncio" : "Nuevo anuncio"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Edificio *</Label>
              <Select value={form.watch("condominio_id")} onValueChange={(v) => form.setValue("condominio_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              {form.formState.errors.condominio_id && (
                <p className="text-xs text-[#be185d] mt-1">{form.formState.errors.condominio_id.message}</p>
              )}
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.watch("tipo")} onValueChange={(v) => form.setValue("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS_COMUNICADO.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Título *</Label>
            <Input {...form.register("titulo")} placeholder="Corte de agua el sábado" />
            {form.formState.errors.titulo && (
              <p className="text-xs text-[#be185d] mt-1">{form.formState.errors.titulo.message}</p>
            )}
          </div>

          <div>
            <Label>Mensaje</Label>
            <Textarea rows={6} {...form.register("cuerpo")} placeholder="Detalle del anuncio para los residentes…" />
            <p className="text-[11px] text-[#64748B] mt-1">
              Se publica de inmediato en el portal de todos los residentes del edificio.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending} className="bg-[#4A154B] hover:bg-[#350d36]">
              {save.isPending ? "Guardando…" : comunicado ? "Guardar" : "Publicar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
