import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui-pentos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, User, Car, Wallet, Mail, Phone, IdCard } from "lucide-react";
import {
  usePersonasAutorizadas, useSavePersonaAutorizada, useDeletePersonaAutorizada,
  useVehiculos, useSaveVehiculo, useDeleteVehiculo,
  useCobrosDeResidente, useEdificios, useUnidades,
  type Residente,
} from "@/lib/queries";
import { fmtL, fmtDate } from "@/lib/format";
import { ResidenteForm } from "./ResidenteFormDialog";

export function ResidenteDetailDialog({
  open, onOpenChange, residente, defaultTab = "datos",
}: { open: boolean; onOpenChange: (v: boolean) => void; residente: Residente | null; defaultTab?: string }) {
  if (!residente) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#0F172A]">
            {residente.nombre} {residente.apellido}
          </DialogTitle>
        </DialogHeader>
        <DetailBody residente={residente} defaultTab={defaultTab} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function DetailBody({ residente, defaultTab, onClose }: { residente: Residente; defaultTab: string; onClose: () => void }) {
  const { data: edificios = [] } = useEdificios();
  const { data: unidades = [] } = useUnidades(residente.condominio_id);
  const edif = edificios.find((e) => e.id === residente.condominio_id);
  const uni = unidades.find((u) => u.id === residente.unidad_id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center text-sm text-[#1E293B] bg-[#F8FAFC] rounded-lg p-3">
        <Badge variant={residente.tipo === "propietario" ? "venta" : "renta"}>{residente.tipo}</Badge>
        {residente.activo ? <Badge variant="success">Activo</Badge> : <Badge variant="neutral">Inactivo</Badge>}
        <span className="text-[#64748B]">{edif?.nombre ?? "—"} {uni ? `· #${uni.numero}` : ""}</span>
        {residente.telefono && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{residente.telefono}</span>}
        {residente.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{residente.email}</span>}
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="datos"><IdCard className="w-3.5 h-3.5 mr-1" />Datos</TabsTrigger>
          <TabsTrigger value="personas"><User className="w-3.5 h-3.5 mr-1" />Personas autorizadas</TabsTrigger>
          <TabsTrigger value="vehiculos"><Car className="w-3.5 h-3.5 mr-1" />Vehículos</TabsTrigger>
          <TabsTrigger value="cuenta"><Wallet className="w-3.5 h-3.5 mr-1" />Estado de cuenta</TabsTrigger>
        </TabsList>
        <TabsContent value="datos" className="mt-3"><ResidenteForm residente={residente} onSaved={onClose} /></TabsContent>
        <TabsContent value="personas" className="mt-3"><PersonasTab residenteId={residente.id} /></TabsContent>
        <TabsContent value="vehiculos" className="mt-3"><VehiculosTab residenteId={residente.id} /></TabsContent>
        <TabsContent value="cuenta" className="mt-3"><CuentaTab residenteId={residente.id} /></TabsContent>
      </Tabs>
    </div>
  );
}

function PersonasTab({ residenteId }: { residenteId: string }) {
  const { data: personas = [], isLoading } = usePersonasAutorizadas(residenteId);
  const save = useSavePersonaAutorizada();
  const del = useDeletePersonaAutorizada();
  const [nombre, setNombre] = useState("");
  const [relacion, setRelacion] = useState("");
  const [tipo, setTipo] = useState("permanente");

  const add = async () => {
    if (!nombre.trim()) return;
    await save.mutateAsync({ residente_id: residenteId, nombre: nombre.trim(), relacion: relacion || null, tipo_acceso: tipo });
    setNombre(""); setRelacion("");
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_160px_auto] gap-2 items-end border border-[#E2E8F0] rounded-lg p-3 bg-[#fdfaf7]">
        <div><Label className="text-xs">Nombre</Label><Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" /></div>
        <div><Label className="text-xs">Relación</Label><Input value={relacion} onChange={(e) => setRelacion(e.target.value)} placeholder="Familiar, empleado…" /></div>
        <div>
          <Label className="text-xs">Tipo</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="permanente">Permanente</SelectItem>
              <SelectItem value="temporal">Temporal</SelectItem>
              <SelectItem value="servicio">Servicio</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={add} disabled={!nombre.trim() || save.isPending} className="bg-[#4A154B] hover:bg-[#350d36]">
          <Plus className="w-4 h-4 mr-1" />Agregar
        </Button>
      </div>

      {isLoading ? <p className="text-sm text-[#64748B]">Cargando…</p> : personas.length === 0 ? (
        <p className="text-sm text-[#64748B] text-center py-4">Sin personas autorizadas.</p>
      ) : (
        <div className="space-y-1">
          {personas.map((p) => (
            <div key={p.id} className="flex items-center justify-between border border-[#E2E8F0] rounded-lg px-3 py-2">
              <div>
                <div className="text-sm font-medium text-[#4A154B]">{p.nombre}</div>
                <div className="text-xs text-[#64748B]">{p.relacion ?? "—"} · {p.tipo_acceso ?? "permanente"}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => del.mutate({ id: p.id, residenteId })} className="h-8 w-8 p-0 text-[#be185d]"><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VehiculosTab({ residenteId }: { residenteId: string }) {
  const { data: vehiculos = [], isLoading } = useVehiculos(residenteId);
  const save = useSaveVehiculo();
  const del = useDeleteVehiculo();
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [color, setColor] = useState("");

  const add = async () => {
    if (!placa.trim()) return;
    await save.mutateAsync({ residente_id: residenteId, placa: placa.trim().toUpperCase(), marca: marca || null, modelo: modelo || null, color: color || null });
    setPlaca(""); setMarca(""); setModelo(""); setColor("");
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-[120px_1fr_1fr_120px_auto] gap-2 items-end border border-[#E2E8F0] rounded-lg p-3 bg-[#fdfaf7]">
        <div><Label className="text-xs">Placa *</Label><Input value={placa} onChange={(e) => setPlaca(e.target.value)} placeholder="ABC-123" /></div>
        <div><Label className="text-xs">Marca</Label><Input value={marca} onChange={(e) => setMarca(e.target.value)} /></div>
        <div><Label className="text-xs">Modelo</Label><Input value={modelo} onChange={(e) => setModelo(e.target.value)} /></div>
        <div><Label className="text-xs">Color</Label><Input value={color} onChange={(e) => setColor(e.target.value)} /></div>
        <Button onClick={add} disabled={!placa.trim() || save.isPending} className="bg-[#4A154B] hover:bg-[#350d36]"><Plus className="w-4 h-4 mr-1" />Agregar</Button>
      </div>

      {isLoading ? <p className="text-sm text-[#64748B]">Cargando…</p> : vehiculos.length === 0 ? (
        <p className="text-sm text-[#64748B] text-center py-4">Sin vehículos registrados.</p>
      ) : (
        <div className="space-y-1">
          {vehiculos.map((v) => (
            <div key={v.id} className="flex items-center justify-between border border-[#E2E8F0] rounded-lg px-3 py-2">
              <div className="flex items-center gap-3">
                <Badge variant="neutral">{v.placa}</Badge>
                <div className="text-sm text-[#4A154B]">
                  {[v.marca, v.modelo].filter(Boolean).join(" ") || "—"}
                  {v.color && <span className="text-xs text-[#64748B]"> · {v.color}</span>}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => del.mutate({ id: v.id, residenteId })} className="h-8 w-8 p-0 text-[#be185d]"><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CuentaTab({ residenteId }: { residenteId: string }) {
  const { data: cobros = [], isLoading } = useCobrosDeResidente(residenteId);
  const pagado = cobros.filter((c) => c.estado === "pagado").reduce((s, c) => s + Number(c.monto), 0);
  const pendiente = cobros.filter((c) => c.estado !== "pagado").reduce((s, c) => s + Number(c.monto), 0);
  const vencidos = cobros.filter((c) => c.estado !== "pagado" && new Date(c.fecha_vencimiento) < new Date());

  if (isLoading) return <p className="text-sm text-[#64748B]">Cargando…</p>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="border border-[#E2E8F0] rounded-lg p-3"><div className="text-xs text-[#64748B]">Pagado</div><div className="font-semibold text-[#4A154B]">{fmtL(pagado)}</div></div>
        <div className="border border-[#E2E8F0] rounded-lg p-3"><div className="text-xs text-[#64748B]">Pendiente</div><div className="font-semibold text-[#4A154B]">{fmtL(pendiente)}</div></div>
        <div className="border border-[#E2E8F0] rounded-lg p-3"><div className="text-xs text-[#64748B]">Vencidos</div><div className="font-semibold text-[#be185d]">{vencidos.length}</div></div>
      </div>
      {cobros.length === 0 ? (
        <p className="text-sm text-[#64748B] text-center py-4">Sin cobros asociados.</p>
      ) : (
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {cobros.map((c) => {
            const vencido = c.estado !== "pagado" && new Date(c.fecha_vencimiento) < new Date();
            return (
              <div key={c.id} className="flex items-center justify-between border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm">
                <div>
                  <div className="font-medium text-[#4A154B]">{c.concepto}</div>
                  <div className="text-xs text-[#64748B]">Vence {fmtDate(c.fecha_vencimiento)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#4A154B]">{fmtL(Number(c.monto))}</span>
                  {c.estado === "pagado" ? <Badge variant="success">Pagado</Badge>
                    : vencido ? <Badge variant="danger">Vencido</Badge>
                    : <Badge variant="warning">Pendiente</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
