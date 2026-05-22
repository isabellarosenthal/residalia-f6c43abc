import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { fmtL, fmtDate } from "@/lib/format";
import { useEgresos, useDeleteEgreso, type Egreso } from "@/lib/queries";

export function EgresosTable({ edificioId, onEdit }: { edificioId: string; onEdit: (e: Egreso) => void }) {
  const { data: egresos = [], isLoading } = useEgresos(edificioId === "all" ? undefined : edificioId);
  const del = useDeleteEgreso();

  return (
    <div className="bg-white border border-[#e8ddd8] rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#f5ede8] hover:bg-[#f5ede8]">
            <TableHead className="text-[#2d1200] font-semibold">Fecha</TableHead>
            <TableHead className="text-[#2d1200] font-semibold">Categoría</TableHead>
            <TableHead className="text-[#2d1200] font-semibold">Proveedor</TableHead>
            <TableHead className="text-[#2d1200] font-semibold">Descripción</TableHead>
            <TableHead className="text-[#2d1200] font-semibold text-right">Monto</TableHead>
            <TableHead className="text-[#2d1200] font-semibold text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableRow><TableCell colSpan={6} className="py-10 text-center text-[#9a7060]">Cargando…</TableCell></TableRow>}
          {!isLoading && egresos.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-[#9a7060]">Sin egresos registrados.</TableCell></TableRow>}
          {egresos.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="text-sm">{fmtDate(e.fecha)}</TableCell>
              <TableCell className="capitalize text-sm">{e.categoria}</TableCell>
              <TableCell className="text-sm">{e.proveedor ?? "—"}</TableCell>
              <TableCell className="text-sm text-[#4a2800] max-w-[280px] truncate">{e.descripcion ?? "—"}</TableCell>
              <TableCell className="text-right font-semibold text-[#c0392b]">{fmtL(e.monto)}</TableCell>
              <TableCell className="text-right">
                {e.comprobante_url && <a href={e.comprobante_url} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center text-[#4a2800]"><ExternalLink className="w-4 h-4" /></a>}
                <Button size="sm" variant="ghost" onClick={() => onEdit(e)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => { if (confirm("¿Eliminar egreso?")) del.mutate(e.id); }} className="h-8 w-8 p-0 text-[#c0392b] hover:text-[#c0392b]"><Trash2 className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
