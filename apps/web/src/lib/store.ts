import { atom } from "jotai";

import type { Layer } from "@owntwin/core";

import { closeupAtom } from "@owntwin/core/store";
import {
  hoveredEntityAtom,
  entityStoreAtom,
} from "@owntwin/core/components/ModelView/store";

export { closeupAtom };
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
