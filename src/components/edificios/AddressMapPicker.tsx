import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, Loader2, Locate } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { reverseGeocode, type GeoResult } from "@/lib/geo.functions";

// Tegucigalpa, Honduras
const DEFAULT_CENTER = { lat: 14.0723, lng: -87.1921 };
const DEFAULT_ZOOM = 12;
const PIN_ZOOM = 17;

let mapsLoaderPromise: Promise<typeof google> | null = null;

function loadMaps(): Promise<typeof google> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google);
  if (mapsLoaderPromise) return mapsLoaderPromise;

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
  if (!key) return Promise.reject(new Error("Google Maps key missing"));

  mapsLoaderPromise = new Promise((resolve, reject) => {
    (window as any).__habitaInitMap = () => resolve((window as any).google);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async&callback=__habitaInitMap${channel ? `&channel=${channel}` : ""}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return mapsLoaderPromise;
}

export interface AddressValue {
  direccion: string;
  latitud: number | null;
  longitud: number | null;
}

export function AddressMapPicker({
  value,
  onChange,
  onGeoFound,
}: {
  value: AddressValue;
  onChange: (v: AddressValue) => void;
  onGeoFound?: (g: GeoResult) => void;
}) {
  const mapEl = useRef<HTMLDivElement>(null);
  const searchEl = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const rg = useServerFn(reverseGeocode);

  const updateFromLatLng = async (lat: number, lng: number, addressHint?: string) => {
    onChange({ ...value, latitud: lat, longitud: lng, ...(addressHint ? { direccion: addressHint } : {}) });
    setResolving(true);
    try {
      const g = await rg({ data: { lat, lng } });
      if (g.formatted_address && !addressHint) {
        onChange({ direccion: g.formatted_address, latitud: lat, longitud: lng });
      }
      onGeoFound?.(g);
    } catch (e) {
      console.error(e);
    } finally {
      setResolving(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then((g) => {
        if (cancelled || !mapEl.current) return;
        const start = value.latitud && value.longitud
          ? { lat: Number(value.latitud), lng: Number(value.longitud) }
          : DEFAULT_CENTER;
        const map = new g.maps.Map(mapEl.current, {
          center: start,
          zoom: value.latitud ? PIN_ZOOM : DEFAULT_ZOOM,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });
        const marker = new g.maps.Marker({
          position: start,
          map,
          draggable: true,
          visible: !!value.latitud,
        });
        mapRef.current = map;
        markerRef.current = marker;

        marker.addListener("dragend", () => {
          const p = marker.getPosition();
          if (p) updateFromLatLng(p.lat(), p.lng());
        });
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return;
          marker.setPosition(e.latLng);
          marker.setVisible(true);
          updateFromLatLng(e.latLng.lat(), e.latLng.lng());
        });

        if (searchEl.current) {
          const ac = new g.maps.places.Autocomplete(searchEl.current, {
            componentRestrictions: { country: "hn" },
            fields: ["formatted_address", "geometry", "address_components", "name"],
          });
          ac.bindTo("bounds", map);
          ac.addListener("place_changed", () => {
            const place = ac.getPlace();
            const loc = place.geometry?.location;
            if (!loc) return;
            const lat = loc.lat();
            const lng = loc.lng();
            map.panTo(loc);
            map.setZoom(PIN_ZOOM);
            marker.setPosition(loc);
            marker.setVisible(true);
            const addr = place.formatted_address ?? place.name ?? "";
            onChange({ direccion: addr, latitud: lat, longitud: lng });
            // Pull admin levels from the place itself
            const comps = place.address_components ?? [];
            const pick = (types: string[]) => {
              for (const t of types) {
                const c = comps.find((c) => c.types.includes(t));
                if (c) return c.long_name;
              }
              return null;
            };
            onGeoFound?.({
              formatted_address: addr,
              ciudad: pick(["locality", "postal_town", "administrative_area_level_2"]),
              departamento: pick(["administrative_area_level_1"]),
              pais: pick(["country"]),
            });
          });
          autocompleteRef.current = ac;
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error("Maps load error", e);
        setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker if value changes externally
  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return;
    if (value.latitud && value.longitud) {
      const pos = { lat: Number(value.latitud), lng: Number(value.longitud) };
      markerRef.current.setPosition(pos);
      markerRef.current.setVisible(true);
    }
  }, [value.latitud, value.longitud]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      if (mapRef.current && markerRef.current) {
        const ll = { lat: latitude, lng: longitude };
        mapRef.current.panTo(ll);
        mapRef.current.setZoom(PIN_ZOOM);
        markerRef.current.setPosition(ll);
        markerRef.current.setVisible(true);
      }
      updateFromLatLng(latitude, longitude);
    });
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a7060] pointer-events-none" />
        <Input
          ref={searchEl}
          placeholder="Buscar dirección en Honduras…"
          defaultValue={value.direccion}
          onChange={(e) => onChange({ ...value, direccion: e.target.value })}
          className="pl-9 pr-24 bg-white"
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={useMyLocation}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 text-[#c94f0c] hover:text-[#a33d08] hover:bg-[#fdeee5]"
        >
          <Locate className="w-3.5 h-3.5 mr-1" /> Mi ubicación
        </Button>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-[#e8ddd8] bg-[#f5ede8]" style={{ height: 220 }}>
        <div ref={mapEl} className="absolute inset-0" />
        {(loading || resolving) && (
          <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs text-[#9a7060] flex items-center gap-1 shadow-sm">
            <Loader2 className="w-3 h-3 animate-spin" />
            {loading ? "Cargando mapa…" : "Detectando dirección…"}
          </div>
        )}
        {!loading && !value.latitud && (
          <div className="absolute bottom-2 left-2 right-2 bg-white/90 rounded-lg px-3 py-2 text-xs text-[#9a7060] shadow-sm">
            Haz clic en el mapa o busca arriba para colocar el pin.
          </div>
        )}
      </div>
      {value.latitud && value.longitud && (
        <p className="text-[11px] text-[#9a7060]">
          Coordenadas: {Number(value.latitud).toFixed(6)}, {Number(value.longitud).toFixed(6)}
        </p>
      )}
    </div>
  );
}
