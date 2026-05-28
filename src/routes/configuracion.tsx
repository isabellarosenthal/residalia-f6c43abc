import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { User as UserIcon, Building2, Users, Shield, Save, Trash2, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui-pentos";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, type AppRole } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useEdificios, useSaveEdificio } from "@/lib/queries";

export const Route = createFileRoute("/configuracion")({ component: ConfiguracionPage });

const ROLES: { value: AppRole; label: string }[] = [
  { value: "super_admin", label: "Super admin" },
  { value: "admin_condominio", label: "Admin condominio" },
  { value: "junta_directiva", label: "Junta directiva" },
  { value: "agente_inmobiliario", label: "Agente inmobiliario" },
  { value: "gerente_crm", label: "Gerente CRM" },
  { value: "guardia", label: "Guardia" },
];

const TENANT_ROLES = ROLES.filter(r => r.value !== "super_admin");

function ConfiguracionPage() {
  const { role } = useAuth();
  const { data: edificios = [] } = useEdificios();
  const isSuper = role === "super_admin";
  const canManage = isSuper || edificios.length > 0;

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1100px] mx-auto">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-[#2d1200]">Configuración</h1>
          <p className="text-sm text-[#9a7060]">Perfil, edificios, usuarios y preferencias</p>
        </div>

        <Tabs defaultValue="perfil">
          <TabsList className="bg-[#f5ede8]">
            <TabsTrigger value="perfil"><UserIcon className="w-4 h-4 mr-1" />Perfil</TabsTrigger>
            <TabsTrigger value="edificios"><Building2 className="w-4 h-4 mr-1" />Edificios</TabsTrigger>
            <TabsTrigger value="usuarios"><Users className="w-4 h-4 mr-1" />Usuarios</TabsTrigger>
            <TabsTrigger value="seguridad"><Shield className="w-4 h-4 mr-1" />Seguridad</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="pt-4"><PerfilTab /></TabsContent>
          <TabsContent value="edificios" className="pt-4"><EdificiosTab /></TabsContent>
          <TabsContent value="usuarios" className="pt-4">
            {isSuper ? <UsuariosTab /> : canManage ? <TenantUsuariosTab edificios={edificios} /> : <p className="text-sm text-[#9a7060] p-4">No tienes edificios asignados.</p>}
          </TabsContent>
          <TabsContent value="seguridad" className="pt-4"><SeguridadTab /></TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}


function PerfilTab() {
  const { user, profile, role } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(profile?.full_name ?? "");
    supabase.from("profiles").select("phone").eq("id", user.id).maybeSingle().then(({ data }) => {
      setPhone(data?.phone ?? "");
    });
  }, [user, profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone: phone || null }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil actualizado");
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Nombre completo</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user?.email ?? ""} disabled />
        </div>
        <div>
          <Label>Teléfono</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label>Rol</Label>
          <Input value={role ?? ""} disabled />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-[#c94f0c] hover:bg-[#a33d08]">
          <Save className="w-4 h-4 mr-1" />Guardar
        </Button>
      </div>
    </Card>
  );
}

function EdificiosTab() {
  const { data: edificios = [] } = useEdificios();
  const save = useSaveEdificio();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", cuota_base: 0, moneda: "L" });

  const startEdit = (id: string) => {
    const e = edificios.find(x => x.id === id);
    if (!e) return;
    setEditing(id);
    setForm({ nombre: e.nombre, cuota_base: Number(e.cuota_base ?? 0), moneda: e.moneda });
  };

  return (
    <div className="space-y-3">
      {edificios.map(e => (
        <Card key={e.id} className="p-4">
          {editing === e.id ? (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                <div><Label>Nombre</Label><Input value={form.nombre} onChange={(ev) => setForm({ ...form, nombre: ev.target.value })} /></div>
                <div><Label>Cuota base</Label><Input type="number" value={form.cuota_base} onChange={(ev) => setForm({ ...form, cuota_base: Number(ev.target.value) })} /></div>
                <div><Label>Moneda</Label><Input value={form.moneda} onChange={(ev) => setForm({ ...form, moneda: ev.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                <Button className="bg-[#c94f0c] hover:bg-[#a33d08]" onClick={async () => {
                  await save.mutateAsync({ id: e.id, ...form } as any);
                  setEditing(null);
                }}>Guardar</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display font-bold text-[#2d1200]">{e.nombre}</div>
                <div className="text-sm text-[#9a7060]">Cuota base: {e.moneda} {Number(e.cuota_base ?? 0).toLocaleString()} · {e.total_unidades ?? 0} unidades</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => startEdit(e.id)}>Editar</Button>
            </div>
          )}
        </Card>
      ))}
      {edificios.length === 0 && <p className="text-sm text-[#9a7060]">No hay edificios. Créalos desde el módulo Edificios.</p>}
    </div>
  );
}

type UserRow = { id: string; full_name: string; email: string; role: AppRole | null };

function UsuariosTab() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState({ email: "", role: "admin_condominio" as AppRole });

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,email"),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    const map = new Map((roles ?? []).map(r => [r.user_id, r.role as AppRole]));
    setRows((profiles ?? []).map(p => ({ ...p, role: map.get(p.id) ?? null })));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const updateRole = async (userId: string, newRole: AppRole) => {
    const { error } = await supabase.from("user_roles").upsert({ user_id: userId, role: newRole }, { onConflict: "user_id" });
    if (error) toast.error(error.message);
    else { toast.success("Rol actualizado"); void load(); }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="border border-dashed border-[#e8ddd8] rounded-xl p-4 bg-[#fffaf5]">
        <div className="text-sm font-medium text-[#2d1200] mb-2">Asignar rol por email</div>
        <p className="text-xs text-[#9a7060] mb-3">El usuario debe haberse registrado primero en /login</p>
        <div className="flex flex-wrap gap-2">
          <Input className="flex-1 min-w-[220px]" placeholder="email@ejemplo.com" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
          <Select value={invite.role} onValueChange={(v) => setInvite({ ...invite, role: v as AppRole })}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>{ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button className="bg-[#c94f0c] hover:bg-[#a33d08]" onClick={async () => {
            const { data, error } = await supabase.from("profiles").select("id").eq("email", invite.email).maybeSingle();
            if (error || !data) return toast.error("Usuario no encontrado. Debe registrarse primero.");
            await updateRole(data.id, invite.role);
            setInvite({ email: "", role: "admin_condominio" });
          }}><Plus className="w-4 h-4 mr-1" />Asignar</Button>
        </div>
      </div>

      {loading ? <p className="text-sm text-[#9a7060]">Cargando…</p> : (
        <div className="divide-y divide-[#f0e6e0]">
          {rows.map(r => (
            <div key={r.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-[#2d1200]">{r.full_name}</div>
                <div className="text-xs text-[#9a7060]">{r.email}</div>
              </div>
              <Select value={r.role ?? ""} onValueChange={(v) => updateRole(r.id, v as AppRole)}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Sin rol" /></SelectTrigger>
                <SelectContent>{ROLES.map(rr => <SelectItem key={rr.value} value={rr.value}>{rr.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SeguridadTab() {
  const { user } = useAuth();
  const [pwd, setPwd] = useState("");
  const [saving, setSaving] = useState(false);

  const change = async () => {
    if (pwd.length < 8) return toast.error("Mínimo 8 caracteres");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Contraseña actualizada"); setPwd(""); }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-3">
        <h3 className="font-display font-bold text-lg text-[#2d1200]">Cambiar contraseña</h3>
        <div className="flex gap-2">
          <Input type="password" placeholder="Nueva contraseña" value={pwd} onChange={(e) => setPwd(e.target.value)} className="max-w-sm" />
          <Button onClick={change} disabled={saving} className="bg-[#c94f0c] hover:bg-[#a33d08]"><Save className="w-4 h-4 mr-1" />Cambiar</Button>
        </div>
      </Card>
      <Card className="p-6 space-y-3 border-[#fbd9d0]">
        <h3 className="font-display font-bold text-lg text-[#c0392b]">Zona peligrosa</h3>
        <p className="text-sm text-[#9a7060]">Cerrar sesión en este dispositivo.</p>
        <Button variant="outline" className="border-[#c0392b] text-[#c0392b] hover:bg-[#fbeae6]" onClick={async () => {
          await supabase.auth.signOut();
          toast.success("Sesión cerrada");
        }}><Trash2 className="w-4 h-4 mr-1" />Cerrar sesión</Button>
        <div className="text-xs text-[#9a7060] pt-2">ID de usuario: <code className="bg-[#f5ede8] px-2 py-0.5 rounded">{user?.id}</code></div>
      </Card>
    </div>
  );
}
