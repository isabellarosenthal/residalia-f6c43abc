import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-pentos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, CheckCircle2, Search, Printer } from "lucide-react";
import { fmtL, fmtDate } from "@/lib/format";
import { useCobros, useDeleteCobro, useMarcarPagado, useUnidades, useResidentes, diasMora, type Cobro } from "@/lib/queries";

export function CobrosTable({ edificioId, onEdit }: { edificioId: string; onEdit: (c: Cobro) => void }) {
  const { data: cobros = [], isLoading } = useCobros(edificioId === "all" ? undefined : edificioId);
  const { data: unidades = [] } = useUnidades();
  const { data: residentes = [] } = useResidentes();
  const del = useDeleteCobro();
  const pagar = useMarcarPagado();
  const [estado, setEstado] = useState("all");
  const [search, setSearch] = useState("");
  const [soloMorosos, setSoloMorosos] = useState(false);

  const uniMap = useMemo(() => new Map(unidades.map((u) => [u.id, u.numero])), [unidades]);
  const resMap = useMemo(() => new Map(residentes.map((r) => [r.id, `${r.nombre} ${r.apellido}`])), [residentes]);

  const filtered = useMemo(() => cobros.filter((c) => {
    if (estado !== "all" && c.estado !== estado) return false;
    if (search && !c.concepto.toLowerCase().includes(search.toLowerCase())) return false;
    if (soloMorosos && diasMora(c.fecha_vencimiento, c.estado) <= 0) return false;
    return true;
  }), [cobros, estado, search, soloMorosos]);

  const estadoBadge = (c: Cobro) => {
    if (c.estado === "pagado") return <Badge variant="success">Pagado</Badge>;
    const d = diasMora(c.fecha_vencimiento, c.estado);
    if (d > 0) return <Badge variant="danger">Vencido · {d}d</Badge>;
    if (c.estado === "parcial") return <Badge variant="warning">Parcial</Badge>;
    if (c.estado === "vencido") return <Badge variant="danger">Vencido</Badge>;
    return <Badge variant="neutral">Pendiente</Badge>;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a7060]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar concepto…" className="pl-9" />
        </div>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="pagado">Pagados</SelectItem>
            <SelectItem value="parcial">Parciales</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm text-[#2d1200] cursor-pointer select-none px-2">
          <Switch checked={soloMorosos} onCheckedChange={setSoloMorosos} />
          Solo morosos
        </label>
      </div>

      <div className="bg-white border border-[#e8ddd8] rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f5ede8] hover:bg-[#f5ede8]">
              <TableHead className="text-[#2d1200] font-semibold">Concepto</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Unidad · Residente</TableHead>
              <TableHead className="text-[#2d1200] font-semibold text-right">Monto</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Vence</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Estado</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Recibo</TableHead>
              <TableHead className="text-[#2d1200] font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="py-10 text-center text-[#9a7060]">Cargando…</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-[#9a7060]">Sin cobros para los filtros.</TableCell></TableRow>}
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell><div className="font-medium text-[#2d1200]">{c.concepto}</div></TableCell>
                <TableCell className="text-sm">
                  <div className="text-[#2d1200]">{c.unidad_id ? `#${uniMap.get(c.unidad_id) ?? "—"}` : "—"}</div>
                  <div className="text-xs text-[#9a7060]">{c.residente_id ? resMap.get(c.residente_id) ?? "—" : "—"}</div>
                </TableCell>
                <TableCell className="text-right font-semibold text-[#c94f0c]">{fmtL(c.monto)}</TableCell>
                <TableCell className="text-sm">{fmtDate(c.fecha_vencimiento)}</TableCell>
                <TableCell>{estadoBadge(c)}</TableCell>
                <TableCell className="text-xs text-[#9a7060]">{c.recibo_numero ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {c.estado === "pagado" && (
                    <Link to="/recibo/$cobroId" params={{ cobroId: c.id }} target="_blank">
                      <Button size="sm" variant="ghost" title="Imprimir recibo" className="h-8 w-8 p-0 text-[#2d1200]"><Printer className="w-4 h-4" /></Button>
                    </Link>
                  )}
                  {c.estado !== "pagado" && (
                    <Button size="sm" variant="ghost" title="Marcar pagado" onClick={() => pagar.mutate({ id: c.id, metodo: c.metodo_pago ?? "efectivo" })} className="h-8 w-8 p-0 text-[#2d6a2d]"><CheckCircle2 className="w-4 h-4" /></Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => onEdit(c)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm("¿Eliminar cobro?")) del.mutate(c.id); }} className="h-8 w-8 p-0 text-[#c0392b] hover:text-[#c0392b]"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
