import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, Download } from "lucide-react";
import { toast } from "sonner";
import type { Acceso } from "@/lib/queries";
import { useEdificios } from "@/lib/queries";

const fmtDT = (s: string | null) => s ? new Date(s).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" }) : "—";

export function PaseDialog({ open, onOpenChange, acceso }: { open: boolean; onOpenChange: (v: boolean) => void; acceso: Acceso | null }) {
  const { data: edificios = [] } = useEdificios();
  const edificio = edificios.find((e) => e.id === acceso?.condominio_id);

  const mensaje = useMemo(() => {
    if (!acceso) return "";
    return [
      `🎫 *Pase de acceso*`,
      edificio ? `🏢 ${edificio.nombre}` : null,
      `👤 ${acceso.visitante_nombre}`,
      `🔑 Código: *${acceso.qr_code ?? "—"}*`,
      `📅 Entrada: ${fmtDT(acceso.fecha_entrada)}`,
      ``,
      `Muestra este código en la entrada.`,
    ].filter(Boolean).join("\n");
  }, [acceso, edificio]);

  const qrUrl = acceso?.qr_code
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(acceso.qr_code)}`
    : "";

  const copiar = async () => {
    await navigator.clipboard.writeText(mensaje);
    toast.success("Pase copiado");
  };

  const whatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader><DialogTitle className="font-display text-xl text-[#173B7A]">Pase de acceso</DialogTitle></DialogHeader>
        {acceso && (
          <div className="space-y-4">
            <div className="bg-[#F8FAFC] rounded-2xl p-4 text-center">
              {qrUrl && <img src={qrUrl} alt="QR del pase" className="mx-auto rounded-lg bg-white p-2" width={240} height={240} />}
              <div className="mt-3 text-xs text-[#64748B]">Código</div>
              <div className="font-mono text-lg font-bold text-[#173B7A] tracking-widest">{acceso.qr_code}</div>
            </div>
            <div className="text-sm text-[#5a3a2a] whitespace-pre-line bg-white border border-[#E2E8F0] rounded-xl p-3">{mensaje}</div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={copiar}><Copy className="w-4 h-4 mr-1" />Copiar</Button>
              <Button onClick={whatsapp} className="bg-[#25D366] hover:bg-[#1da851] text-white"><MessageCircle className="w-4 h-4 mr-1" />WhatsApp</Button>
              <Button variant="outline" asChild><a href={qrUrl} download={`pase-${acceso.qr_code}.png`}><Download className="w-4 h-4 mr-1" />QR</a></Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
