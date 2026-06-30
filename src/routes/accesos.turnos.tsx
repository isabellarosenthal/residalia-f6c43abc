import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, Trash2, Pencil, MapPin, ShieldCheck } from "lucide-react";
import { useEdificios } from "@/lib/queries";
import { useEdificioFilter } from "@/hooks/useEdificioFilter";
import {
  useTurnos, useSaveTurno, useDeleteTurno, useGuardiasDeCondominio, type Turno,
} from "@/lib/queries-guardia";

export const Route = createFileRoute("/accesos/turnos")({ component: TurnosPage });

const estadoColor: Record<string, string> = {
  programado: "bg-blue-100 text-blue-800",
  en_curso: "bg-green-100 text-green-800",
  completado: "bg-gray-100 text-gray-700",
  ausente: "bg-red-100 text-red-800",
  cancelado: "bg-gray-100 text-gray-500",
};

function TurnosPage() {
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioId] = useEdificioFilter();
  const today = new Date().toISOString().slice(0, 10);
  const in14 = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const { data: turnos = [], isLoading } = useTurnos(edificioId, today, in14);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Turno | null>(null);
  const del = useDeleteTurno();

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#0F172A]">Turnos de guardia</h1>
            <p className="text-sm text-[#64748B]">Programación de próximos 14 días</p>
          </div>
          <div className="flex gap-2">
            <Select value={edificioId} onValueChange={setEdificioId}>
              <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los edificios</SelectItem>
                {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button asChild variant="outline"><Link to="/accesos/puntos"><MapPin className="w-4 h-4 mr-1" />Puntos de rondín</Link></Button>
            <Button asChild variant="outline"><Link to="/accesos"><ShieldCheck className="w-4 h-4 mr-1" />Accesos</Link></Button>
            <Button onClick={() => { setEdit(null); setOpen(true); }} className="bg-[#4A154B] hover:bg-[#350d36]">
              <Plus className="w-4 h-4 mr-1" />Programar turno
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-sm text-[#64748B]">Cargando…</div>
        ) : turnos.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center">
            <Calendar className="w-10 h-10 mx-auto text-[#64748B] mb-2" />
            <div className="font-semibold text-[#0F172A]">Sin turnos programados</div>
            <div className="text-sm text-[#64748B] mt-1">Programa el primer turno para empezar.</div>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] text-[#64748B] text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2">Fecha</th>
                  <th className="text-left px-4 py-2">Horario</th>
                  <th className="text-left px-4 py-2">Edificio</th>
                  <th className="text-left px-4 py-2">Guardia</th>
                  <th className="text-left px-4 py-2">Estado</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {turnos.map((t) => {
                  const e = edificios.find((x) => x.id === t.condominio_id);
                  return (
                    <tr key={t.id} className="border-t border-[#E2E8F0]">
                      <td className="px-4 py-2">{t.fecha}</td>
                      <td className="px-4 py-2 font-mono text-xs">{t.hora_inicio?.slice(0, 5)} – {t.hora_fin?.slice(0, 5)}</td>
                      <td className="px-4 py-2">{e?.nombre ?? "—"}</td>
                      <td className="px-4 py-2 text-xs font-mono">{t.guardia_id.slice(0, 8)}…</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estadoColor[t.estado] ?? ""}`}>{t.estado}</span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => { setEdit(t); setOpen(true); }} className="p-1 text-[#64748B] hover:text-[#4A154B]"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => confirm("¿Eliminar turno?") && del.mutate(t.id)} className="p-1 text-[#64748B] hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && <TurnoDialog open={open} onOpenChange={setOpen} turno={edit} defaultCondominioId={edificioId !== "all" ? edificioId : undefined} />}
    </AppShell>
  );
}

function TurnoDialog({ open, onOpenChange, turno, defaultCondominioId }: { open: boolean; onOpenChange: (v: boolean) => void; turno: Turno | null; defaultCondominioId?: string }) {
  const { data: edificios = [] } = useEdificios();
  const save = useSaveTurno();
  const [condominio_id, setCondo] = useState(turno?.condominio_id ?? defaultCondominioId ?? edificios[0]?.id ?? "");
  const [guardia_id, setGuardia] = useState(turno?.guardia_id ?? "");
  const [fecha, setFecha] = useState(turno?.fecha ?? new Date().toISOString().slice(0, 10));
  const [hora_inicio, setHi] = useState((turno?.hora_inicio ?? "08:00:00").slice(0, 5));
  const [hora_fin, setHf] = useState((turno?.hora_fin ?? "16:00:00").slice(0, 5));
  const [estado, setEstado] = useState<string>(turno?.estado ?? "programado");
  const [notas, setNotas] = useState(turno?.notas ?? "");
  const { data: guardias = [] } = useGuardiasDeCondominio(condominio_id);

  const submit = async () => {
    if (!condominio_id || !guardia_id) return;
    await save.mutateAsync({
      id: turno?.id,
      condominio_id,
      guardia_id,
      fecha,
      hora_inicio: `${hora_inicio}:00`,
      hora_fin: `${hora_fin}:00`,
      estado,
      notas: notas || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{turno ? "Editar turno" : "Programar turno"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Edificio</Label>
            <Select value={condominio_id} onValueChange={setCondo}>
              <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent>{edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Guardia</Label>
            <Select value={guardia_id} onValueChange={setGuardia}>
              <SelectTrigger><SelectValue placeholder={guardias.length ? "Selecciona" : "Sin guardias asignados"} /></SelectTrigger>
              <SelectContent>
                {guardias.map((g: any) => <SelectItem key={g.id} value={g.id}>{g.full_name ?? g.email}</SelectItem>)}
              </SelectContent>
            </Select>
            {guardias.length === 0 && condominio_id && (
              <p className="text-xs text-[#64748B] mt-1">Asigna un usuario con rol "Guardia" al edificio primero.</p>
            )}
          </div>
          <div><Label>Fecha</Label><Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Desde</Label><Input type="time" value={hora_inicio} onChange={(e) => setHi(e.target.value)} /></div>
            <div><Label>Hasta</Label><Input type="time" value={hora_fin} onChange={(e) => setHf(e.target.value)} /></div>
          </div>
          {turno && (
            <div>
              <Label>Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="programado">Programado</SelectItem>
                  <SelectItem value="en_curso">En curso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div><Label>Notas</Label><Input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Opcional" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={save.isPending || !guardia_id} className="bg-[#4A154B] hover:bg-[#350d36]">Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
