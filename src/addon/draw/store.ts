import { atom } from "jotai";

const selectedToolAtom = atom<"draw" | "brush" | "erase" | null>(null);
const linesAtom = atom<any[]>([]);

export { selectedToolAtom, linesAtom };
