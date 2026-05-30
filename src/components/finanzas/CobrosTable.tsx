import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-pentos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, DollarSign, Search, Printer, AlertTriangle } from "lucide-react";
import { fmtL, fmtDate } from "@/lib/format";
import { useCobros, useDeleteCobro, useUnidades, useResidentes, usePagosDeEdificio, useMarcarVencidos, diasMora, type Cobro } from "@/lib/queries";

const RegistrarPagoDialog = lazy(() => import("./RegistrarPagoDialog").then((m) => ({ default: m.RegistrarPagoDialog })));

export function CobrosTable({ edificioId, onEdit }: { edificioId: string; onEdit: (c: Cobro) => void }) {
  const filter = edificioId === "all" ? undefined : edificioId;
  const { data: cobros = [], isLoading } = useCobros(filter);
  const { data: unidades = [] } = useUnidades();
  const { data: residentes = [] } = useResidentes();
  const { data: pagos = [] } = usePagosDeEdificio(filter);
  const del = useDeleteCobro();
  const vencer = useMarcarVencidos();

  const [estado, setEstado] = useState("all");
  const [search, setSearch] = useState("");
  const [soloMorosos, setSoloMorosos] = useState(false);
  const [unidadFilter, setUnidadFilter] = useState("all");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [pagoCobro, setPagoCobro] = useState<Cobro | null>(null);

  const uniMap = useMemo(() => new Map(unidades.map((u) => [u.id, u.numero])), [unidades]);
  const resMap = useMemo(() => new Map(residentes.map((r) => [r.id, `${r.nombre} ${r.apellido}`])), [residentes]);
  const abonadoMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of pagos) m.set(p.cobro_id, (m.get(p.cobro_id) ?? 0) + Number(p.monto));
    return m;
  }, [pagos]);

  const unidadesEdif = useMemo(() => unidades.filter((u) => !filter || u.condominio_id === filter), [unidades, filter]);

  const filtered = useMemo(() => cobros.filter((c) => {
    if (estado !== "all" && c.estado !== estado) return false;
    if (search && !c.concepto.toLowerCase().includes(search.toLowerCase())) return false;
    if (soloMorosos && diasMora(c.fecha_vencimiento, c.estado) <= 0) return false;
    if (unidadFilter !== "all" && c.unidad_id !== unidadFilter) return false;
    if (desde && c.fecha_vencimiento < desde) return false;
    if (hasta && c.fecha_vencimiento > hasta) return false;
    return true;
  }), [cobros, estado, search, soloMorosos, unidadFilter, desde, hasta]);

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
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar concepto…" className="pl-9" />
        </div>
        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="pagado">Pagados</SelectItem>
            <SelectItem value="parcial">Parciales</SelectItem>
            <SelectItem value="vencido">Vencidos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={unidadFilter} onValueChange={setUnidadFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Unidad" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">Todas las unidades</SelectItem>
            {unidadesEdif.map((u) => <SelectItem key={u.id} value={u.id}>#{u.numero}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="w-[150px]" title="Vence desde" />
        <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="w-[150px]" title="Vence hasta" />
        <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer select-none px-2">
          <Switch checked={soloMorosos} onCheckedChange={setSoloMorosos} />
          Solo morosos
        </label>
        <Button variant="outline" size="sm" onClick={() => vencer.mutate(filter)} disabled={vencer.isPending} title="Mover pendientes con fecha vencida a estado vencido">
          <AlertTriangle className="w-4 h-4 mr-1" />Marcar vencidos
        </Button>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
              <TableHead className="text-[#374151] font-semibold">Concepto</TableHead>
              <TableHead className="text-[#374151] font-semibold">Unidad · Residente</TableHead>
              <TableHead className="text-[#374151] font-semibold text-right">Monto</TableHead>
              <TableHead className="text-[#374151] font-semibold text-right">Abonado</TableHead>
              <TableHead className="text-[#374151] font-semibold text-right">Saldo</TableHead>
              <TableHead className="text-[#374151] font-semibold">Vence</TableHead>
              <TableHead className="text-[#374151] font-semibold">Estado</TableHead>
              <TableHead className="text-[#374151] font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={8} className="py-10 text-center text-[#64748B]">Cargando…</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={8} className="py-10 text-center text-[#64748B]">Sin cobros para los filtros.</TableCell></TableRow>}
            {filtered.map((c) => {
              const abonado = abonadoMap.get(c.id) ?? 0;
              const saldo = Math.max(0, Number(c.monto) - abonado);
              return (
                <TableRow key={c.id}>
                  <TableCell><div className="font-medium text-[#374151]">{c.concepto}</div>{c.recibo_numero && <div className="text-xs text-[#64748B]">{c.recibo_numero}</div>}</TableCell>
                  <TableCell className="text-sm">
                    <div className="text-[#374151]">{c.unidad_id ? `#${uniMap.get(c.unidad_id) ?? "—"}` : "—"}</div>
                    <div className="text-xs text-[#64748B]">{c.residente_id ? resMap.get(c.residente_id) ?? "—" : "—"}</div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-[#374151]">{fmtL(c.monto)}</TableCell>
                  <TableCell className="text-right text-sm text-[#166534]">{abonado > 0 ? fmtL(abonado) : "—"}</TableCell>
                  <TableCell className="text-right font-semibold text-[#374151]">{saldo > 0 ? fmtL(saldo) : "—"}</TableCell>
                  <TableCell className="text-sm">{fmtDate(c.fecha_vencimiento)}</TableCell>
                  <TableCell>{estadoBadge(c)}</TableCell>
                  <TableCell className="text-right">
                    {c.estado === "pagado" && (
                      <Link to="/recibo/$cobroId" params={{ cobroId: c.id }} target="_blank">
                        <Button size="sm" variant="ghost" title="Imprimir recibo" className="h-8 w-8 p-0 text-[#374151]"><Printer className="w-4 h-4" /></Button>
                      </Link>
                    )}
                    <Button size="sm" variant="ghost" title={saldo > 0 ? "Registrar pago" : "Ver pagos"} onClick={() => setPagoCobro(c)} className="h-8 w-8 p-0 text-[#166534]"><DollarSign className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(c)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm("¿Eliminar cobro?")) del.mutate(c.id); }} className="h-8 w-8 p-0 text-[#be185d] hover:text-[#be185d]"><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Suspense fallback={null}>
        {pagoCobro && <RegistrarPagoDialog open={!!pagoCobro} onOpenChange={(v) => !v && setPagoCobro(null)} cobro={pagoCobro} />}
      </Suspense>
    </div>
  );
}
