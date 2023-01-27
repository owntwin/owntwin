import { atom } from "jotai";

import type { Layer } from "../core";

import { controlsStateAtom, closeupAtom, fieldAtom } from "../core/store";

export { controlsStateAtom, closeupAtom, fieldAtom };

export const debugAtom = atom<string | null>(null);

export const layersAtom = atom<Record<string, Layer>>({});
export const layersStateAtom = atom<
  Record<
    string,
    {
      enabled: boolean;
    }
  >
>({});

export const hoveredEntityAtom = atom<{
  id: string | null;
  entity: any | null;
}>({
  id: null,
  entity: null,
});

export const entityStoreAtom = atom<Record<string, { name: undefined } & any>>(
  {},
);
