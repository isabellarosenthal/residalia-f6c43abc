import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2, BedDouble, Bath, Car } from "lucide-react";
import { EstadoAdminBadge, EstadoComercialBadge } from "./EstadoBadge";
import { fmtL } from "@/lib/format";
import { useUnidades, useDeleteUnidad, useResidentesMap, type Unidad } from "@/lib/queries";

export function UnidadesTable({ edificioId, onEdit }: { edificioId: string; onEdit: (u: Unidad) => void }) {
  const { data: unidades = [], isLoading } = useUnidades(edificioId);
  const { data: residentesMap } = useResidentesMap();
  const del = useDeleteUnidad();
  const [search, setSearch] = useState("");
  const [admin, setAdmin] = useState<string>("all");
  const [comercial, setComercial] = useState<string>("all");

  const filtered = useMemo(() => {
    return unidades.filter((u) => {
      if (search && !u.numero.toLowerCase().includes(search.toLowerCase())) return false;
      if (admin !== "all" && u.estado_administrativo !== admin) return false;
      if (comercial !== "all" && u.estado_comercial !== comercial) return false;
      return true;
    });
  }, [unidades, search, admin, comercial]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a7060]" />
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

      <div className="bg-white border border-[#e8ddd8] rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f5ede8] hover:bg-[#f5ede8]">
              <TableHead className="text-[#2d1200] font-semibold">Unidad</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Tipo</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Características</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Estado admin.</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Estado comercial</TableHead>
              <TableHead className="text-[#2d1200] font-semibold">Propietario / Inquilino</TableHead>
              <TableHead className="text-[#2d1200] font-semibold text-right">Precios</TableHead>
              <TableHead className="text-[#2d1200] font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-[#9a7060]">Cargando unidades…</TableCell></TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="py-10 text-center text-[#9a7060]">Sin unidades para los filtros aplicados.</TableCell></TableRow>
            )}
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="font-semibold text-[#2d1200]">#{u.numero}</div>
                  <div className="text-xs text-[#9a7060]">{u.piso != null ? `Piso ${u.piso}` : "—"}</div>
                </TableCell>
                <TableCell className="capitalize">{u.tipo ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 text-xs text-[#4a2800]">
                    <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-[#9a7060]" />{u.habitaciones ?? 0}</span>
                    <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-[#9a7060]" />{u.banos ?? 0}</span>
                    <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5 text-[#9a7060]" />{u.parqueos ?? 0}</span>
                  </div>
                  {u.area_m2_construccion && <div className="text-xs text-[#9a7060] mt-0.5">{u.area_m2_construccion} m²</div>}
                </TableCell>
                <TableCell><EstadoAdminBadge value={u.estado_administrativo} /></TableCell>
                <TableCell><EstadoComercialBadge value={u.estado_comercial} /></TableCell>
                <TableCell className="text-sm">
                  <div className="text-[#2d1200]">{u.propietario_id ? residentesMap?.get(u.propietario_id) ?? "—" : "—"}</div>
                  <div className="text-xs text-[#9a7060]">{u.inquilino_id ? `Inq: ${residentesMap?.get(u.inquilino_id) ?? "—"}` : ""}</div>
                </TableCell>
                <TableCell className="text-right">
                  {u.precio_venta && <div className="text-sm font-semibold text-[#c94f0c]">{fmtL(u.precio_venta)}</div>}
                  {u.precio_renta && <div className="text-xs text-[#4a2800]">Renta: {fmtL(u.precio_renta)}</div>}
                  {!u.precio_venta && !u.precio_renta && <span className="text-[#9a7060] text-sm">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(u)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { if (confirm(`¿Eliminar unidad #${u.numero}?`)) del.mutate(u.id); }} className="h-8 w-8 p-0 text-[#c0392b] hover:text-[#c0392b]"><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
