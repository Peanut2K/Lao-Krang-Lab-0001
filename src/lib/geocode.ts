/** Thai address parts for a coordinate, from the Google Geocoding API. */
export type PlaceParts = { province: string; district: string; community: string };

// Google returns administrative names with their unit spelled out
// ("อำเภอแม่ริม", "ตำบล ริมใต้"); the app's option lists use the bare name.
const PREFIXES = [
  "จังหวัด",
  "อำเภอ",
  "เขต",
  "กิ่งอำเภอ",
  "ตำบล",
  "แขวง",
  "หมู่บ้าน",
  "บ้าน",
];

function strip(name: string | undefined): string {
  if (!name) return "";
  let value = name.trim();
  for (const prefix of PREFIXES) {
    if (value.startsWith(prefix)) {
      value = value.slice(prefix.length).trim();
      break;
    }
  }
  return value;
}

type Component = { long_name: string; types: string[] };

function partsFrom(components: Component[]): PlaceParts {
  const pick = (type: string) => components.find((component) => component.types.includes(type))?.long_name;
  return {
    province: strip(pick("administrative_area_level_1")),
    district: strip(pick("administrative_area_level_2")),
    community: strip(pick("locality") ?? pick("administrative_area_level_3") ?? pick("sublocality")),
  };
}

/**
 * Reverse-geocode a pin into จังหวัด / อำเภอ / ชุมชน. Returns empty strings for
 * parts Google has no answer for, so a caller can keep whatever is already set.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  apiKey: string,
): Promise<PlaceParts> {
  const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  endpoint.searchParams.set("latlng", `${latitude},${longitude}`);
  endpoint.searchParams.set("language", "th");
  endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error("geocode request failed");
  const body = (await response.json()) as { status: string; results?: { address_components: Component[] }[] };
  if (body.status !== "OK" || !body.results?.length) throw new Error(body.status || "geocode failed");

  // Merge components across results: the most precise result often omits the
  // province that a broader one carries.
  return partsFrom(body.results.flatMap((result) => result.address_components));
}

export type PlaceHit = PlaceParts & {
  label: string;
  latitude: number;
  longitude: number;
};

type SearchResult = {
  formatted_address: string;
  address_components: Component[];
  geometry: { location: { lat: number; lng: number } };
};

/**
 * Search a place by name ("วัดพระธาตุดอยสุเทพ", "อ.แม่ริม เชียงใหม่") for when the
 * GPS fix is off or the person is recording a pattern they are not standing in
 * front of. Returns an empty list when nothing matches.
 */
export async function searchPlaces(query: string, apiKey: string): Promise<PlaceHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const endpoint = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  endpoint.searchParams.set("address", trimmed);
  endpoint.searchParams.set("language", "th");
  endpoint.searchParams.set("region", "th");
  endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error("place search failed");
  const body = (await response.json()) as { status: string; results?: SearchResult[] };
  // ZERO_RESULTS is a normal "nothing found", not a failure worth throwing over.
  if (body.status === "ZERO_RESULTS") return [];
  if (body.status !== "OK" || !body.results?.length) throw new Error(body.status || "place search failed");

  return body.results.slice(0, 5).map((result) => ({
    label: result.formatted_address,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    ...partsFrom(result.address_components),
  }));
}
