import { atom } from "jotai";

export const canvasAtom = atom<{
  width: number;
  height: number;
  _segments: number;
  bbox: any;
} | null>(null);

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
