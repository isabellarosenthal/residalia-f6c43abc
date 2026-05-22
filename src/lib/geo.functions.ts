import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

export type GeoResult = {
  formatted_address: string | null;
  ciudad: string | null;
  departamento: string | null;
  pais: string | null;
};

function pickComponent(comps: any[], types: string[]): string | null {
  for (const t of types) {
    const c = comps.find((c) => Array.isArray(c.types) && c.types.includes(t));
    if (c?.long_name) return c.long_name as string;
  }
  return null;
}

export const reverseGeocode = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }).parse(input),
  )
  .handler(async ({ data }): Promise<GeoResult> => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
    if (!gmapsKey) throw new Error("GOOGLE_MAPS_API_KEY is not configured");

    const url = `${GATEWAY_URL}/maps/api/geocode/json?latlng=${data.lat},${data.lng}&language=es&region=hn`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gmapsKey,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Geocoding failed [${res.status}]: ${body}`);
    }
    const json: any = await res.json();
    const first = json?.results?.[0];
    if (!first) {
      return { formatted_address: null, ciudad: null, departamento: null, pais: null };
    }
    const comps = first.address_components ?? [];
    return {
      formatted_address: (first.formatted_address as string) ?? null,
      ciudad: pickComponent(comps, ["locality", "postal_town", "administrative_area_level_2", "sublocality"]),
      departamento: pickComponent(comps, ["administrative_area_level_1"]),
      pais: pickComponent(comps, ["country"]),
    };
  });
