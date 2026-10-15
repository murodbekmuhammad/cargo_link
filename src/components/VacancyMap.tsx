import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { GeoLocation, Vacancy } from '../types';
import { formatSalary } from '../utils/format';
import { formatDistance } from '../utils/geo';

// Bundlers break Leaflet's default icon paths; point them at the bundled files.
const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Free OpenStreetMap tiles by default (no key, no account). Point VITE_MAP_TILE_URL at a
// self-hosted tile server later if traffic outgrows OSM's fair-use policy.
const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const UZBEKISTAN_CENTER: L.LatLngExpression = [41.0, 64.5];

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function fit(map: L.Map, points: L.LatLngExpression[]) {
  if (points.length === 1) map.setView(points[0], 11);
  else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 12 });
  else map.setView(UZBEKISTAN_CENTER, 5);
}

interface Props {
  vacancies: { item: Vacancy; distance?: number }[];
  /** The "near" point, shown as a blue dot. */
  origin?: GeoLocation;
  height?: number | string;
  /** Hide the "View" links, e.g. when already on the vacancy's page. */
  showLinks?: boolean;
}

export function VacancyMap({ vacancies, origin, height = 480, showLinks = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const boundsRef = useRef<L.LatLngExpression[]>([]);
  const navigate = useNavigate();

  // Create the map once.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const map = L.map(el, { scrollWheelZoom: false }).setView(UZBEKISTAN_CENTER, 5);
    L.tileLayer(TILE_URL, {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Popup links are plain HTML; route them through React Router instead of reloading.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-route]');
      if (link) {
        e.preventDefault();
        navigate(link.dataset.route!);
      }
    };
    el.addEventListener('click', onClick);

    // Re-fit when the container changes size (rotation, window resize, switching views).
    const resize = new ResizeObserver(() => {
      map.invalidateSize();
      fit(map, boundsRef.current);
    });
    resize.observe(el);
    return () => {
      resize.disconnect();
      el.removeEventListener('click', onClick);
      map.remove();
      mapRef.current = null;
    };
  }, [navigate]);

  // Redraw markers whenever the results change.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    // Several vacancies in one city share a pin; its popup lists all of them.
    const groups = new Map<string, { location: GeoLocation; rows: Props['vacancies'] }>();
    for (const row of vacancies) {
      const loc = row.item.location;
      if (!loc) continue;
      const key = `${loc.lat},${loc.lng}`;
      if (!groups.has(key)) groups.set(key, { location: loc, rows: [] });
      groups.get(key)!.rows.push(row);
    }

    const points: L.LatLngExpression[] = [];
    for (const { location, rows } of groups.values()) {
      const distance = rows[0].distance;
      const items = rows
        .map(({ item: v }) => {
          const title = escapeHtml(v.title);
          const heading = showLinks ? `<a href="/vacancies/${v.id}" data-route="/vacancies/${v.id}">${title}</a>` : title;
          return `<li><strong>${heading}</strong><br><span>${escapeHtml(v.companyName)} · ${escapeHtml(formatSalary(v))}</span></li>`;
        })
        .join('');
      const html =
        `<div class="map-popup"><div class="map-popup-head">📍 ${escapeHtml(location.label)}` +
        (distance !== undefined ? ` · ${formatDistance(distance)}` : '') +
        `</div><ul>${items}</ul></div>`;
      const marker = L.marker([location.lat, location.lng], { icon: pinIcon, title: location.label })
        .bindPopup(html, { maxWidth: 280 })
        // Leaflet renders tooltip strings as HTML, so company-entered text must be escaped.
        .bindTooltip(rows.length > 1 ? `${rows.length} vacancies` : escapeHtml(rows[0].item.title), {
          direction: 'top',
          offset: [0, -36],
        });
      layer.addLayer(marker);
      points.push([location.lat, location.lng]);
    }

    if (origin) {
      L.circleMarker([origin.lat, origin.lng], {
        radius: 8,
        color: '#fff',
        weight: 3,
        fillColor: '#2563eb',
        fillOpacity: 1,
      })
        .bindTooltip(escapeHtml(origin.label), { direction: 'top' })
        .addTo(layer);
      points.push([origin.lat, origin.lng]);
    }

    boundsRef.current = points;
    fit(map, points);
  }, [vacancies, origin, showLinks]);

  return <div ref={containerRef} className="vacancy-map" style={{ height }} role="region" aria-label="Vacancies map" />;
}
