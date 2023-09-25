import { proxy } from "valtio";

import type { Drawing } from "./types";

export const BACKEND_URL =
  import.meta.env.VITE_DISCUSS_BACKEND_URL || window.location.origin;

const m = window.location.pathname.match(/^\/twin\/([^/]*)\/?/);
export const twinId = m && m.length > 1 ? m[1] : "nowhere";

export const drawState = proxy<{ drawings: Drawing[] }>({
  drawings: [],
});
