import { atom } from "jotai";

const selectedToolAtom = atom<"draw" | "brush" | "erase" | null>(null);
const linesAtom = atom<any[]>([]);
const penStateAtom = atom<{
  lineWidth: number;
  color?: string | number;
  opacity?: number;
}>({
  lineWidth: 4,
  color: undefined,
  opacity: undefined,
});

export { selectedToolAtom, linesAtom, penStateAtom };
