import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Trash2, Pencil, Printer, Calendar } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEdificios } from "@/lib/queries";
import { useEdificioFilter } from "@/hooks/useEdificioFilter";
import { usePuntos, useSavePunto, useDeletePunto, type PuntoRondin } from "@/lib/queries-guardia";

export const Route = createFileRoute("/accesos/puntos")({ component: PuntosPage });

function PuntosPage() {
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioId] = useEdificioFilter();
  const { data: puntos = [], isLoading } = usePuntos(edificioId);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<PuntoRondin | null>(null);
  const [print, setPrint] = useState<PuntoRondin | null>(null);
  const del = useDeletePunto();

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#0F172A]">Puntos de rondín</h1>
            <p className="text-sm text-[#64748B]">Códigos QR para puntos de control</p>
          </div>
          <div className="flex gap-2">
            <Select value={edificioId} onValueChange={setEdificioId}>
              <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los edificios</SelectItem>
                {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button asChild variant="outline"><Link to="/accesos/turnos"><Calendar className="w-4 h-4 mr-1" />Turnos</Link></Button>
            <Button onClick={() => { setEdit(null); setOpen(true); }} className="bg-[#4A154B] hover:bg-[#350d36]">
              <Plus className="w-4 h-4 mr-1" />Nuevo punto
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-sm text-[#64748B]">Cargando…</div>
        ) : puntos.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center">
            <MapPin className="w-10 h-10 mx-auto text-[#64748B] mb-2" />
            <div className="font-semibold text-[#0F172A]">Sin puntos de control</div>
            <div className="text-sm text-[#64748B] mt-1">Crea puntos (lobby, azotea, sótano…) y pega el QR impreso.</div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {puntos.map((p) => {
              const e = edificios.find((x) => x.id === p.condominio_id);
              return (
                <div key={p.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-[#0F172A]">{p.nombre}</div>
                      <div className="text-xs text-[#64748B]">{e?.nombre} · {p.ubicacion ?? "—"}</div>
                      <div className="font-mono text-xs mt-2 text-[#4A154B]">{p.qr_code}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>{p.activo ? "Activo" : "Inactivo"}</span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[#F1F5F9]">
                    <Button size="sm" variant="outline" onClick={() => setPrint(p)}><Printer className="w-4 h-4 mr-1" />Imprimir QR</Button>
                    <button onClick={() => { setEdit(p); setOpen(true); }} className="p-2 text-[#64748B] hover:text-[#4A154B]"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => confirm("¿Eliminar punto?") && del.mutate(p.id)} className="p-2 text-[#64748B] hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {open && <PuntoDialog open={open} onOpenChange={setOpen} punto={edit} defaultCondominioId={edificioId !== "all" ? edificioId : undefined} />}
      {print && <PrintDialog punto={print} onClose={() => setPrint(null)} edificio={edificios.find((e) => e.id === print.condominio_id)?.nombre} />}
    </AppShell>
  );
}

function PuntoDialog({ open, onOpenChange, punto, defaultCondominioId }: { open: boolean; onOpenChange: (v: boolean) => void; punto: PuntoRondin | null; defaultCondominioId?: string }) {
  const { data: edificios = [] } = useEdificios();
  const save = useSavePunto();
  const [condominio_id, setCondo] = useState(punto?.condominio_id ?? defaultCondominioId ?? edificios[0]?.id ?? "");
  const [nombre, setNombre] = useState(punto?.nombre ?? "");
  const [ubicacion, setUbicacion] = useState(punto?.ubicacion ?? "");
  const [orden, setOrden] = useState(punto?.orden ?? 0);
  const [activo, setActivo] = useState(punto?.activo ?? true);

  const submit = async () => {
    if (!condominio_id || !nombre.trim()) return;
    await save.mutateAsync({
      id: punto?.id,
      condominio_id,
      nombre: nombre.trim(),
      ubicacion: ubicacion || null,
      orden,
      activo,
      qr_code: punto?.qr_code,
    } as any);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{punto ? "Editar punto" : "Nuevo punto de rondín"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Edificio</Label>
            <Select value={condominio_id} onValueChange={setCondo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Lobby principal" /></div>
          <div><Label>Ubicación</Label><Input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Ej: Planta baja, junto a recepción" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Orden</Label><Input type="number" value={orden} onChange={(e) => setOrden(Number(e.target.value))} /></div>
            <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />Activo</label></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={save.isPending} className="bg-[#4A154B] hover:bg-[#350d36]">Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PrintDialog({ punto, onClose, edificio }: { punto: PuntoRondin; onClose: () => void; edificio?: string }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm print:shadow-none">
        <DialogHeader><DialogTitle>QR — {punto.nombre}</DialogTitle></DialogHeader>
        <div className="flex flex-col items-center gap-3 py-4">
          <QRCodeSVG value={punto.qr_code} size={220} />
          <div className="text-center">
            <div className="font-bold text-lg">{punto.nombre}</div>
            <div className="text-xs text-[#64748B]">{edificio} · {punto.ubicacion ?? ""}</div>
            <div className="font-mono text-xs mt-1">{punto.qr_code}</div>
          </div>
        </div>
        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={() => window.print()} className="bg-[#4A154B] hover:bg-[#350d36]"><Printer className="w-4 h-4 mr-1" />Imprimir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
