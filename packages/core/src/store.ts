import { atom } from "jotai";

export const controlsStateAtom = atom<{
  enableRotate: boolean;
  truckMode: boolean;
}>({
  enableRotate: true,
  truckMode: false,
});

export const closeupAtom = atom(false);
