import type { GeoLocation } from '../types';

type Point = Pick<GeoLocation, 'lat' | 'lng'>;

/** Straight-line (haversine) distance in kilometres. */
export function distanceKm(a: Point, b: Point): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) return '< 1 km away';
  return `${Math.round(km).toLocaleString('en-US')} km away`;
}

export function getCurrentPosition(): Promise<Point> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Your browser does not support location.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('Could not get your location. Check the browser permission or pick a city.')),
      { timeout: 10_000, maximumAge: 300_000 },
    );
  });
}

export interface WithDistance<T> {
  item: T;
  distance?: number;
}

/**
 * When an origin is given: keeps items within radiusKm (items without a
 * location are dropped when a radius is set) and sorts nearest first.
 * Without an origin, returns items unchanged.
 */
export function nearby<T>(
  items: T[],
  getLocation: (item: T) => GeoLocation | undefined,
  origin: GeoLocation | undefined,
  radiusKm: number | null,
): WithDistance<T>[] {
  if (!origin) return items.map((item) => ({ item }));
  return items
    .map((item) => {
      const loc = getLocation(item);
      return { item, distance: loc ? distanceKm(origin, loc) : undefined };
    })
    .filter((r) => radiusKm === null || (r.distance !== undefined && r.distance <= radiusKm))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
}
