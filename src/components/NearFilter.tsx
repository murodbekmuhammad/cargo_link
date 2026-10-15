import type { GeoLocation } from '../types';
import { LocationPicker } from './LocationPicker';

const RADII = [10, 25, 50, 100, 250];

interface Props {
  origin: GeoLocation | undefined;
  onOriginChange: (o: GeoLocation | undefined) => void;
  radiusKm: number | null;
  onRadiusChange: (r: number | null) => void;
}

/** "Near [place] within [N km]" — sorts results nearest first. The place is never saved. */
export function NearFilter({ origin, onOriginChange, radiusKm, onRadiusChange }: Props) {
  return (
    <>
      <LocationPicker value={origin} onChange={onOriginChange} emptyLabel="Near: anywhere" aria-label="Near location" />
      {origin && (
        <select
          value={radiusKm ?? ''}
          onChange={(e) => onRadiusChange(e.target.value ? Number(e.target.value) : null)}
          aria-label="Distance"
        >
          <option value="">Any distance</option>
          {RADII.map((r) => (
            <option key={r} value={r}>
              Within {r} km
            </option>
          ))}
        </select>
      )}
    </>
  );
}
