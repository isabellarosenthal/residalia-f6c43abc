import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { fmtL, fmtDate } from "@/lib/format";
import { useEgresos, useDeleteEgreso, type Egreso } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

async function openComprobante(url: string) {
  if (url.startsWith("http")) { window.open(url, "_blank"); return; }
  const { data, error } = await supabase.storage.from("comprobantes").createSignedUrl(url, 300);
  if (error || !data?.signedUrl) { toast.error("No se pudo abrir el archivo"); return; }
  window.open(data.signedUrl, "_blank");
}

export function EgresosTable({ edificioId, onEdit }: { edificioId: string; onEdit: (e: Egreso) => void }) {
  const { data: egresos = [], isLoading } = useEgresos(edificioId === "all" ? undefined : edificioId);
  const del = useDeleteEgreso();

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
            <TableHead className="text-[#4F46E5] font-semibold">Fecha</TableHead>
            <TableHead className="text-[#4F46E5] font-semibold">Categoría</TableHead>
            <TableHead className="text-[#4F46E5] font-semibold">Proveedor</TableHead>
            <TableHead className="text-[#4F46E5] font-semibold">Descripción</TableHead>
            <TableHead className="text-[#4F46E5] font-semibold text-right">Monto</TableHead>
            <TableHead className="text-[#4F46E5] font-semibold text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableRow><TableCell colSpan={6} className="py-10 text-center text-[#64748B]">Cargando…</TableCell></TableRow>}
          {!isLoading && egresos.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-[#64748B]">Sin egresos registrados.</TableCell></TableRow>}
          {egresos.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="text-sm">{fmtDate(e.fecha)}</TableCell>
              <TableCell className="capitalize text-sm">{e.categoria}</TableCell>
              <TableCell className="text-sm">{e.proveedor ?? "—"}</TableCell>
              <TableCell className="text-sm text-[#1E293B] max-w-[280px] truncate">{e.descripcion ?? "—"}</TableCell>
              <TableCell className="text-right font-semibold text-[#be185d]">{fmtL(e.monto)}</TableCell>
              <TableCell className="text-right">
                {e.comprobante_url && <Button size="sm" variant="ghost" onClick={() => openComprobante(e.comprobante_url!)} className="h-8 w-8 p-0"><ExternalLink className="w-4 h-4" /></Button>}
                <Button size="sm" variant="ghost" onClick={() => onEdit(e)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => { if (confirm("¿Eliminar egreso?")) del.mutate(e.id); }} className="h-8 w-8 p-0 text-[#be185d] hover:text-[#be185d]"><Trash2 className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
