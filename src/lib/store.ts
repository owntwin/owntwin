import { atom } from "jotai";
import { canvas } from "./util";

const layersStateAtom = atom<
  Record<
    string,
    {
      enabled: boolean;
    }
  >
>({});
const entityAtom = atom<Record<string, any> | null>(null);
const detailEntityAtom = atom(null);
const debugAtom = atom<string | null>(null);
// const zoomAtom = atom(0xffff);
const closeupAtom = atom(false);
const hoveredEntityAtom = atom<{ id: string | null; entity: any | null }>({
  id: null,
  entity: null,
});
const controlsStateAtom = atom<{ enableRotate: boolean; truckMode: boolean }>({
  enableRotate: true,
  truckMode: false,
});

const fieldAtom = atom<{
  canvas: { width: number; height: number; segments: number };
  vertices?: any[];
  bbox?: { minlng: number; minlat: number; maxlng: number; maxlat: number };
  ready: boolean;
}>({
  canvas: canvas,
  vertices: undefined,
  bbox: undefined,
  ready: false,
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
