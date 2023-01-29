import { atom } from "jotai";

import type { Layer } from "../core";

import { controlsStateAtom, closeupAtom, fieldAtom } from "../core/store";
import {
  hoveredEntityAtom,
  entityStoreAtom,
} from "../core/components/CanvasView/store";

export { controlsStateAtom, closeupAtom, fieldAtom };
export { hoveredEntityAtom, entityStoreAtom };

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
