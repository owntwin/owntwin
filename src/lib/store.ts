import { atom } from "jotai";

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

export {
  layersStateAtom,
  entityAtom,
  detailEntityAtom,
  debugAtom,
  closeupAtom,
  hoveredEntityAtom,
};
