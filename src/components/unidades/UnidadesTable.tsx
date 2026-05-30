import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Pencil, Trash2, BedDouble, Bath, Car, X } from "lucide-react";
import { EstadoAdminBadge, EstadoComercialBadge } from "./EstadoBadge";
import { fmtL, fmtMoney } from "@/lib/format";
import {
  useUnidades,
  useDeleteUnidad,
  useResidentesMap,
  useResidentes,
  useBulkUpdateUnidades,
  type Unidad,
} from "@/lib/queries";

const ADMIN_OPTS = ["disponible", "ocupada", "vacia"] as const;
const COMERCIAL_OPTS = ["disponible", "en_venta", "en_renta", "en_venta_y_renta", "reservada", "ocupada"] as const;

export function UnidadesTable({ edificioId, onEdit }: { edificioId: string; onEdit: (u: Unidad) => void }) {
  const { data: unidades = [], isLoading } = useUnidades(edificioId);
  const { data: residentesMap } = useResidentesMap();
  const { data: residentes = [] } = useResidentes();
  const del = useDeleteUnidad();
  const bulk = useBulkUpdateUnidades();
  const [search, setSearch] = useState("");
  const [admin, setAdmin] = useState<string>("all");
  const [comercial, setComercial] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return unidades.filter((u) => {
      if (search && !u.numero.toLowerCase().includes(search.toLowerCase())) return false;
      if (admin !== "all" && u.estado_administrativo !== admin) return false;
      if (comercial !== "all" && u.estado_comercial !== comercial) return false;
      return true;
    });
  }, [unidades, search, admin, comercial]);

  const allChecked = filtered.length > 0 && filtered.every((u) => selected.has(u.id));

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    setSelected((s) => {
      if (allChecked) {
        const n = new Set(s);
        filtered.forEach((u) => n.delete(u.id));
        return n;
      }
      const n = new Set(s);
      filtered.forEach((u) => n.add(u.id));
      return n;
    });
  };

  const applyBulk = async (patch: Record<string, any>) => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    await bulk.mutateAsync({ ids, patch });
    setSelected(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por número…" className="pl-9" />
        </div>
        <Select value={admin} onValueChange={setAdmin}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Estado admin" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los admin</SelectItem>
            <SelectItem value="ocupada">Ocupadas</SelectItem>
            <SelectItem value="disponible">Disponibles</SelectItem>
            <SelectItem value="vacia">Vacías</SelectItem>
          </SelectContent>
        </Select>
        <Select value={comercial} onValueChange={setComercial}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Estado comercial" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos comercial</SelectItem>
            <SelectItem value="disponible">Disponibles</SelectItem>
            <SelectItem value="en_venta">En venta</SelectItem>
            <SelectItem value="en_renta">En renta</SelectItem>
            <SelectItem value="en_venta_y_renta">Venta y renta</SelectItem>
            <SelectItem value="reservada">Reservadas</SelectItem>
            <SelectItem value="ocupada">Ocupadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-[#fff5ec] border border-[#f3d6bd] rounded-xl px-3 py-2">
          <span className="text-sm font-semibold text-[#173B7A]">{selected.size} seleccionada{selected.size > 1 ? "s" : ""}</span>
          <span className="text-xs text-[#64748B]">·</span>
          <Select onValueChange={(v) => applyBulk({ estado_administrativo: v })}>
            <SelectTrigger className="h-8 w-[180px] bg-white"><SelectValue placeholder="Cambiar estado admin" /></SelectTrigger>
            <SelectContent>
              {ADMIN_OPTS.map((o) => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => applyBulk({ estado_comercial: v })}>
            <SelectTrigger className="h-8 w-[200px] bg-white"><SelectValue placeholder="Cambiar estado comercial" /></SelectTrigger>
            <SelectContent>
              {COMERCIAL_OPTS.map((o) => <SelectItem key={o} value={o} className="capitalize">{o.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => applyBulk({ propietario_id: v === "__none__" ? null : v })}>
            <SelectTrigger className="h-8 w-[200px] bg-white"><SelectValue placeholder="Asignar propietario" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— Sin propietario —</SelectItem>
              {residentes.map((r) => <SelectItem key={r.id} value={r.id}>{r.nombre} {r.apellido ?? ""}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => applyBulk({ inquilino_id: v === "__none__" ? null : v })}>
            <SelectTrigger className="h-8 w-[200px] bg-white"><SelectValue placeholder="Asignar inquilino" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— Sin inquilino —</SelectItem>
              {residentes.map((r) => <SelectItem key={r.id} value={r.id}>{r.nombre} {r.apellido ?? ""}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="h-8">
            <X className="w-4 h-4 mr-1" /> Limpiar
          </Button>
        </div>
      )}

      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
              <TableHead className="w-10">
                <Checkbox checked={allChecked} onCheckedChange={toggleAll} aria-label="Seleccionar todas" />
              </TableHead>
              <TableHead className="text-[#173B7A] font-semibold">Unidad</TableHead>
              <TableHead className="text-[#173B7A] font-semibold">Tipo</TableHead>
              <TableHead className="text-[#173B7A] font-semibold">Características</TableHead>
              <TableHead className="text-[#173B7A] font-semibold">Estado admin.</TableHead>
              <TableHead className="text-[#173B7A] font-semibold">Estado comercial</TableHead>
              <TableHead className="text-[#173B7A] font-semibold">Propietario / Inquilino</TableHead>
              <TableHead className="text-[#173B7A] font-semibold text-right">Precios</TableHead>
              <TableHead className="text-[#173B7A] font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={9} className="py-10 text-center text-[#64748B]">Cargando unidades…</TableCell></TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={9} className="py-10 text-center text-[#64748B]">Sin unidades para los filtros aplicados.</TableCell></TableRow>
            )}
            {filtered.map((u) => (
              <TableRow key={u.id} data-state={selected.has(u.id) ? "selected" : undefined}>
                <TableCell>
                  <Checkbox checked={selected.has(u.id)} onCheckedChange={() => toggle(u.id)} aria-label={`Seleccionar ${u.numero}`} />
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-[#173B7A]">#{u.numero}</div>
                  <div className="text-xs text-[#64748B]">{u.piso != null ? `Piso ${u.piso}` : "—"}</div>
                </TableCell>
                <TableCell className="capitalize">{u.tipo ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 text-xs text-[#1E293B]">
                    <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-[#64748B]" />{u.habitaciones ?? 0}</span>
                    <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-[#64748B]" />{u.banos ?? 0}</span>
                    <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5 text-[#64748B]" />{u.parqueos ?? 0}</span>
                  </div>
                  {u.area_m2_construccion && <div className="text-xs text-[#64748B] mt-0.5">{u.area_m2_construccion} m²</div>}
                </TableCell>
                <TableCell><EstadoAdminBadge value={u.estado_administrativo} /></TableCell>
                <TableCell><EstadoComercialBadge value={u.estado_comercial} /></TableCell>
                <TableCell className="text-sm">
                  <div className="text-[#173B7A]">{u.propietario_id ? residentesMap?.get(u.propietario_id) ?? "—" : "—"}</div>
                  <div className="text-xs text-[#64748B]">{u.inquilino_id ? `Inq: ${residentesMap?.get(u.inquilino_id) ?? "—"}` : ""}</div>
                </TableCell>
                <TableCell className="text-right">
                  {u.precio_venta && <div className="text-sm font-semibold text-[#173B7A]">{fmtMoney(u.precio_venta, (u as any).moneda)}</div>}
                  {u.precio_renta && <div className="text-xs text-[#1E293B]">Renta: {fmtMoney(u.precio_renta, (u as any).moneda)}</div>}
                  {!u.precio_venta && !u.precio_renta && <span className="text-[#64748B] text-sm">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(u)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm(`¿Eliminar unidad #${u.numero}?`)) del.mutate(u.id); }} className="h-8 w-8 p-0 text-[#be185d] hover:text-[#be185d]"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
