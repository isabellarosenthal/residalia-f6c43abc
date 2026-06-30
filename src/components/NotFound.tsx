import { Link } from "@tanstack/react-router";

export function DefaultNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="text-6xl font-display font-extrabold text-[#4A154B]">404</div>
      <h1 className="font-display font-bold text-xl text-[#0F172A] mt-3">Página no encontrada</h1>
      <p className="text-sm text-[#64748B] mt-1 mb-5">La ruta que buscás no existe o fue movida.</p>
      <Link
        to="/dashboard"
        className="px-5 py-2.5 rounded-full bg-[#4A154B] text-white text-sm font-semibold hover:opacity-90"
      >
        Volver al dashboard
      </Link>
    </div>
  );
}

export function DefaultError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-display font-bold text-xl text-[#0F172A]">Algo salió mal</h1>
      <p className="text-sm text-[#64748B] mt-1 mb-4 max-w-md">{error?.message ?? "Error desconocido"}</p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-full bg-[#4A154B] text-white text-sm font-semibold hover:opacity-90"
      >
        Reintentar
      </button>
    </div>
  );
}
