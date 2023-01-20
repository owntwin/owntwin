import { useEffect, useState } from "react";
import clsx from "clsx";

import { useAtom } from "jotai";
import * as store from "./lib/store";

import { mdiCloseCircle } from "@mdi/js";

export default function Debug() {
  const [debugOpen, setDebugOpen] = useState(false);
  const [debug, setDebug] = useAtom(store.debugAtom);

  useEffect(() => {
    if (!!debug) setDebugOpen(true);
  }, [debug]);

  return (
    <div
      id="debug"
      className={clsx(
        "rounded-t-md bg-gray-800 text-white fixed bottom-0 left-0 right-0 h-48 p-4 text-sm shadow-md",
        debugOpen ? "block" : "hidden",
      )}
    >
      <div
        className="absolute top-4 right-4 cursor-pointer"
        onClick={() => {
          setDebugOpen(false);
          setDebug("");
        }}
      >
        <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
          <path fill="#eee" d={mdiCloseCircle} />
        </svg>
      </div>
      <div className="overflow-y-scroll w-full h-full">{debug}</div>
    </div>
  );
}
