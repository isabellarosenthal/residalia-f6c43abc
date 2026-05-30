import { useMemo, useState } from "react";
import { Card } from "@/components/ui-pentos";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageCircle, Copy, BellRing } from "lucide-react";
import toast from "react-hot-toast";
import { fmtL, fmtDate } from "@/lib/format";
import { useCobros, useResidentes, useUnidades, useEdificios } from "@/lib/queries";

type Moroso = {
  residenteId: string;
  nombre: string;
  telefono: string | null;
  whatsapp: string | null;
  email: string | null;
  unidad: string;
  cobros: { concepto: string; monto: number; fecha_vencimiento: string; dias: number }[];
  total: number;
  diasMax: number;
};

const cleanPhone = (p: string | null | undefined) => (p ?? "").replace(/\D/g, "");

export function RecordatoriosMorosos({ edificioId }: { edificioId: string }) {
  const filter = edificioId === "all" ? undefined : edificioId;
  const { data: cobros = [] } = useCobros(filter);
  const { data: residentes = [] } = useResidentes();
  const { data: unidades = [] } = useUnidades(filter);
  const { data: edificios = [] } = useEdificios();

  const edificio = edificios.find((e) => e.id === edificioId);
  const nombreEdificio = edificio?.nombre ?? "tu condominio";

  const [plantilla, setPlantilla] = useState(
    `Hola {{nombre}}, te recordamos que tienes un saldo pendiente de {{total}} en {{edificio}} (unidad {{unidad}}).\n\nDetalle:\n{{detalle}}\n\nAgradecemos regularizar a la brevedad. ¡Gracias!`
  );

  const morosos = useMemo<Moroso[]>(() => {
    const today = new Date();
    const resMap = new Map(residentes.map((r) => [r.id, r]));
    const uniMap = new Map(unidades.map((u) => [u.id, u]));
    const m = new Map<string, Moroso>();
    cobros
      .filter((c) => (c.estado === "vencido" || c.estado === "pendiente" || c.estado === "parcial") && c.residente_id)
      .forEach((c) => {
        const r = resMap.get(c.residente_id!);
        if (!r) return;
        const u = c.unidad_id ? uniMap.get(c.unidad_id) : null;
        const dias = Math.floor((today.getTime() - new Date(c.fecha_vencimiento).getTime()) / 86400000);
        const cur = m.get(r.id) ?? {
          residenteId: r.id,
          nombre: `${r.nombre} ${r.apellido ?? ""}`.trim(),
          telefono: r.telefono,
          whatsapp: r.telefono_alt ?? r.telefono,
          email: r.email,
          unidad: u ? `${u.piso ? `P${u.piso}-` : ""}${u.numero}` : "—",
          cobros: [],
          total: 0,
          diasMax: 0,
        };
        cur.cobros.push({ concepto: c.concepto, monto: Number(c.monto), fecha_vencimiento: c.fecha_vencimiento, dias });
        cur.total += Number(c.monto);
        cur.diasMax = Math.max(cur.diasMax, dias);
        m.set(r.id, cur);
      });
    return Array.from(m.values()).sort((a, b) => b.total - a.total);
  }, [cobros, residentes, unidades]);

  const renderMensaje = (m: Moroso) => {
    const detalle = m.cobros
      .map((c) => `• ${c.concepto} — ${fmtL(c.monto)} (vence ${fmtDate(c.fecha_vencimiento)}${c.dias > 0 ? `, ${c.dias} días vencido` : ""})`)
      .join("\n");
    return plantilla
      .replaceAll("{{nombre}}", m.nombre)
      .replaceAll("{{total}}", fmtL(m.total))
      .replaceAll("{{edificio}}", nombreEdificio)
      .replaceAll("{{unidad}}", m.unidad)
      .replaceAll("{{detalle}}", detalle);
  };

  const copyMsg = async (m: Moroso) => {
    await navigator.clipboard.writeText(renderMensaje(m));
    toast.success("Mensaje copiado");
  };
  const waLink = (m: Moroso) => {
    const phone = cleanPhone(m.whatsapp);
    if (!phone) return null;
    return `https://wa.me/${phone}?text=${encodeURIComponent(renderMensaje(m))}`;
  };
  const mailLink = (m: Moroso) => {
    if (!m.email) return null;
    const subject = `Recordatorio de saldo pendiente — ${nombreEdificio}`;
    return `mailto:${m.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(renderMensaje(m))}`;
  };

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <BellRing className="w-5 h-5 text-[#ffd60a] mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-[#0a1e3f]">Recordatorios a morosos</h3>
            <p className="text-sm text-[#6b7a99]">Edita la plantilla y envía por WhatsApp o email. Variables: <code>{`{{nombre}}`}</code>, <code>{`{{total}}`}</code>, <code>{`{{unidad}}`}</code>, <code>{`{{edificio}}`}</code>, <code>{`{{detalle}}`}</code>.</p>
          </div>
        </div>
        <Label className="text-xs">Plantilla del mensaje</Label>
        <Textarea value={plantilla} onChange={(e) => setPlantilla(e.target.value)} rows={6} className="mt-1 font-mono text-sm" />
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-[#0a1e3f]">{morosos.length} residente{morosos.length === 1 ? "" : "s"} con saldo</h3>
        </div>
        <div className="space-y-3">
          {morosos.length === 0 && <div className="text-center text-[#6b7a99] py-8">Sin morosos en este edificio 🎉</div>}
          {morosos.map((m) => {
            const wa = waLink(m);
            const ml = mailLink(m);
            return (
              <div key={m.residenteId} className="border border-[#e8ecf3] rounded-xl p-4 flex flex-wrap gap-4 items-start">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-semibold text-[#0a1e3f]">{m.nombre} <span className="text-xs text-[#6b7a99] font-normal">· Unidad {m.unidad}</span></div>
                  <div className="text-xs text-[#6b7a99] mt-0.5">{m.cobros.length} cobro{m.cobros.length === 1 ? "" : "s"} · máx {m.diasMax > 0 ? `${m.diasMax} días vencido` : "vigente"}</div>
                  <div className="text-xs text-[#6b7a99] mt-1">{m.email ?? "sin email"} · {m.whatsapp ?? "sin teléfono"}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-extrabold text-[#be185d] text-xl">{fmtL(m.total)}</div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button size="sm" variant="outline" onClick={() => copyMsg(m)}><Copy className="w-4 h-4 mr-1" />Copiar</Button>
                  <Button size="sm" variant="outline" disabled={!wa} asChild={!!wa}>
                    {wa ? <a href={wa} target="_blank" rel="noreferrer"><MessageCircle className="w-4 h-4 mr-1" />WhatsApp</a> : <span><MessageCircle className="w-4 h-4 mr-1" />WhatsApp</span>}
                  </Button>
                  <Button size="sm" className="bg-[#ffd60a] hover:bg-[#e6c200]" disabled={!ml} asChild={!!ml}>
                    {ml ? <a href={ml}><Mail className="w-4 h-4 mr-1" />Email</a> : <span><Mail className="w-4 h-4 mr-1" />Email</span>}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
