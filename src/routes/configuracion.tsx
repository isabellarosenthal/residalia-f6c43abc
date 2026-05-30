import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import toast from "react-hot-toast";
import { User as UserIcon, Building2, Users, Shield, Save, Trash2, Plus, Home, Crown } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui-pentos";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, type AppRole } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useEdificios, useSaveEdificio } from "@/lib/queries";
import { getMyPlanUsage } from "@/lib/plan-usage.functions";

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
          <p className="text-sm text-[#9a7060]">Perfil, edificios, usuarios, residentes y preferencias</p>
        </div>

        <Tabs defaultValue="perfil">
          <TabsList className="bg-[#f5ede8]">
            <TabsTrigger value="perfil"><UserIcon className="w-4 h-4 mr-1" />Perfil</TabsTrigger>
            <TabsTrigger value="plan"><Crown className="w-4 h-4 mr-1" />Mi Plan</TabsTrigger>
            <TabsTrigger value="edificios"><Building2 className="w-4 h-4 mr-1" />Edificios</TabsTrigger>
            <TabsTrigger value="usuarios"><Users className="w-4 h-4 mr-1" />Usuarios</TabsTrigger>
            <TabsTrigger value="residentes"><Home className="w-4 h-4 mr-1" />Residentes</TabsTrigger>
            <TabsTrigger value="seguridad"><Shield className="w-4 h-4 mr-1" />Seguridad</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="pt-4"><PerfilTab /></TabsContent>
          <TabsContent value="plan" className="pt-4"><MiPlanTab /></TabsContent>
          <TabsContent value="edificios" className="pt-4"><EdificiosTab /></TabsContent>
          <TabsContent value="usuarios" className="pt-4">
            {isSuper ? <UsuariosTab /> : canManage ? <TenantUsuariosTab edificios={edificios} /> : <p className="text-sm text-[#9a7060] p-4">No tienes edificios asignados.</p>}
          </TabsContent>
          <TabsContent value="residentes" className="pt-4"><ResidentesTab /></TabsContent>
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
      <PlanLimitsBanner focus="edificios" />
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
    setRows((profiles ?? []).map(p => ({ ...p, role: map.get(p.id) ?? null })).filter(r => r.role !== "residente"));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const updateRole = async (userId: string, newRole: AppRole) => {
    const { error } = await supabase.from("user_roles").upsert({ user_id: userId, role: newRole }, { onConflict: "user_id" });
    if (error) toast.error(error.message);
    else { toast.success("Rol actualizado"); void load(); }
  };

  return (
    <>
    <PlanLimitsBanner focus="admins" />
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
    </>
  );
}

type Edif = { id: string; nombre: string };

function TenantUsuariosTab({ edificios }: { edificios: Edif[] }) {
  const [condoId, setCondoId] = useState<string>(edificios[0]?.id ?? "");
  const [invite, setInvite] = useState({ email: "", role: "guardia" as AppRole });
  const [members, setMembers] = useState<{ id: string; full_name: string; email: string; role: AppRole | null }[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async (cid: string) => {
    if (!cid) return;
    setLoading(true);
    const { data: mem } = await supabase.from("condominio_members").select("user_id").eq("condominio_id", cid);
    const ids = (mem ?? []).map((m: any) => m.user_id);
    if (ids.length === 0) { setMembers([]); setLoading(false); return; }
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,email").in("id", ids),
      supabase.from("user_roles").select("user_id,role").in("user_id", ids),
    ]);
    const rmap = new Map((roles ?? []).map((r: any) => [r.user_id, r.role as AppRole]));
    setMembers((profiles ?? []).map((p: any) => ({ ...p, role: rmap.get(p.id) ?? null })));
    setLoading(false);
  };

  useEffect(() => { void load(condoId); }, [condoId]);

  const assign = async () => {
    if (!invite.email || !condoId) return;
    const { error } = await supabase.rpc("assign_user_to_condominio", {
      _email: invite.email.trim(), _role: invite.role, _condo_id: condoId,
    });
    if (error) return toast.error(error.message);
    toast.success("Usuario asignado");
    setInvite({ email: "", role: "guardia" });
    void load(condoId);
  };

  const remove = async (userId: string) => {
    const { error } = await supabase.rpc("remove_user_from_condominio", { _user_id: userId, _condo_id: condoId });
    if (error) return toast.error(error.message);
    toast.success("Usuario removido del edificio");
    void load(condoId);
  };

  return (
    <Card className="p-5 space-y-4">
      {edificios.length > 1 && (
        <div className="flex items-center gap-2">
          <Label className="whitespace-nowrap">Edificio</Label>
          <Select value={condoId} onValueChange={setCondoId}>
            <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
            <SelectContent>{edificios.map(e => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      <div className="border border-dashed border-[#e8ddd8] rounded-xl p-4 bg-[#fffaf5]">
        <div className="text-sm font-medium text-[#2d1200] mb-2">Invitar staff o guardia</div>
        <p className="text-xs text-[#9a7060] mb-3">El usuario debe registrarse primero en /login con su email. Luego asígnale aquí su rol y edificio.</p>
        <div className="flex flex-wrap gap-2">
          <Input className="flex-1 min-w-[220px]" placeholder="email@ejemplo.com" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
          <Select value={invite.role} onValueChange={(v) => setInvite({ ...invite, role: v as AppRole })}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>{TENANT_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button className="bg-[#c94f0c] hover:bg-[#a33d08]" onClick={assign}><Plus className="w-4 h-4 mr-1" />Asignar</Button>
        </div>
      </div>

      <div className="text-xs text-[#9a7060]">Para invitar residentes, usa el módulo <a className="underline" href="/residentes">Residentes</a>.</div>

      {loading ? <p className="text-sm text-[#9a7060]">Cargando…</p> : members.length === 0 ? (
        <p className="text-sm text-[#9a7060]">Sin miembros en este edificio.</p>
      ) : (
        <div className="divide-y divide-[#f0e6e0]">
          {members.map(m => (
            <div key={m.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-[#2d1200]">{m.full_name}</div>
                <div className="text-xs text-[#9a7060]">{m.email} · {m.role ?? "sin rol"}</div>
              </div>
              <Button variant="outline" size="sm" className="text-[#c0392b] border-[#fbd9d0] hover:bg-[#fbeae6]" onClick={() => remove(m.id)}>
                <Trash2 className="w-3 h-3 mr-1" />Quitar
              </Button>
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

function ResidentesTab() {
  const { role } = useAuth();
  const isSuper = role === "super_admin";
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: residentes } = await supabase
        .from("residentes")
        .select("id, nombre, apellido, email, telefono, fecha_ingreso, created_at, user_id, activo, condominio_id, condominios(nombre)")
        .order("created_at", { ascending: false });
      const userIds = (residentes ?? []).map(r => r.user_id).filter(Boolean) as string[];
      let profilesMap: Record<string, { created_at: string }> = {};
      if (userIds.length) {
        const { data: profs } = await supabase.from("profiles").select("id, created_at").in("id", userIds);
        profilesMap = Object.fromEntries((profs ?? []).map(p => [p.id, { created_at: p.created_at }]));
      }
      setRows((residentes ?? []).map(r => ({
        ...r,
        cuenta_creada: r.user_id ? profilesMap[r.user_id]?.created_at ?? null : null,
        condominio_nombre: (r as any).condominios?.nombre ?? "—",
      })));
      setLoading(false);
    })();
  }, []);

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString("es-HN", { year: "numeric", month: "short", day: "numeric" }) : "—";
  const filtered = rows.filter(r => {
    const s = `${r.nombre} ${r.apellido} ${r.email ?? ""} ${r.condominio_nombre}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-lg text-[#2d1200]">Residentes</h3>
          <p className="text-sm text-[#9a7060]">{isSuper ? "Todos los residentes de la plataforma" : "Residentes de tus edificios"} · Fecha de ingreso y registro en PropCloud</p>
        </div>
        <Input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>

      {loading ? (
        <p className="text-sm text-[#9a7060]">Cargando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#9a7060]">No hay residentes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[#9a7060] border-b border-[#f0e3da]">
              <tr>
                <th className="py-2 pr-3">Residente</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Edificio</th>
                <th className="py-2 pr-3">Se unió</th>
                <th className="py-2 pr-3">Cuenta en PropCloud</th>
                <th className="py-2 pr-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-[#f5ede8]">
                  <td className="py-2 pr-3 font-medium text-[#2d1200]">{r.nombre} {r.apellido}</td>
                  <td className="py-2 pr-3 text-[#9a7060]">{r.email ?? "—"}</td>
                  <td className="py-2 pr-3 text-[#9a7060]">{r.condominio_nombre}</td>
                  <td className="py-2 pr-3 text-[#9a7060]">{fmt(r.fecha_ingreso)}</td>
                  <td className="py-2 pr-3 text-[#9a7060]">
                    {r.cuenta_creada ? fmt(r.cuenta_creada) : <span className="text-[#c0392b]">Sin cuenta</span>}
                  </td>
                  <td className="py-2 pr-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${r.activo ? "bg-[#e6f4ea] text-[#1e6b3a]" : "bg-[#fbeae6] text-[#c0392b]"}`}>
                      {r.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function usePlanUsage() {
  const fetchUsage = useServerFn(getMyPlanUsage);
  return useQuery({ queryKey: ["plan-usage"], queryFn: () => fetchUsage() });
}

function PlanLimitsBanner({ focus }: { focus: "edificios" | "unidades" | "admins" | "all" }) {
  const { data, isLoading } = usePlanUsage();
  if (isLoading || !data) return null;
  const unl = data.unlimited;
  const fmt = (m: number) => (m >= unl ? "∞" : m.toString());

  const totalUnid = data.porEdificio.reduce((a, e) => a + e.unidades.used, 0);
  const maxUnid = data.porEdificio.reduce((a, e) => a + (e.unidades.max >= unl ? unl : e.unidades.max), 0);
  const totalAdm = data.porEdificio.reduce((a, e) => a + e.admins.used, 0);
  const maxAdm = data.porEdificio.reduce((a, e) => a + (e.admins.max >= unl ? unl : e.admins.max), 0);

  const items: { label: string; used: number; max: number; show: boolean }[] = [
    { label: "Edificios", used: data.edificios.used, max: data.edificios.max, show: focus === "edificios" || focus === "all" },
    { label: "Unidades", used: totalUnid, max: maxUnid, show: focus === "unidades" || focus === "all" },
    { label: "Admins", used: totalAdm, max: maxAdm, show: focus === "admins" || focus === "all" },
  ];

  return (
    <Card className="p-3 mb-3 bg-[#fffaf5] border-[#f0e3da]">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Crown className="w-3.5 h-3.5 text-[#c94f0c]" />
          <span className="font-medium text-[#2d1200]">{data.plan.nombre}</span>
        </div>
        {items.filter(i => i.show).map(i => (
          <div key={i.label} className="text-xs text-[#5a4030]">
            <span className="text-[#9a7060]">{i.label}:</span> <b>{i.used}</b> / {fmt(i.max)}
          </div>
        ))}
      </div>
    </Card>
  );
}

function MiPlanTab() {
  const { data, isLoading } = usePlanUsage();

  if (isLoading) return <Card><div className="p-4 text-sm text-[#9a7060]">Cargando plan...</div></Card>;
  if (!data) return <Card><div className="p-4 text-sm text-[#9a7060]">Sin datos de plan</div></Card>;

  const fmtMax = (max: number) => (max >= data.unlimited ? "∞" : max.toString());
  const remaining = (used: number, max: number) => (max >= data.unlimited ? "Ilimitado" : Math.max(0, max - used).toString());
  const pct = (used: number, max: number) => (max >= data.unlimited ? 5 : Math.min(100, (used / Math.max(1, max)) * 100));

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-[#9a7060]">Plan actual</div>
            <div className="font-display font-extrabold text-2xl text-[#2d1200]">{data.plan.nombre}</div>
            <div className="text-sm text-[#9a7060]">L {data.plan.precio.toLocaleString()} / mes</div>
          </div>
          <Link to="/" hash="planes">
            <Button className="bg-[#ff6a00] hover:bg-[#e85f00] text-white">Actualizar plan</Button>
          </Link>
        </div>
      </Card>

      <Card>
        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-[#2d1200]">Edificios</div>
            <div className="text-sm text-[#9a7060]">{data.edificios.used} / {fmtMax(data.edificios.max)}</div>
          </div>
          <Progress value={pct(data.edificios.used, data.edificios.max)} />
          <div className="text-sm text-[#5a4030]">Puedes crear <b>{remaining(data.edificios.used, data.edificios.max)}</b> edificios más</div>
        </div>
      </Card>

      {data.porEdificio.map((e) => (
        <Card key={e.id}>
          <div className="p-5 space-y-3">
            <div className="font-semibold text-[#2d1200] flex items-center gap-2">
              <Building2 className="w-4 h-4" /> {e.nombre}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#5a4030]">Unidades</span>
                <span className="text-[#9a7060]">{e.unidades.used} / {fmtMax(e.unidades.max)}</span>
              </div>
              <Progress value={pct(e.unidades.used, e.unidades.max)} />
              <div className="text-xs text-[#9a7060]">Puedes crear <b>{remaining(e.unidades.used, e.unidades.max)}</b> unidades más</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#5a4030]">Administradores</span>
                <span className="text-[#9a7060]">{e.admins.used} / {fmtMax(e.admins.max)}</span>
              </div>
              <Progress value={pct(e.admins.used, e.admins.max)} />
              <div className="text-xs text-[#9a7060]">Puedes invitar a <b>{remaining(e.admins.used, e.admins.max)}</b> admins más</div>
            </div>
          </div>
        </Card>
      ))}

      {data.porEdificio.length === 0 && (
        <Card><div className="p-4 text-sm text-[#9a7060]">Crea tu primer edificio para ver los límites por unidad/admin.</div></Card>
      )}
    </div>
  );
}
