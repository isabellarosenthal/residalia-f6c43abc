import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { useSaveEdificio, useDeleteEdificio, type Condominio } from "@/lib/queries";
import { DEPARTAMENTOS } from "@/lib/honduras-geo";

const schema = z.object({
  nombre: z.string().min(2, "Nombre muy corto").max(120),
  tipo: z.enum(["edificio", "residencial", "torre", "condominio_horizontal"]),
  direccion: z.string().max(255).optional().or(z.literal("")),
  ciudad: z.string().max(80).optional().or(z.literal("")),
  departamento: z.string().max(80).optional().or(z.literal("")),
  maps_url: z.string().max(500).optional().or(z.literal("")),
  moneda: z.string().min(1).max(5),
  cuota_base: z.coerce.number().min(0).default(0),
  cuota_modo: z.enum(["fijo", "por_m2"]).default("fijo"),
  cuota_por_m2: z.coerce.number().min(0).default(0),
});
type FormVals = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

export function EdificioFormDialog({
  open, onOpenChange, edificio,
}: { open: boolean; onOpenChange: (v: boolean) => void; edificio?: Condominio | null }) {
  const save = useSaveEdificio();
  const del = useDeleteEdificio();
  const navigate = useNavigate();
  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      nombre: "", tipo: "edificio", direccion: "", ciudad: "", departamento: "",
      maps_url: "", moneda: "L", cuota_base: 0, cuota_modo: "fijo", cuota_por_m2: 0,
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
        maps_url: (edificio as any)?.maps_url ?? "",
        moneda: edificio?.moneda ?? "L",
        cuota_base: edificio?.cuota_base ?? 0,
        cuota_modo: ((edificio as any)?.cuota_modo as any) ?? "fijo",
        cuota_por_m2: (edificio as any)?.cuota_por_m2 ?? 0,
      });
    }
  }, [open, edificio, form]);

  const onSubmit = async (vals: FormOut) => {
    await save.mutateAsync({
      id: edificio?.id,
      nombre: vals.nombre,
      tipo: vals.tipo,
      direccion: vals.direccion || null,
      ciudad: vals.ciudad || null,
      departamento: vals.departamento || null,
      maps_url: vals.maps_url || null,
      moneda: vals.moneda,
      cuota_base: vals.cuota_base,
      cuota_modo: vals.cuota_modo,
      cuota_por_m2: vals.cuota_por_m2,
    } as any);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!edificio) return;
    if (confirm(`¿Eliminar ${edificio.nombre}? Esta acción es permanente.`)) {
      del.mutate(edificio.id, {
        onSuccess: () => {
          onOpenChange(false);
          navigate({ to: "/edificios" });
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#0F172A]">{edificio ? "Editar edificio" : "Nuevo edificio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nombre *</Label>
            <Input {...form.register("nombre")} placeholder="Torres del Valle" />
            {form.formState.errors.nombre && <p className="text-xs text-[#be185d] mt-1">{form.formState.errors.nombre.message}</p>}
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
            <Input
              {...form.register("direccion")}
              placeholder="Ej: Col. Lomas del Guijarro, Tegucigalpa"
            />
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Enlace de Google Maps (opcional)"
                value={(form.watch("maps_url") as string) ?? ""}
                onChange={(e) => form.setValue("maps_url", e.target.value, { shouldValidate: true })}
              />
              {form.watch("maps_url") ? (
                <a
                  href={form.watch("maps_url") as string}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center h-10 px-3 rounded-md border border-[#E2E8F0] text-[#4A154B] hover:bg-[#fdeee5]"
                  title="Abrir en Google Maps"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Departamento</Label>
              <Select
                value={form.watch("departamento") || ""}
                onValueChange={(v) => {
                  form.setValue("departamento", v, { shouldValidate: true });
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
              <CityAutocomplete
                value={form.watch("ciudad") || ""}
                onChange={(v) => form.setValue("ciudad", v, { shouldValidate: true })}
                placeholder="Buscar ciudad…"
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#E2E8F0] p-3 space-y-3 bg-[#FAFAFB]">
            <div>
              <Label>Modo de cobro de mantenimiento</Label>
              <Select value={form.watch("cuota_modo")} onValueChange={(v) => form.setValue("cuota_modo", v as any, { shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fijo">Cuota fija mensual</SelectItem>
                  <SelectItem value="por_m2">Por metro cuadrado de construcción</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.watch("cuota_modo") === "por_m2" ? (
              <div>
                <Label>Precio por m² ({form.watch("moneda")})</Label>
                <Input type="number" step="0.01" {...form.register("cuota_por_m2")} />
                <p className="text-xs text-[#64748B] mt-1">Se multiplica por los m² de construcción de cada unidad. El campo "Mantenimiento" de la unidad sigue funcionando como override manual.</p>
              </div>
            ) : (
              <div>
                <Label>Cuota base mensual</Label>
                <Input type="number" step="0.01" {...form.register("cuota_base")} />
              </div>
            )}
          </div>



          <DialogFooter className={edificio ? "sm:justify-between" : undefined}>
            {edificio ? (
              <Button
                type="button"
                variant="outline"
                className="text-[#be185d] border-[#be185d]/30 hover:bg-[#fce7f3] hover:text-[#be185d]"
                disabled={del.isPending}
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {del.isPending ? "Eliminando…" : "Eliminar"}
              </Button>
            ) : null}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={!form.formState.isValid || save.isPending} className="bg-[#4A154B] hover:bg-[#350d36]">
                {save.isPending ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
