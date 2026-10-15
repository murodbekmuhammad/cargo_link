import { useAuth } from '../auth/useAuth';
import type { GeoLocation } from '../types';
import { LocationPicker } from './LocationPicker';

const RADII = [10, 25, 50, 100, 250];

interface Props {
  origin: GeoLocation | undefined;
  onOriginChange: (o: GeoLocation | undefined) => void;
  radiusKm: number | null;
  onRadiusChange: (r: number | null) => void;
}

/** "Near [place] within [N km]" — sorts results nearest first. */
export function NearFilter({ origin, onOriginChange, radiusKm, onRadiusChange }: Props) {
  const { user } = useAuth();
  const presets = user?.location ? [{ label: `My location — ${user.location.label}`, location: user.location }] : [];

  return (
    <>
      <LocationPicker
        value={origin}
        onChange={onOriginChange}
        emptyLabel="Near: anywhere"
        presets={presets}
        aria-label="Near location"
      />
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
