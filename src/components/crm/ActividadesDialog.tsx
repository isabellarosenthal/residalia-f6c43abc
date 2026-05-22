import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Phone, Mail, MessageCircle, Calendar, FileText, Clock } from "lucide-react";
import { useActividades, useSaveActividad, useDeleteActividad, type Prospecto } from "@/lib/queries";

const TIPOS: [string, string, any][] = [
  ["llamada", "Llamada", Phone],
  ["whatsapp", "WhatsApp", MessageCircle],
  ["email", "Email", Mail],
  ["visita", "Visita", Calendar],
  ["nota", "Nota", FileText],
];

export function ActividadesDialog({ open, onOpenChange, prospecto }: { open: boolean; onOpenChange: (b: boolean) => void; prospecto: Prospecto | null }) {
  const { data: actividades = [], isLoading } = useActividades(prospecto?.id);
  const save = useSaveActividad();
  const del = useDeleteActividad();
  const [tipo, setTipo] = useState("llamada");
  const [descripcion, setDescripcion] = useState("");
  const [resultado, setResultado] = useState("");
  const [proximoPaso, setProximoPaso] = useState("");

  const handleAdd = async () => {
    if (!prospecto || !descripcion.trim()) return;
    await save.mutateAsync({
      prospecto_id: prospecto.id, tipo,
      descripcion: descripcion.trim(),
      resultado: resultado.trim() || null,
      proximo_paso: proximoPaso.trim() || null,
    });
    setDescripcion(""); setResultado(""); setProximoPaso("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Actividades · {prospecto?.nombre} {prospecto?.apellido ?? ""}</DialogTitle>
          <DialogDescription>Historial de contactos y próximos pasos.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 border border-[#f0e5dc] rounded-lg p-3 bg-[#fdfbf8]">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Resultado</Label>
              <Input value={resultado} onChange={(e) => setResultado(e.target.value)} placeholder="Interesado, no contesta…" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Descripción</Label>
            <Textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Qué se conversó…" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Próximo paso</Label>
            <Input value={proximoPaso} onChange={(e) => setProximoPaso(e.target.value)} placeholder="Enviar cotización el lunes…" />
          </div>
          <Button onClick={handleAdd} disabled={!descripcion.trim() || save.isPending} className="bg-[#c94f0c] hover:bg-[#a33d08]">
            {save.isPending ? "Guardando…" : "Registrar actividad"}
          </Button>
        </div>

        <div className="space-y-2 mt-2">
          <h4 className="text-sm font-semibold text-[#2d1200]">Historial</h4>
          {isLoading ? <p className="text-sm text-[#9a7060]">Cargando…</p> :
           actividades.length === 0 ? <p className="text-sm text-[#9a7060]">Sin actividades aún.</p> :
           actividades.map((a) => {
             const T = TIPOS.find((t) => t[0] === a.tipo);
             const Icon = T?.[2] ?? FileText;
             return (
               <div key={a.id} className="border border-[#f0e5dc] rounded-lg p-3 flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-[#fff1e7] flex items-center justify-center shrink-0">
                   <Icon className="w-4 h-4 text-[#c94f0c]" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 text-xs text-[#9a7060]">
                     <span className="font-medium text-[#2d1200]">{T?.[1] ?? a.tipo}</span>
                     <Clock className="w-3 h-3" />
                     <span>{new Date(a.fecha_actividad).toLocaleString()}</span>
                     {a.resultado && <span className="px-1.5 py-0.5 rounded bg-[#fff1e7] text-[#c94f0c]">{a.resultado}</span>}
                   </div>
                   <p className="text-sm text-[#2d1200] mt-1 whitespace-pre-wrap">{a.descripcion}</p>
                   {a.proximo_paso && <p className="text-xs text-[#c94f0c] mt-1">→ {a.proximo_paso}</p>}
                 </div>
                 <button onClick={() => del.mutate({ id: a.id, prospectoId: prospecto!.id })} className="text-[#9a7060] hover:text-red-600">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             );
           })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
