import { useAtom } from "jotai";
import { canvasAtom } from "./store";

export function useCanvas() {
  const [canvas] = useAtom(canvasAtom);
  return canvas;
}
