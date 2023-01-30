import { atom } from "jotai";

export const fieldAtom = atom<{
  vertices?: any[];
  geometry?: any;
  bbox?: { minlng: number; minlat: number; maxlng: number; maxlat: number };
  ready: boolean;
}>({
  vertices: undefined,
  geometry: undefined,
  bbox: undefined,
  ready: false,
});
