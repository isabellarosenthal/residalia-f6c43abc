import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveEdificio, type Condominio } from "@/lib/queries";
import { DEPARTAMENTOS, ciudadesDe } from "@/lib/honduras-geo";

const schema = z.object({
  nombre: z.string().min(2, "Nombre muy corto").max(120),
  tipo: z.enum(["edificio", "residencial", "torre", "condominio_horizontal"]),
  direccion: z.string().max(255).optional().or(z.literal("")),
  ciudad: z.string().max(80).optional().or(z.literal("")),
  departamento: z.string().max(80).optional().or(z.literal("")),
  latitud: z.number().nullable().optional(),
  longitud: z.number().nullable().optional(),
  moneda: z.string().min(1).max(5),
  cuota_base: z.coerce.number().min(0).default(0),
});
type FormVals = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

export function EdificioFormDialog({
  open, onOpenChange, edificio,
}: { open: boolean; onOpenChange: (v: boolean) => void; edificio?: Condominio | null }) {
  const save = useSaveEdificio();
  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      nombre: "", tipo: "edificio", direccion: "", ciudad: "", departamento: "",
      latitud: null, longitud: null, moneda: "L", cuota_base: 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: edificio?.nombre ?? "",
        tipo: (edificio?.tipo as any) ?? "edificio",
        direccion: edificio?.direccion ?? "",
        ciudad: edificio?.ciudad ?? "",
        departamento: edificio?.departamento ?? "",
        latitud: (edificio as any)?.latitud ?? null,
        longitud: (edificio as any)?.longitud ?? null,
        moneda: edificio?.moneda ?? "L",
        cuota_base: edificio?.cuota_base ?? 0,
      });
    }
  }, [open, edificio, form]);

  const departamento = form.watch("departamento") ?? "";
  const ciudades = useMemo(() => ciudadesDe(departamento), [departamento]);

  const onSubmit = async (vals: FormOut) => {
    await save.mutateAsync({
      id: edificio?.id,
      nombre: vals.nombre,
      tipo: vals.tipo,
      direccion: vals.direccion || null,
      ciudad: vals.ciudad || null,
      departamento: vals.departamento || null,
      latitud: vals.latitud ?? null,
      longitud: vals.longitud ?? null,
      moneda: vals.moneda,
      cuota_base: vals.cuota_base,
    } as any);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
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
            <AddressMapPicker
              value={{
                direccion: form.watch("direccion") ?? "",
                latitud: (form.watch("latitud") as number | null) ?? null,
                longitud: (form.watch("longitud") as number | null) ?? null,
              }}
              onChange={(v) => {
                form.setValue("direccion", v.direccion, { shouldValidate: true });
                form.setValue("latitud", v.latitud);
                form.setValue("longitud", v.longitud);
              }}
              onGeoFound={(g) => {
                if (g.departamento) {
                  // Map google admin name to our list if it matches
                  const match = DEPARTAMENTOS.find(
                    (d) => d.toLowerCase() === g.departamento!.toLowerCase()
                      || d.toLowerCase() === g.departamento!.toLowerCase().replace(/^departamento de /, ""),
                  );
                  if (match) form.setValue("departamento", match, { shouldValidate: true });
                }
                if (g.ciudad) {
                  const deptoNow = form.getValues("departamento") ?? "";
                  const cityList = ciudadesDe(deptoNow);
                  const cityMatch = cityList.find((c) => c.toLowerCase() === g.ciudad!.toLowerCase());
                  if (cityMatch) form.setValue("ciudad", cityMatch, { shouldValidate: true });
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Departamento</Label>
              <Select
                value={form.watch("departamento") || ""}
                onValueChange={(v) => {
                  form.setValue("departamento", v, { shouldValidate: true });
                  form.setValue("ciudad", "", { shouldValidate: true });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Selecciona…" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {DEPARTAMENTOS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ciudad / Municipio</Label>
              <Select
                value={form.watch("ciudad") || ""}
                onValueChange={(v) => form.setValue("ciudad", v, { shouldValidate: true })}
                disabled={!departamento}
              >
                <SelectTrigger><SelectValue placeholder={departamento ? "Selecciona…" : "Elige depto. primero"} /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {ciudades.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
