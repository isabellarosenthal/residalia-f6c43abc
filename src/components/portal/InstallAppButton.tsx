import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallAppButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    if (isStandalone) { setInstalled(true); return; }

    const onBIP = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferred(null);
    } else if (isIOS) {
      setIosHelp(true);
    } else {
      setIosHelp(true);
    }
  };

  return (
    <>
      <button onClick={handleClick}
        className="text-xs bg-[#374151] hover:bg-[#1F2937] text-white px-3 py-1.5 rounded-full inline-flex items-center gap-1">
        <Download className="w-3.5 h-3.5" />Instalar app
      </button>
      {iosHelp && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setIosHelp(false)}>
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div className="font-display font-bold text-lg text-[#374151] flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#374151]" />Instalar Altura Cloud
              </div>
              <button onClick={() => setIosHelp(false)}><X className="w-5 h-5 text-[#64748B]" /></button>
            </div>
            {isIOS ? (
              <ol className="text-sm text-[#374151] space-y-2 list-decimal pl-5">
                <li>Toca el botón <strong>Compartir</strong> en la barra de Safari.</li>
                <li>Selecciona <strong>“Agregar a la pantalla de inicio”</strong>.</li>
                <li>Confirma con <strong>“Agregar”</strong>.</li>
              </ol>
            ) : (
              <ol className="text-sm text-[#374151] space-y-2 list-decimal pl-5">
                <li>Abre el menú del navegador (⋮ en Chrome).</li>
                <li>Selecciona <strong>“Instalar app”</strong> o <strong>“Agregar a pantalla de inicio”</strong>.</li>
                <li>Confirma. La app aparecerá como ícono en tu celular.</li>
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  );
}
