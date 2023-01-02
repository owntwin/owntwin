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

export {
  layersStateAtom,
  entityAtom,
  detailEntityAtom,
  debugAtom,
  closeupAtom,
};
