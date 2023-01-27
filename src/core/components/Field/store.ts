import { atom } from "jotai";

import { CANVAS } from "../../constants";

export const fieldAtom = atom<{
  canvas: { width: number; height: number; segments: number };
  vertices?: any[];
  bbox?: { minlng: number; minlat: number; maxlng: number; maxlat: number };
  ready: boolean;
}>({
  canvas: CANVAS,
  vertices: undefined,
  bbox: undefined,
  ready: false,
});
