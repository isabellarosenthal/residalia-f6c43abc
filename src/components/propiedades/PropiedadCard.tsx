import { Bed, Bath, Car, Maximize, Building2, MapPin, Edit, Tag } from "lucide-react";
import { EstadoComercialBadge } from "@/components/unidades/EstadoBadge";
import type { Unidad, Condominio } from "@/lib/queries";

function fmt(n: number | null | undefined, moneda = "L") {
  if (n == null) return "—";
  return `${moneda} ${Number(n).toLocaleString("es-HN", { maximumFractionDigits: 0 })}`;
}

export function PropiedadCard({
  unidad, edificio, onEdit,
}: { unidad: Unidad; edificio?: Condominio; onEdit: (u: Unidad) => void }) {
  const fotos = (unidad.fotos_urls as string[] | null) ?? [];
  const cover = fotos[0];
  const moneda = edificio?.moneda ?? "L";
  const muestraVenta = unidad.estado_comercial === "en_venta" || unidad.estado_comercial === "en_venta_y_renta";
  const muestraRenta = unidad.estado_comercial === "en_renta" || unidad.estado_comercial === "en_venta_y_renta";

  return (
    <div className="group bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#D9A441]/40 transition-all">
      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] overflow-hidden">
        {cover ? (
          <img src={cover} alt={`Unidad ${unidad.numero}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#c4a896]">
            <Building2 className="w-16 h-16" />
          </div>
        )}
        <div className="absolute top-3 left-3"><EstadoComercialBadge value={unidad.estado_comercial} /></div>
        {unidad.precio_negociable && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-[10px] font-semibold px-2 py-1 rounded-full text-[#173B7A]">
            Negociable
          </div>
        )}
        <button
          onClick={() => onEdit(unidad)}
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition bg-white/95 backdrop-blur p-2 rounded-full text-[#173B7A] hover:bg-[#173B7A] hover:text-white"
          aria-label="Editar"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-[#173B7A] text-lg leading-tight">
              {unidad.tipo ? unidad.tipo[0].toUpperCase() + unidad.tipo.slice(1) : "Unidad"} #{unidad.numero}
            </h3>
            {unidad.piso != null && <span className="text-xs text-[#64748B] mt-1">Piso {unidad.piso}</span>}
          </div>
          {edificio && (
            <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />{edificio.nombre}{edificio.ciudad ? ` · ${edificio.ciudad}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-[#5a3a28]">
          {unidad.habitaciones != null && <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{unidad.habitaciones}</span>}
          {unidad.banos != null && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{unidad.banos}</span>}
          {unidad.parqueos != null && unidad.parqueos > 0 && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" />{unidad.parqueos}</span>}
          {unidad.area_m2_construccion != null && <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" />{unidad.area_m2_construccion}m²</span>}
        </div>

        <div className="pt-2 border-t border-[#f0e6e0] space-y-1">
          {muestraVenta && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold">Venta</span>
              <span className="font-display font-bold text-[#173B7A]">{fmt(unidad.precio_venta, moneda)}</span>
            </div>
          )}
          {muestraRenta && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold">Renta/mes</span>
              <span className="font-display font-bold text-[#173B7A]">{fmt(unidad.precio_renta, moneda)}</span>
            </div>
          )}
          {!muestraVenta && !muestraRenta && (
            <div className="flex items-center gap-1 text-xs text-[#64748B]"><Tag className="w-3 h-3" />Sin publicar comercialmente</div>
          )}
        </div>
      </div>
    </div>
  );
}
