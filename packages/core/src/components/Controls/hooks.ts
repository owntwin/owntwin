import { useAtom } from "jotai";
import { controlsStateAtom } from "../../store";

export const useControls = () => {
  const [state, setState] = useAtom(controlsStateAtom);
  return { state, setState };
};
