import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Tag, Building2, LayoutGrid, Table as TableIcon, Pencil, BedDouble, Bath, Car } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstadoComercialBadge } from "@/components/unidades/EstadoBadge";
import { fmtL } from "@/lib/format";
import { useUnidades, useEdificios, type Unidad } from "@/lib/queries";
import { PropiedadCard } from "@/components/propiedades/PropiedadCard";

const loadForm = () => import("@/components/unidades/UnidadFormDialog");
const UnidadFormDialog = lazy(() => loadForm().then((m) => ({ default: m.UnidadFormDialog })));

export const Route = createFileRoute("/propiedades")({ component: PropiedadesPage });

type View = "table" | "cards";
const VIEW_KEY = "propiedades:view";


type Tipo = "todas" | "venta" | "renta";

function PropiedadesPage() {
  const { data: edificios = [] } = useEdificios();
  const { data: unidades = [], isLoading } = useUnidades();
  const [edificioId, setEdificioId] = useState("all");
  const [tipo, setTipo] = useState<Tipo>("todas");
  const [q, setQ] = useState("");
  const [habs, setHabs] = useState("any");
  const [edit, setEdit] = useState<Unidad | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>(() => {
    if (typeof window === "undefined") return "table";
    return (localStorage.getItem(VIEW_KEY) as View) || "table";
  });

  useEffect(() => { loadForm(); }, []);
  useEffect(() => { try { localStorage.setItem(VIEW_KEY, view); } catch {} }, [view]);


  const edMap = useMemo(() => new Map(edificios.map((e) => [e.id, e])), [edificios]);

  const filtered = useMemo(() => {
    return unidades.filter((u) => {
      const comercial = u.estado_comercial;
      if (comercial !== "en_venta" && comercial !== "en_renta" && comercial !== "en_venta_y_renta" && comercial !== "reservada") return false;
      if (edificioId !== "all" && u.condominio_id !== edificioId) return false;
      if (tipo === "venta" && comercial === "en_renta") return false;
      if (tipo === "renta" && comercial === "en_venta") return false;
      if (habs !== "any") {
        const n = Number(habs);
        if (habs === "4") { if ((u.habitaciones ?? 0) < 4) return false; }
        else if ((u.habitaciones ?? 0) !== n) return false;
      }
      if (q) {
        const ed = edMap.get(u.condominio_id);
        const hay = `${u.numero} ${u.tipo ?? ""} ${ed?.nombre ?? ""} ${ed?.ciudad ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [unidades, edificioId, tipo, habs, q, edMap]);

  const openEdit = async (u: Unidad) => { setEdit(u); await loadForm(); setOpen(true); };

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1500px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#2d1200]">Propiedades en Venta / Renta</h1>
            <p className="text-sm text-[#9a7060]">Catálogo comercial de unidades publicadas</p>
          </div>
          <div className="inline-flex rounded-lg border border-[#e8ddd8] bg-white p-0.5">
            <Button size="sm" variant="ghost" onClick={() => setView("table")}
              className={`h-8 px-3 ${view === "table" ? "bg-[#f5ede8] text-[#2d1200]" : "text-[#9a7060]"}`}>
              <TableIcon className="w-4 h-4 mr-1" /> Tabla
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setView("cards")}
              className={`h-8 px-3 ${view === "cards" ? "bg-[#f5ede8] text-[#2d1200]" : "text-[#9a7060]"}`}>
              <LayoutGrid className="w-4 h-4 mr-1" /> Cards
            </Button>
          </div>
        </div>


        <div className="flex flex-wrap gap-2 bg-white border border-[#e8ddd8] rounded-xl p-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a7060]" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por número, tipo, edificio…" className="pl-9" />
          </div>
          <Select value={tipo} onValueChange={(v) => setTipo(v as Tipo)}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Venta y renta</SelectItem>
              <SelectItem value="venta">Solo venta</SelectItem>
              <SelectItem value="renta">Solo renta</SelectItem>
            </SelectContent>
          </Select>
          <Select value={habs} onValueChange={setHabs}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Habitaciones</SelectItem>
              <SelectItem value="1">1 hab</SelectItem>
              <SelectItem value="2">2 hab</SelectItem>
              <SelectItem value="3">3 hab</SelectItem>
              <SelectItem value="4">4+ hab</SelectItem>
            </SelectContent>
          </Select>
          <Select value={edificioId} onValueChange={setEdificioId}>
            <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los edificios</SelectItem>
              {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center text-[#9a7060] py-12">Cargando propiedades…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed border-[#e8ddd8] rounded-2xl">
            <Tag className="w-10 h-10 mx-auto mb-3 text-[#c4a896]" />
            <p className="font-display font-semibold text-[#2d1200]">No hay propiedades publicadas</p>
            <p className="text-sm text-[#9a7060] mt-1">
              {unidades.length === 0
                ? <>Crea unidades desde <Building2 className="inline w-3.5 h-3.5" /> Edificios.</>
                : "Cambia el estado comercial de una unidad a En venta o En renta para que aparezca aquí."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#9a7060]">{filtered.length} {filtered.length === 1 ? "propiedad" : "propiedades"}</p>
            {view === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((u) => (
                  <PropiedadCard key={u.id} unidad={u} edificio={edMap.get(u.condominio_id)} onEdit={openEdit} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#e8ddd8] rounded-2xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f5ede8] hover:bg-[#f5ede8]">
                      <TableHead className="text-[#2d1200] font-semibold">Unidad</TableHead>
                      <TableHead className="text-[#2d1200] font-semibold">Edificio</TableHead>
                      <TableHead className="text-[#2d1200] font-semibold">Tipo</TableHead>
                      <TableHead className="text-[#2d1200] font-semibold">Características</TableHead>
                      <TableHead className="text-[#2d1200] font-semibold">Estado</TableHead>
                      <TableHead className="text-[#2d1200] font-semibold text-right">Venta</TableHead>
                      <TableHead className="text-[#2d1200] font-semibold text-right">Renta/mes</TableHead>
                      <TableHead className="text-right" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((u) => {
                      const ed = edMap.get(u.condominio_id);
                      return (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="font-semibold text-[#2d1200]">#{u.numero}</div>
                            <div className="text-xs text-[#9a7060]">{u.piso != null ? `Piso ${u.piso}` : "—"}</div>
                          </TableCell>
                          <TableCell className="text-sm text-[#2d1200]">
                            {ed?.nombre ?? "—"}
                            <div className="text-xs text-[#9a7060]">{ed?.ciudad ?? ""}</div>
                          </TableCell>
                          <TableCell className="capitalize text-sm">{u.tipo ?? "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3 text-xs text-[#4a2800]">
                              <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-[#9a7060]" />{u.habitaciones ?? 0}</span>
                              <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-[#9a7060]" />{u.banos ?? 0}</span>
                              <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5 text-[#9a7060]" />{u.parqueos ?? 0}</span>
                            </div>
                            {u.area_m2_construccion && <div className="text-xs text-[#9a7060] mt-0.5">{u.area_m2_construccion} m²</div>}
                          </TableCell>
                          <TableCell><EstadoComercialBadge value={u.estado_comercial} /></TableCell>
                          <TableCell className="text-right text-sm font-semibold text-[#c94f0c]">
                            {u.precio_venta ? fmtL(u.precio_venta) : <span className="text-[#9a7060] font-normal">—</span>}
                          </TableCell>
                          <TableCell className="text-right text-sm text-[#2d1200]">
                            {u.precio_renta ? fmtL(u.precio_renta) : <span className="text-[#9a7060]">—</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(u)} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>

      <Suspense fallback={null}>
        {open && edit && (
          <UnidadFormDialog open={open} onOpenChange={setOpen} edificioId={edit.condominio_id} unidad={edit} />
        )}
      </Suspense>
    </AppShell>
  );
}
