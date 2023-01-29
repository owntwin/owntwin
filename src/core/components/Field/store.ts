import { atom } from "jotai";

export const fieldAtom = atom<{
  vertices?: any[];
  bbox?: { minlng: number; minlat: number; maxlng: number; maxlat: number };
  ready: boolean;
}>({
  vertices: undefined,
  bbox: undefined,
  ready: false,
});
