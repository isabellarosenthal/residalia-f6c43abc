import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMiResidente, useSaveAcceso } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/portal/nuevo")({ component: NuevoPase });

const nowLocal = () => {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const MIN_DEF: Record<string, number | null> = { delivery: 15, proveedor: 120, servicio: 240, visita: null, otro: null };

function NuevoPase() {
  const { data: residente, isLoading } = useMiResidente();
  const save = useSaveAcceso();
  const navigate = useNavigate();

  const [visitante, setVisitante] = useState("");
  const [tipo, setTipo] = useState("visita");
  const [fechaEntrada, setFechaEntrada] = useState(nowLocal());
  const [fechaSalida, setFechaSalida] = useState("");
  const [usos, setUsos] = useState(1);

  if (isLoading) return <div className="text-sm text-[#64748B]">Cargando…</div>;
  if (!residente) return <div className="text-sm text-[#7a2a10]">Tu cuenta no está vinculada a un residente.</div>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: u } = await supabase.auth.getUser();
    const r = await save.mutateAsync({
      condominio_id: residente.condominio_id,
      unidad_id: residente.unidad_id,
      visitante_nombre: visitante,
      tipo,
      metodo: "qr",
      qr_code: `PASE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      fecha_entrada: new Date(fechaEntrada).toISOString(),
      fecha_salida: fechaSalida ? new Date(fechaSalida).toISOString() : null,
      usos_maximos: usos,
      minutos_max_estadia: MIN_DEF[tipo],
      autorizado_por: u.user?.id ?? null,
    });
    navigate({ to: "/portal/pase/$paseId", params: { paseId: r.id } });
  };

  return (
    <form onSubmit={submit} className="space-y-4 bg-white border border-[#E2E8F0] rounded-2xl p-5">
      <h1 className="font-display font-extrabold text-xl text-[#4F46E5]">Crear pase de acceso</h1>
      <div>
        <Label>Nombre del visitante *</Label>
        <Input value={visitante} onChange={(e) => setVisitante(e.target.value)} required maxLength={120} />
      </div>
      <div>
        <Label>Tipo</Label>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="visita">Visita</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="proveedor">Proveedor</SelectItem>
            <SelectItem value="servicio">Servicio</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Entrada *</Label><Input type="datetime-local" value={fechaEntrada} onChange={(e) => setFechaEntrada(e.target.value)} required /></div>
        <div><Label>Salida</Label><Input type="datetime-local" value={fechaSalida} onChange={(e) => setFechaSalida(e.target.value)} /></div>
      </div>
      <div>
        <Label>Entradas permitidas</Label>
        <Input type="number" min={1} max={50} value={usos} onChange={(e) => setUsos(Math.max(1, Number(e.target.value) || 1))} />
      </div>
      <Button type="submit" disabled={save.isPending || !visitante.trim()} className="w-full bg-[#4F46E5] hover:bg-[#4338CA]">
        {save.isPending ? "Creando…" : "Crear pase"}
      </Button>
    </form>
  );
}
