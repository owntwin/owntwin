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
const hoveredEntityAtom = atom<{ id?: string; entity: any | null }>({
  entity: null,
});
const controlsStateAtom = atom<{ enableRotate: boolean }>({
  enableRotate: true,
});

const terrainAtom = atom<{
  canvas: { width: number; height: number; segments: number };
  vertices?: any[];
  ready: boolean;
}>({
  canvas: canvas,
  vertices: undefined,
  ready: false,
});

// TODO: fix performance degression
const getTerrainAltitudeAtom = atom((get) => {
  const getTerrainAltitude = (x: number, y: number) => {
    // TODO: vertices should be given outside the function
    const { canvas, vertices } = get(terrainAtom);
    if (!vertices) return undefined;

    const pos =
      Math.floor(x / (canvas.width / canvas.segments)) +
      canvas.segments *
        (canvas.segments -
          1 -
          Math.floor(y / (canvas.height / canvas.segments)));
    if (pos < 0 || vertices.length <= pos) {
      // console.log(x, y, pos);
      return 0;
    }
    return vertices[pos * 3 + 2]; // pos.z
  };

  return getTerrainAltitude;
});

export {
  layersStateAtom,
  entityAtom,
  detailEntityAtom,
  debugAtom,
  closeupAtom,
  hoveredEntityAtom,
  controlsStateAtom,
  terrainAtom,
  getTerrainAltitudeAtom,
};
