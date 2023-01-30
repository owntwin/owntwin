import * as THREE from "three";

import { atom } from "jotai";

export type Comment = {
  position: THREE.Vector3;
  content: string;
};

const commentPromptInitialValue = { position: undefined, content: undefined };

const enabledAtom = atom(true);
const clientAtom = atom<any>(undefined);
const statusAtom = atom<"DISCONNECTED" | "CONNECTED" | "ERROR">("DISCONNECTED");
const commentPromptAtom = atom<Comment | Partial<Comment>>(
  commentPromptInitialValue,
);
const commentsAtom = atom<Comment[]>(Array.from([]));

export {
  commentPromptInitialValue,
  enabledAtom,
  clientAtom,
  statusAtom,
  commentPromptAtom,
  commentsAtom,
};
