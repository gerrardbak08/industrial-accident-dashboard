/**
 * Fallback coordinates by team name.
 * Used when a store has no geocoded lat/lng yet.
 * These are approximate city-center coordinates for each team region.
 *
 * Replace with real per-store geocoding later by:
 *   1. Get a Kakao Local API key at https://developers.kakao.com
 *   2. Call POST /api/geocode after uploading 매장현황.xlsx
 *   3. That route updates stores.lat / stores.lng via Kakao's address-to-coord API
 */
export const TEAM_FALLBACK_COORDS: Record<string, [number, number]> = {
  강남팀:     [37.4979, 127.0276],
  강북팀:     [37.6397, 127.0254],
  강동팀:     [37.5301, 127.1238],
  관악팀:     [37.4784, 126.9516],
  신촌팀:     [37.5596, 126.9426],
  종로팀:     [37.5735, 126.9790],
  구리팀:     [37.5943, 127.1296],
  수원팀:     [37.2636, 127.0286],
  용인팀:     [37.2411, 127.1775],
  안산팀:     [37.3219, 126.8309],
  평택팀:     [36.9921, 127.1130],
  일산팀:     [37.6584, 126.8320],
  남인천팀:   [37.4140, 126.7325],
  북인천팀:   [37.5078, 126.7175],
  대전팀:     [36.3504, 127.3845],
  충남팀:     [36.7980, 126.8009],
  충북팀:     [36.6358, 127.4913],
  대구팀:     [35.8714, 128.6014],
  경북팀:     [36.5760, 128.5058],
  창원팀:     [35.2279, 128.6811],
  울산팀:     [35.5383, 129.3113],
  서부산팀:   [35.0959, 128.9740],
  동부산팀:   [35.2429, 129.2179],
  전북팀:     [35.8242, 127.1479],
  전남팀:     [34.8160, 126.4629],
  강릉속초팀: [37.7519, 128.8760],
  춘천원주팀: [37.8813, 127.7298],
  제주팀:     [33.4996, 126.5312],
}

/** Returns [lat, lng] for a store. Falls back to team centroid if no geocode. */
export function getStoreCoords(
  lat: number | null,
  lng: number | null,
  team: string,
): [number, number] | null {
  if (lat !== null && lng !== null) return [lat, lng]
  return TEAM_FALLBACK_COORDS[team] ?? null
}

/** Korea map default center and zoom */
export const KOREA_CENTER: [number, number] = [36.5, 127.5]
export const KOREA_ZOOM = 7
