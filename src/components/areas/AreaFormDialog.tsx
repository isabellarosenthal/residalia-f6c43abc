import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveArea, useEdificios, type AreaComun } from "@/lib/queries";

const schema = z.object({
  condominio_id: z.string().uuid("Selecciona edificio"),
  nombre: z.string().min(1).max(100),
  capacidad: z.coerce.number().int().min(0).optional(),
  horario_inicio: z.string().optional().or(z.literal("")),
  horario_fin: z.string().optional().or(z.literal("")),
  icono: z.string().max(40).optional().or(z.literal("")),
  activa: z.boolean(),
  permite_exceso: z.boolean(),
  costo_por_persona_extra: z.coerce.number().min(0).default(0),
});

type FormVals = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

export function AreaFormDialog({
  open, onOpenChange, area, defaultCondominioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; area?: AreaComun | null; defaultCondominioId?: string }) {
  const save = useSaveArea();
  const { data: edificios = [] } = useEdificios();
  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    defaultValues: {
      condominio_id: defaultCondominioId ?? "",
      nombre: "", capacidad: 0, horario_inicio: "08:00", horario_fin: "22:00",
      icono: "sparkles", activa: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      condominio_id: area?.condominio_id ?? defaultCondominioId ?? "",
      nombre: area?.nombre ?? "",
      capacidad: area?.capacidad ?? 0,
      horario_inicio: area?.horario_inicio ?? "08:00",
      horario_fin: area?.horario_fin ?? "22:00",
      icono: area?.icono ?? "sparkles",
      activa: area?.activa ?? true,
    });
  }, [open, area, defaultCondominioId, form]);

  const onSubmit = async (v: FormOut) => {
    await save.mutateAsync({
      id: area?.id,
      condominio_id: v.condominio_id,
      nombre: v.nombre,
      capacidad: v.capacidad ?? null,
      horario_inicio: v.horario_inicio || null,
      horario_fin: v.horario_fin || null,
      icono: v.icono || null,
      activa: v.activa,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader><DialogTitle className="font-display text-xl text-[#0F172A]">{area ? "Editar área" : "Nueva área común"}</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Edificio *</Label>
            <Select value={form.watch("condominio_id")} onValueChange={(v) => form.setValue("condominio_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent className="max-h-72">{edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Nombre *</Label><Input {...form.register("nombre")} placeholder="Salón social, Piscina, Gimnasio…" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Capacidad</Label><Input type="number" {...form.register("capacidad")} /></div>
            <div><Label>Abre</Label><Input type="time" {...form.register("horario_inicio")} /></div>
            <div><Label>Cierra</Label><Input type="time" {...form.register("horario_fin")} /></div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Área activa para reservas</Label>
            <Switch checked={form.watch("activa")} onCheckedChange={(v) => form.setValue("activa", v)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending} className="bg-[#4A154B] hover:bg-[#350d36]">{save.isPending ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
