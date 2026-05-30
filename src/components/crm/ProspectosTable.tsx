import { useMemo, useState } from "react";
import { Pencil, Trash2, MessageCircle, Phone, Mail, Activity } from "lucide-react";
import { useProspectos, useDeleteProspecto, type Prospecto } from "@/lib/queries";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { etapaLabel } from "./ProspectoFormDialog";

const TEMP_STYLE: Record<string, string> = {
  frio: "bg-blue-100 text-blue-700",
  tibio: "bg-amber-100 text-amber-700",
  caliente: "bg-red-100 text-red-700",
};
const ETAPA_STYLE: Record<string, string> = {
  nuevo: "bg-slate-100 text-slate-700",
  contactado: "bg-blue-100 text-blue-700",
  interesado: "bg-purple-100 text-purple-700",
  visita_agendada: "bg-indigo-100 text-indigo-700",
  negociacion: "bg-amber-100 text-amber-700",
  cierre: "bg-orange-100 text-orange-700",
  ganado: "bg-green-100 text-green-700",
  perdido: "bg-red-100 text-red-700",
};

export function ProspectosTable({
  edificioId, onEdit, onActivity,
}: { edificioId: string; onEdit: (p: Prospecto) => void; onActivity: (p: Prospecto) => void }) {
  const { data: all = [], isLoading } = useProspectos(edificioId === "all" ? undefined : edificioId);
  const del = useDeleteProspecto();
  const [q, setQ] = useState("");
  const [etapa, setEtapa] = useState("all");
  const [temp, setTemp] = useState("all");

  const rows = useMemo(() => all.filter((p) => {
    if (etapa !== "all" && p.etapa_pipeline !== etapa) return false;
    if (temp !== "all" && p.temperatura !== temp) return false;
    if (q && !`${p.nombre} ${p.apellido ?? ""} ${p.email ?? ""} ${p.telefono ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [all, q, etapa, temp]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Buscar nombre, email, tel…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={etapa} onValueChange={setEtapa}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las etapas</SelectItem>
            {Object.keys(ETAPA_STYLE).map((e) => <SelectItem key={e} value={e}>{etapaLabel(e)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={temp} onValueChange={setTemp}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda temperatura</SelectItem>
            <SelectItem value="frio">Frío</SelectItem>
            <SelectItem value="tibio">Tibio</SelectItem>
            <SelectItem value="caliente">Caliente</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto text-sm text-[#64748B] self-center">{rows.length} prospectos</span>
      </div>

      <div className="bg-white border border-[#f0e5dc] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#fdfbf8] text-[#64748B]">
              <tr>
                <Th>Nombre</Th><Th>Contacto</Th><Th>Tipo</Th><Th>Temp.</Th><Th>Etapa</Th>
                <Th>Presupuesto</Th><Th>Origen</Th><Th>Último contacto</Th><Th> </Th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={9} className="text-center py-8 text-[#64748B]">Cargando…</td></tr> :
               rows.length === 0 ? <tr><td colSpan={9} className="text-center py-8 text-[#64748B]">Sin prospectos.</td></tr> :
               rows.map((p) => (
                 <tr key={p.id} className="border-t border-[#F8FAFC] hover:bg-[#fdfbf8]">
                   <Td><div className="font-medium text-[#173B7A]">{p.nombre} {p.apellido ?? ""}</div></Td>
                   <Td>
                     <div className="flex flex-col gap-0.5 text-xs">
                       {p.telefono && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.telefono}</span>}
                       {p.whatsapp && <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{p.whatsapp}</span>}
                       {p.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{p.email}</span>}
                     </div>
                   </Td>
                   <Td><span className="capitalize">{p.tipo}</span></Td>
                   <Td><Pill cls={TEMP_STYLE[p.temperatura]}>{p.temperatura}</Pill></Td>
                   <Td><Pill cls={ETAPA_STYLE[p.etapa_pipeline]}>{etapaLabel(p.etapa_pipeline)}</Pill></Td>
                   <Td className="text-xs">
                     {p.presupuesto_min || p.presupuesto_max ?
                       `L ${fmt(p.presupuesto_min)} - ${fmt(p.presupuesto_max)}` : "—"}
                   </Td>
                   <Td className="text-xs">{p.origen ?? "—"}</Td>
                   <Td className="text-xs">{p.ultimo_contacto ? new Date(p.ultimo_contacto).toLocaleDateString() : "—"}</Td>
                   <Td>
                     <div className="flex gap-1 justify-end">
                       <IconBtn title="Actividades" onClick={() => onActivity(p)}><Activity className="w-4 h-4" /></IconBtn>
                       <IconBtn title="Editar" onClick={() => onEdit(p)}><Pencil className="w-4 h-4" /></IconBtn>
                       <IconBtn title="Eliminar" onClick={() => confirm(`¿Eliminar ${p.nombre}?`) && del.mutate(p.id)} className="hover:text-red-600">
                         <Trash2 className="w-4 h-4" />
                       </IconBtn>
                     </div>
                   </Td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const fmt = (n: number | null) => n == null ? "?" : Number(n).toLocaleString();
const Th = ({ children }: { children: React.ReactNode }) => <th className="text-left font-medium px-3 py-2 text-xs uppercase tracking-wide">{children}</th>;
const Td = ({ children, className = "" }: any) => <td className={`px-3 py-2 ${className}`}>{children}</td>;
const Pill = ({ children, cls }: any) => <span className={`px-2 py-0.5 rounded text-xs capitalize ${cls}`}>{children}</span>;
const IconBtn = ({ children, className = "", ...p }: any) => (
  <button className={`p-1.5 rounded hover:bg-[#F8FAFC] text-[#64748B] ${className}`} {...p}>{children}</button>
);
