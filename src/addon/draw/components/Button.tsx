import clsx from "clsx";

import { mdiDraw } from "@mdi/js";

import { useAtom } from "jotai";
import * as store from "../store";

export default function DrawButton({ width, height, ...props }) {
  const [enabled, setEnabled] = useAtom(store.enabledAtom);

  const indicatorStyles = {
    ENABLED: "bg-blue-400",
  };

  return (
    <>
      <button
        className="focus:outline-none"
        onClick={() => setEnabled(!enabled)}
      >
        <svg
          className="fill-current text-black"
          style={{ width, height }}
          viewBox="0 0 24 24"
        >
          <path d={mdiDraw} />
        </svg>
      </button>
      {enabled && (
        <span className="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
          <span
            className={clsx(
              "absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75",
              indicatorStyles["ENABLED"],
            )}
          ></span>
        </span>
      )}
    </>
  );
}
