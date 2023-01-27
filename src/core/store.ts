import { atom } from "jotai";

import { fieldAtom } from "./components/Field/store";

export const controlsStateAtom = atom<{
  enableRotate: boolean;
  truckMode: boolean;
}>({
  enableRotate: true,
  truckMode: false,
});

export const closeupAtom = atom(false);

export { fieldAtom };
