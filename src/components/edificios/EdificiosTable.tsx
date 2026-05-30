import { useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { Pencil, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-pentos";
import { fmtL } from "@/lib/format";
import { type Condominio } from "@/lib/queries";
import type { EdificioStats } from "./EdificioCard";

const EdificioFormDialog = lazy(() =>
  import("./EdificioFormDialog").then((m) => ({ default: m.EdificioFormDialog }))
);

type StatsExt = EdificioStats & { disponibles: number };

function Row({ edificio, stats, onEdit }: { edificio: Condominio; stats?: StatsExt; onEdit: () => void }) {
  const navigate = useNavigate();
  const total = stats?.total ?? 0;
  const ocupadas = stats?.ocupadas ?? 0;
  const disponibles = stats?.disponibles ?? 0;
  const enVenta = stats?.enVenta ?? 0;
  const enRenta = stats?.enRenta ?? 0;
  const ocupacion = total > 0 ? Math.round((ocupadas / total) * 100) : 0;
  const go = () => navigate({ to: "/edificios/$edificioId", params: { edificioId: edificio.id } });
  return (
    <TableRow onClick={go} className="cursor-pointer hover:bg-[#faf6f3]">
      <TableCell>
        <div className="font-semibold text-[#374151]">{edificio.nombre}</div>
        <div className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" />
          {edificio.ciudad ?? "—"}{edificio.departamento ? `, ${edificio.departamento}` : ""}
        </div>
      </TableCell>
      <TableCell className="capitalize text-sm text-[#1E293B]">{edificio.tipo}</TableCell>
      <TableCell className="text-sm">{total}</TableCell>
      <TableCell className="text-sm">{ocupacion}% <span className="text-xs text-[#64748B]">({disponibles} libres)</span></TableCell>
      <TableCell className="text-sm">{enVenta} / {enRenta}</TableCell>
      <TableCell className="text-sm">{fmtL(edificio.cuota_base ?? 0)}</TableCell>
      <TableCell>{edificio.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="neutral">Inactivo</Badge>}</TableCell>
      <TableCell className="text-right">
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="h-8 w-8 p-0"><Pencil className="w-4 h-4" /></Button>
      </TableCell>
    </TableRow>
  );
}

export function EdificiosTable({ edificios, statsMap }: { edificios: Condominio[]; statsMap?: Map<string, StatsExt> }) {
  const [edit, setEdit] = useState<Condominio | null>(null);
  return (
    <>
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F8FAFC] hover:bg-[#F8FAFC]">
              <TableHead className="text-[#374151] font-semibold">Edificio</TableHead>
              <TableHead className="text-[#374151] font-semibold">Tipo</TableHead>
              <TableHead className="text-[#374151] font-semibold">Unidades</TableHead>
              <TableHead className="text-[#374151] font-semibold">Ocupación</TableHead>
              <TableHead className="text-[#374151] font-semibold">Venta / Renta</TableHead>
              <TableHead className="text-[#374151] font-semibold">Cuota base</TableHead>
              <TableHead className="text-[#374151] font-semibold">Estado</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {edificios.map((e) => <Row key={e.id} edificio={e} stats={statsMap?.get(e.id)} onEdit={() => setEdit(e)} />)}
          </TableBody>
        </Table>
      </div>
      {edit && (
        <Suspense fallback={null}>
          <EdificioFormDialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)} edificio={edit} />
        </Suspense>
      )}
    </>
  );
}
