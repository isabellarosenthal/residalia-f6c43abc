import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Maximize2, RefreshCw, X } from "lucide-react";
import { QRCanvas } from "@/components/portal/QRCanvas";
import { mintResidentQR } from "@/lib/resident-qr.functions";
import { toast } from "sonner";

const REFRESH_MS = 15_000;

export function MiQRRotativo({
  residenteId,
  nombre,
  subtitulo,
}: {
  residenteId: string;
  nombre: string;
  subtitulo: string;
}) {
  const mint = useServerFn(mintResidentQR);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [now, setNow] = useState<number>(() => Date.now());
  const [loading, setLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mint({ data: { residenteId } });
      setToken(res.token);
      setExpiresAt(res.expiresAt);
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo generar el QR");
    } finally {
      setLoading(false);
    }
  }, [mint, residenteId]);

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, REFRESH_MS);
    timerRef.current = i;
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [refresh]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const tone = remaining <= 5 ? "text-[#ef4444]" : "text-[#16a34a]";

  return (
    <>
      <div className="bg-gradient-to-br from-[#1a0d1a] to-[#2d1430] rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl p-2 shrink-0">
            {token ? <QRCanvas value={token} size={92} /> : <div className="w-[92px] h-[92px] bg-gray-100 animate-pulse rounded" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base truncate">{nombre}</div>
            <div className="text-xs text-white/70 truncate">{subtitulo}</div>
            <div className="text-[10px] text-white/50 mt-1">QR rotativo · se renueva cada 15s</div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className={`text-2xl font-bold tabular-nums ${tone}`}>{remaining}s</div>
            <button
              onClick={() => setFullscreen(true)}
              className="text-white/70 hover:text-white p-1"
              aria-label="Pantalla completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 bg-[#0a050a] z-50 flex flex-col items-center justify-center p-6"
          onClick={() => setFullscreen(false)}
        >
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            aria-label="Cerrar"
          >
            <X className="w-7 h-7" />
          </button>
          <div className="text-white text-center mb-6">
            <div className="text-sm text-white/60">Mi QR de residente</div>
            <div className="font-bold text-2xl">{nombre}</div>
            <div className="text-sm text-white/70">{subtitulo}</div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            {token ? <QRCanvas value={token} size={320} /> : <div className="w-[320px] h-[320px] bg-gray-100 animate-pulse rounded" />}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className={`text-5xl font-bold tabular-nums ${tone}`}>{remaining}s</div>
            <button
              onClick={(e) => { e.stopPropagation(); refresh(); }}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white rounded-full p-3"
              aria-label="Renovar"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="text-white/50 text-xs mt-4">El código se renueva automáticamente</div>
        </div>
      )}
    </>
  );
}
