import type { GeoLocation } from '../types';
import { formatDistance } from '../utils/geo';

export function LocationTag({ location, distance }: { location?: GeoLocation; distance?: number }) {
  if (!location) return null;
  return (
    <span className="tag">
      📍 {location.label}
      {distance !== undefined && <strong> · {formatDistance(distance)}</strong>}
    </span>
  );
}
