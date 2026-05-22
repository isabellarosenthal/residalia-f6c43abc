import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-pentos";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, Pencil, Trash2, Search, QrCode } from "lucide-react";
import { useAccesos, useUnidades, useDeleteAcceso, useMarcarSalida, type Acceso } from "@/lib/queries";
import { PaseDialog } from "./PaseDialog";

const fmtDT = (s: string | null) => s ? new Date(s).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" }) : "—";

export function AccesosTable({ edificioId, onEdit }: { edificioId: string; onEdit: (a: Acceso) => void }) {
  const { data: accesos = [], isLoading } = useAccesos(edificioId === "all" ? undefined : edificioId);
  const { data: unidades = [] } = useUnidades();
  const del = useDeleteAcceso();
  const salir = useMarcarSalida();
  const [estado, setEstado] = useState("all");
  const [tipo, setTipo] = useState("all");
  const [search, setSearch] = useState("");
  const [pase, setPase] = useState<Acceso | null>(null);

  const uniMap = useMemo(() => new Map(unidades.map((u) => [u.id, u.numero])), [unidades]);

  const filtered = useMemo(() => accesos.filter((a) => {
    if (estado === "dentro" && a.fecha_salida) return false;
    if (estado === "salio" && !a.fecha_salida) return false;
    if (tipo !== "all" && a.tipo !== tipo) return false;
    if (search && !a.visitante_nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [accesos, estado, tipo, search]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a7060]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar visitante…" className="pl-9" />
        </div>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="dentro">Dentro</SelectItem>
            <SelectItem value="salio">Ya salió</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="visita">Visita</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="proveedor">Proveedor</SelectItem>
            <SelectItem value="servicio">Servicio</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-[#e8ddd8] rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f5ede8] hover:bg-[#f5ede8]">
              <TableHead className="text-[#2d1200] font-semibold">Visitante</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Tipo · Método</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Unidad</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Entrada</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Salida</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Estado</TableHead>
              <TableHead className="text-[#2d1200] font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="py-10 text-center text-[#9a7060]">Cargando…</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-[#9a7060]">Sin accesos registrados.</TableCell></TableRow>}
            {filtered.map((a) => (
              <TableRow key={a.id}>
                <TableCell><div className="font-medium text-[#2d1200]">{a.visitante_nombre}</div>{a.qr_code && <div className="text-xs text-[#9a7060]">QR: {a.qr_code}</div>}</TableCell>
                <TableCell className="text-sm capitalize">{a.tipo ?? "—"} · <span className="text-[#9a7060]">{a.metodo ?? "—"}</span></TableCell>
                <TableCell className="text-sm">{a.unidad_id ? `#${uniMap.get(a.unidad_id) ?? "—"}` : "—"}</TableCell>
                <TableCell className="text-sm">{fmtDT(a.fecha_entrada)}</TableCell>
                <TableCell className="text-sm">{fmtDT(a.fecha_salida)}</TableCell>
                <TableCell>{a.fecha_salida ? <Badge variant="neutral">Salió</Badge> : <Badge variant="success">Dentro</Badge>}</TableCell>
                <TableCell className="text-right">
                  {!a.fecha_salida && <Button size="sm" variant="ghost" title="Registrar salida" onClick={() => salir.mutate(a.id)} className="h-8 w-8 p-0 text-[#2d6a2d]"><LogOut className="w-4 h-4" /></Button>}
                  <Button size="sm" variant="ghost" onClick={() => onEdit(a)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("¿Eliminar registro?")) del.mutate(a.id); }} className="h-8 w-8 p-0 text-[#c0392b] hover:text-[#c0392b]"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
