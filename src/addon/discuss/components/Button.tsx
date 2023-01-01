import clsx from "clsx";

import { mdiCommentTextMultipleOutline } from "@mdi/js";

import { useAtom } from "jotai";
import * as store from "../store";

export default function DiscussButton({ width, height, ...props }) {
  const [enabled, setEnabled] = useAtom(store.enabledAtom);
  const [status] = useAtom(store.statusAtom);

  const indicatorStyles = {
    CONNECTED: "bg-blue-400",
    ERROR: "bg-red-400",
  };

  return (
    <>
      <button
        className="focus:outline-none"
        onClick={() => setEnabled(!enabled)}
      >
        <svg style={{ width, height }} viewBox="0 0 24 24">
          <path fill="#000000" d={mdiCommentTextMultipleOutline} />
        </svg>
      </button>
      {(enabled || status === "ERROR") && (
        <span className="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
          <span
            className={clsx(
              "absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75",
              indicatorStyles[status],
            )}
          ></span>
        </span>
      )}
    </>
  );
}
