import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveProspecto, useEdificios, ETAPAS_PIPELINE, type Prospecto } from "@/lib/queries";

const schema = z.object({
  nombre: z.string().min(1, "Requerido").max(80),
  apellido: z.string().max(80).optional().or(z.literal("")),
  telefono: z.string().max(30).optional().or(z.literal("")),
  whatsapp: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  tipo: z.enum(["comprador", "arrendatario", "vendedor", "inversionista"]),
  temperatura: z.enum(["frio", "tibio", "caliente"]),
  etapa_pipeline: z.enum(["nuevo", "contactado", "interesado", "visita_agendada", "negociacion", "cierre", "ganado", "perdido"]),
  origen: z.string().max(60).optional().or(z.literal("")),
  condominio_id: z.string().uuid().optional().or(z.literal("")),
  presupuesto_min: z.coerce.number().min(0).optional().or(z.literal("")),
  presupuesto_max: z.coerce.number().min(0).optional().or(z.literal("")),
  caracteristicas_deseadas: z.string().max(500).optional().or(z.literal("")),
  notas: z.string().max(1000).optional().or(z.literal("")),
});
type FormVals = z.input<typeof schema>;

export function ProspectoFormDialog({
  open, onOpenChange, prospecto, defaultEtapa,
}: { open: boolean; onOpenChange: (b: boolean) => void; prospecto: Prospecto | null; defaultEtapa?: string }) {
  const { data: edificios = [] } = useEdificios();
  const save = useSaveProspecto();
  const form = useForm<FormVals>({ resolver: zodResolver(schema), defaultValues: emptyVals(defaultEtapa) });

  useEffect(() => {
    if (open) {
      form.reset(prospecto ? {
        nombre: prospecto.nombre, apellido: prospecto.apellido ?? "", telefono: prospecto.telefono ?? "",
        whatsapp: prospecto.whatsapp ?? "", email: prospecto.email ?? "",
        tipo: prospecto.tipo, temperatura: prospecto.temperatura, etapa_pipeline: prospecto.etapa_pipeline,
        origen: prospecto.origen ?? "", condominio_id: prospecto.condominio_id ?? "",
        presupuesto_min: (prospecto.presupuesto_min as any) ?? "", presupuesto_max: (prospecto.presupuesto_max as any) ?? "",
        caracteristicas_deseadas: prospecto.caracteristicas_deseadas ?? "", notas: prospecto.notas ?? "",
      } : emptyVals(defaultEtapa));
    }
  }, [open, prospecto, defaultEtapa]);

  const onSubmit = form.handleSubmit(async (v) => {
    await save.mutateAsync({
      id: prospecto?.id,
      nombre: v.nombre,
      apellido: v.apellido || null,
      telefono: v.telefono || null,
      whatsapp: v.whatsapp || null,
      email: v.email || null,
      tipo: v.tipo,
      temperatura: v.temperatura,
      etapa_pipeline: v.etapa_pipeline,
      origen: v.origen || null,
      condominio_id: v.condominio_id || null,
      presupuesto_min: v.presupuesto_min === "" ? null : Number(v.presupuesto_min),
      presupuesto_max: v.presupuesto_max === "" ? null : Number(v.presupuesto_max),
      caracteristicas_deseadas: v.caracteristicas_deseadas || null,
      notas: v.notas || null,
    } as any);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prospecto ? "Editar prospecto" : "Nuevo prospecto"}</DialogTitle>
          <DialogDescription>Información de contacto, intereses y etapa en el pipeline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre *" err={form.formState.errors.nombre?.message}>
              <Input {...form.register("nombre")} />
            </Field>
            <Field label="Apellido"><Input {...form.register("apellido")} /></Field>
            <Field label="Teléfono"><Input {...form.register("telefono")} /></Field>
            <Field label="WhatsApp"><Input {...form.register("whatsapp")} /></Field>
            <Field label="Email" err={form.formState.errors.email?.message}>
              <Input type="email" {...form.register("email")} />
            </Field>
            <Field label="Origen"><Input placeholder="Facebook, referido…" {...form.register("origen")} /></Field>
            <Field label="Tipo">
              <Sel value={form.watch("tipo")} onChange={(v) => form.setValue("tipo", v as any)}
                opts={[["comprador","Comprador"],["arrendatario","Arrendatario"],["vendedor","Vendedor"],["inversionista","Inversionista"]]} />
            </Field>
            <Field label="Temperatura">
              <Sel value={form.watch("temperatura")} onChange={(v) => form.setValue("temperatura", v as any)}
                opts={[["frio","Frío"],["tibio","Tibio"],["caliente","Caliente"]]} />
            </Field>
            <Field label="Etapa">
              <Sel value={form.watch("etapa_pipeline")} onChange={(v) => form.setValue("etapa_pipeline", v as any)}
                opts={ETAPAS_PIPELINE.map((e) => [e, etapaLabel(e)])} />
            </Field>
            <Field label="Edificio interés">
              <Select value={form.watch("condominio_id") || "none"} onValueChange={(v) => form.setValue("condominio_id", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Ninguno —</SelectItem>
                  {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Presupuesto mín"><Input type="number" {...form.register("presupuesto_min")} /></Field>
            <Field label="Presupuesto máx"><Input type="number" {...form.register("presupuesto_max")} /></Field>
          </div>
          <Field label="Características deseadas"><Textarea rows={2} {...form.register("caracteristicas_deseadas")} /></Field>
          <Field label="Notas"><Textarea rows={2} {...form.register("notas")} /></Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              {save.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function emptyVals(etapa?: string): FormVals {
  return {
    nombre: "", apellido: "", telefono: "", whatsapp: "", email: "",
    tipo: "comprador", temperatura: "tibio",
    etapa_pipeline: (etapa as any) || "nuevo",
    origen: "", condominio_id: "", presupuesto_min: "", presupuesto_max: "",
    caracteristicas_deseadas: "", notas: "",
  };
}

function Field({ label, children, err }: { label: string; children: React.ReactNode; err?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-[#64748B]">{label}</Label>
      {children}
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}

function Sel({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: [string, string][] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{opts.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
    </Select>
  );
}

export function etapaLabel(e: string) {
  const map: Record<string, string> = {
    nuevo: "Nuevo", contactado: "Contactado", interesado: "Interesado",
    visita_agendada: "Visita agendada", negociacion: "Negociación",
    cierre: "Cierre", ganado: "Ganado", perdido: "Perdido",
  };
  return map[e] ?? e;
}
