import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveEdificio, type Condominio } from "@/lib/queries";

const schema = z.object({
  nombre: z.string().min(2, "Nombre muy corto").max(120),
  tipo: z.enum(["edificio", "residencial", "torre", "condominio_horizontal"]),
  direccion: z.string().max(255).optional().or(z.literal("")),
  ciudad: z.string().max(80).optional().or(z.literal("")),
  departamento: z.string().max(80).optional().or(z.literal("")),
  moneda: z.string().min(1).max(5),
  cuota_base: z.coerce.number().min(0).default(0),
});
type FormVals = z.infer<typeof schema>;

export function EdificioFormDialog({
  open, onOpenChange, edificio,
}: { open: boolean; onOpenChange: (v: boolean) => void; edificio?: Condominio | null }) {
  const save = useSaveEdificio();
  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { nombre: "", tipo: "edificio", direccion: "", ciudad: "", departamento: "", moneda: "L", cuota_base: 0 },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: edificio?.nombre ?? "",
        tipo: (edificio?.tipo as any) ?? "edificio",
        direccion: edificio?.direccion ?? "",
        ciudad: edificio?.ciudad ?? "",
        departamento: edificio?.departamento ?? "",
        moneda: edificio?.moneda ?? "L",
        cuota_base: edificio?.cuota_base ?? 0,
      });
    }
  }, [open, edificio, form]);

  const onSubmit = async (vals: FormVals) => {
    await save.mutateAsync({
      id: edificio?.id,
      nombre: vals.nombre,
      tipo: vals.tipo,
      direccion: vals.direccion || null,
      ciudad: vals.ciudad || null,
      departamento: vals.departamento || null,
      moneda: vals.moneda,
      cuota_base: vals.cuota_base,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#2d1200]">{edificio ? "Editar edificio" : "Nuevo edificio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nombre *</Label>
            <Input {...form.register("nombre")} placeholder="Torres del Valle" />
            {form.formState.errors.nombre && <p className="text-xs text-[#c0392b] mt-1">{form.formState.errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo *</Label>
              <Select value={form.watch("tipo")} onValueChange={(v) => form.setValue("tipo", v as any, { shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="edificio">Edificio</SelectItem>
                  <SelectItem value="torre">Torre</SelectItem>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="condominio_horizontal">Condominio horizontal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Moneda *</Label>
              <Select value={form.watch("moneda")} onValueChange={(v) => form.setValue("moneda", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">L (Lempira)</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Dirección</Label>
            <Input {...form.register("direccion")} placeholder="Col. Las Colinas, calle 14" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ciudad</Label>
              <Input {...form.register("ciudad")} placeholder="Tegucigalpa" />
            </div>
            <div>
              <Label>Departamento</Label>
              <Input {...form.register("departamento")} placeholder="Francisco Morazán" />
            </div>
          </div>

          <div>
            <Label>Cuota base mensual</Label>
            <Input type="number" step="0.01" {...form.register("cuota_base")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!form.formState.isValid || save.isPending} className="bg-[#c94f0c] hover:bg-[#a33d08]">
              {save.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
