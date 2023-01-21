import { atom } from "jotai";

import { CANVAS } from "./constants";

const controlsStateAtom = atom<{ enableRotate: boolean; truckMode: boolean }>({
  enableRotate: true,
  truckMode: false,
});
const closeupAtom = atom(false);

const debugAtom = atom<string | null>(null);
// const zoomAtom = atom(0xffff);

const layersStateAtom = atom<
  Record<
    string,
    {
      enabled: boolean;
    }
  >
>({});

const fieldAtom = atom<{
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

const entityAtom = atom<Record<string, any> | null>(null);
const detailEntityAtom = atom(null);
const hoveredEntityAtom = atom<{ id: string | null; entity: any | null }>({
  id: null,
  entity: null,
});
const entityStoreAtom = atom<Record<string, { name: undefined } & any>>({});

export {
  layersStateAtom,
  entityAtom,
  detailEntityAtom,
  debugAtom,
  closeupAtom,
  hoveredEntityAtom,
  controlsStateAtom,
  fieldAtom,
  entityStoreAtom,
};
