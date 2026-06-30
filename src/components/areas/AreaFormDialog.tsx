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
  horas_incluidas: z.coerce.number().min(0).optional(),
  costo_por_hora_extra: z.coerce.number().min(0).default(0),
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
      icono: "sparkles", activa: true, permite_exceso: true, costo_por_persona_extra: 0, horas_incluidas: undefined, costo_por_hora_extra: 0,
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
      permite_exceso: (area as any)?.permite_exceso ?? true,
      costo_por_persona_extra: Number((area as any)?.costo_por_persona_extra ?? 0),
      horas_incluidas: (area as any)?.horas_incluidas == null ? undefined : Number((area as any).horas_incluidas),
      costo_por_hora_extra: Number((area as any)?.costo_por_hora_extra ?? 0),
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
      permite_exceso: v.permite_exceso,
      costo_por_persona_extra: v.costo_por_persona_extra ?? 0,
      horas_incluidas: v.horas_incluidas ?? null,
      costo_por_hora_extra: v.costo_por_hora_extra ?? 0,
    } as any);
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
          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Permitir exceder capacidad (con autorización)</Label>
            <Switch checked={form.watch("permite_exceso")} onCheckedChange={(v) => form.setValue("permite_exceso", v)} />
          </div>
          <div>
            <Label>Costo por persona extra (L)</Label>
            <Input type="number" step="0.01" {...form.register("costo_por_persona_extra")} />
            <p className="text-[11px] text-[#64748B] mt-1">Se cobra cuando el residente supera la capacidad y el admin lo autoriza.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Horas incluidas</Label>
              <Input type="number" step="0.5" placeholder="Sin límite" {...form.register("horas_incluidas")} />
              <p className="text-[11px] text-[#64748B] mt-1">Duración base sin costo extra.</p>
            </div>
            <div>
              <Label>Costo por hora extra (L)</Label>
              <Input type="number" step="0.01" {...form.register("costo_por_hora_extra")} />
              <p className="text-[11px] text-[#64748B] mt-1">Se cobra automáticamente por cada hora que supere el límite.</p>
            </div>
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
