import { AlertCircle, Loader2 } from "lucide-react";

export function PortalLoading({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#64748B] gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-[#4A154B]" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function PortalSinResidente() {
  return (
    <div className="bg-[#fde8e2] border border-[#f5b8a8] text-[#7a2a10] rounded-2xl p-5 flex gap-3">
      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
      <div>
        <div className="font-semibold mb-1">Tu cuenta aún no está vinculada</div>
        <p className="text-sm leading-relaxed">
          Pide al administrador del edificio que te registre como residente usando el mismo correo con el que iniciaste sesión.
          Después cierra sesión y vuelve a entrar.
        </p>
      </div>
    </div>
  );
}
