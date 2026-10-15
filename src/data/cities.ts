import type { GeoLocation } from '../types';
import { distanceKm } from '../utils/geo';

export const CITIES: GeoLocation[] = [
  { label: 'Tashkent', lat: 41.2995, lng: 69.2401 },
  { label: 'Samarkand', lat: 39.6542, lng: 66.9597 },
  { label: 'Bukhara', lat: 39.7747, lng: 64.4286 },
  { label: 'Namangan', lat: 40.9983, lng: 71.6726 },
  { label: 'Andijan', lat: 40.7821, lng: 72.3442 },
  { label: 'Fergana', lat: 40.3864, lng: 71.7864 },
  { label: 'Qarshi', lat: 38.8606, lng: 65.7891 },
  { label: 'Navoiy', lat: 40.1039, lng: 65.3792 },
  { label: 'Jizzakh', lat: 40.1158, lng: 67.8422 },
  { label: 'Gulistan', lat: 40.4897, lng: 68.7842 },
  { label: 'Termez', lat: 37.2242, lng: 67.2783 },
  { label: 'Urgench', lat: 41.55, lng: 60.6333 },
  { label: 'Nukus', lat: 42.46, lng: 59.61 },
];

export function cityLocation(name: string): GeoLocation | undefined {
  const n = name.trim().toLowerCase();
  return CITIES.find((c) => c.label.toLowerCase() === n);
}

export function nearestCity(lat: number, lng: number): GeoLocation {
  return CITIES.reduce((best, c) =>
    distanceKm({ lat, lng }, c) < distanceKm({ lat, lng }, best) ? c : best,
  );
}
