import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useGenerarInvitacion, type Residente } from "@/lib/queries";

export function GenerarAccesoDialog({ residente, open, onOpenChange }: {
  residente: Residente | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [expira, setExpira] = useState<string | null>(null);
  const generar = useGenerarInvitacion();

  const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : "/login";

  const handleGenerar = async () => {
    if (!residente) return;
    const res = await generar.mutateAsync(residente.id);
    setCodigo(res.codigo);
    setExpira(res.expira_en);
  };

  const mensajeWhatsApp = residente && codigo
    ? `Hola ${residente.nombre}, ya tienes acceso a la app del condominio.\n\n📱 Entra a: ${portalUrl}\n🔑 Tu código de invitación: *${codigo}*\n\nIngresa tu email (${residente.email}) y crea tu contraseña.`
    : "";

  const handleWhatsApp = () => {
    const tel = residente?.telefono?.replace(/\D/g, "");
    const url = tel
      ? `https://wa.me/${tel}?text=${encodeURIComponent(mensajeWhatsApp)}`
      : `https://wa.me/?text=${encodeURIComponent(mensajeWhatsApp)}`;
    window.open(url, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mensajeWhatsApp);
    toast.success("Mensaje copiado");
  };

  const handleClose = (v: boolean) => {
    if (!v) { setCodigo(null); setExpira(null); }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generar acceso al portal</DialogTitle>
          <DialogDescription>
            {residente?.nombre} {residente?.apellido} — {residente?.email || "sin email"}
          </DialogDescription>
        </DialogHeader>

        {!residente?.email && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
            Este residente no tiene email registrado. Edítalo primero para agregar uno.
          </div>
        )}

        {residente?.email && !codigo && (
          <div className="space-y-3">
            <p className="text-sm text-[#1E293B]">
              Se generará un código único de 6 caracteres válido por 30 días. El residente lo usará junto con su email para registrarse en el portal.
            </p>
            <Button onClick={handleGenerar} disabled={generar.isPending} className="w-full bg-[#c0511f] hover:bg-[#a8451a]">
              <KeyRound className="w-4 h-4 mr-2" />
              {generar.isPending ? "Generando..." : "Generar código"}
            </Button>
          </div>
        )}

        {codigo && (
          <div className="space-y-4">
            <div className="text-center p-6 bg-[#fdf5ee] border-2 border-dashed border-[#c0511f] rounded-xl">
              <div className="text-xs text-[#64748B] uppercase tracking-wider mb-2">Código de invitación</div>
              <div className="text-4xl font-mono font-bold text-[#c0511f] tracking-widest">{codigo}</div>
              {expira && <div className="text-xs text-[#64748B] mt-2">Expira: {new Date(expira).toLocaleDateString()}</div>}
            </div>

            <div className="bg-[#F8FAFC] p-3 rounded-lg text-xs text-[#1E293B] whitespace-pre-wrap">
              {mensajeWhatsApp}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
              <Button onClick={handleCopy} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" /> Copiar
              </Button>
            </div>

            <p className="text-xs text-center text-[#64748B]">
              Si generas otro código, el anterior queda revocado.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
