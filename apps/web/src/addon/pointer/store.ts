import * as THREE from "three";

import { atom } from "jotai";

const enabledAtom = atom(true);
const statusAtom = atom<"DISCONNECTED" | "CONNECTED" | "ERROR">("DISCONNECTED");

export { enabledAtom, statusAtom };
