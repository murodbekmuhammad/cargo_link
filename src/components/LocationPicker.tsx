import { useState } from 'react';
import { CITIES, nearestCity } from '../data/cities';
import type { GeoLocation } from '../types';
import { getCurrentPosition } from '../utils/geo';

interface Props {
  value: GeoLocation | undefined;
  onChange: (value: GeoLocation | undefined) => void;
  /** Label for "no location", e.g. "Not specified" or "Anywhere". */
  emptyLabel?: string;
  /** Extra choices listed first, e.g. the user's saved profile location. */
  presets?: { label: string; location: GeoLocation }[];
  id?: string;
  'aria-label'?: string;
}

const same = (a: GeoLocation, b: GeoLocation) => a.label === b.label && a.lat === b.lat && a.lng === b.lng;

/** City dropdown plus "use my current location". Always optional. */
export function LocationPicker({ value, onChange, emptyLabel = 'Not specified', presets = [], ...rest }: Props) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  let selected = '';
  if (value) {
    const p = presets.findIndex((x) => same(x.location, value));
    if (p >= 0) selected = `preset:${p}`;
    else if (CITIES.some((c) => same(c, value))) selected = `city:${value.label}`;
    else selected = 'custom';
  }

  const onSelect = async (key: string) => {
    setError(null);
    if (key === '') onChange(undefined);
    else if (key.startsWith('preset:')) onChange(presets[Number(key.slice(7))].location);
    else if (key.startsWith('city:')) onChange(CITIES.find((c) => c.label === key.slice(5)));
    else if (key === 'current') {
      setLocating(true);
      try {
        const pos = await getCurrentPosition();
        onChange({ label: `Near ${nearestCity(pos.lat, pos.lng).label}`, ...pos });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not get your location.');
      } finally {
        setLocating(false);
      }
    }
  };

  return (
    <div className="location-picker">
      <select value={selected} onChange={(e) => onSelect(e.target.value)} disabled={locating} {...rest}>
        <option value="">{locating ? 'Getting your location…' : emptyLabel}</option>
        {value && selected === 'custom' && <option value="custom">📍 {value.label}</option>}
        <option value="current">📍 Use my current location</option>
        {presets.map((p, i) => (
          <option key={p.label} value={`preset:${i}`}>
            {p.label}
          </option>
        ))}
        <optgroup label="Cities">
          {CITIES.map((c) => (
            <option key={c.label} value={`city:${c.label}`}>
              {c.label}
            </option>
          ))}
        </optgroup>
      </select>
      {error && <p className="error small">{error}</p>}
    </div>
  );
}
