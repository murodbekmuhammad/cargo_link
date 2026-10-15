/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional map tile URL template, e.g. https://tiles.example.com/{z}/{x}/{y}.png */
  readonly VITE_MAP_TILE_URL?: string;
}
