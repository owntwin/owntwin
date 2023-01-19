import clsx from "clsx";

import { Icon } from "@mdi/react";
import { mdiBrushVariant, mdiDraw, mdiEraserVariant, mdiMarker } from "@mdi/js";

import { useAtom } from "jotai";
import * as store from "../store";

function ButtonIndicator({ enabled }: { enabled: boolean }) {
  const indicatorStyles = {
    ENABLED: "bg-blue-400",
  };

  return enabled ? (
    <span className="flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1">
      <span
        className={clsx(
          "absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75",
          indicatorStyles["ENABLED"],
        )}
      ></span>
    </span>
  ) : null;
}

export function DrawButton({ size }: { size: number | string }) {
  const [selectedTool, setSelectedTool] = useAtom(store.selectedToolAtom);
  const [, setPenState] = useAtom(store.penStateAtom);

  return (
    <div className="relative flex items-center">
      <button
        className="focus:outline-none"
        onClick={() => {
          setPenState((state) => ({
            ...state,
            lineWidth: 4,
            color: undefined,
            opacity: undefined,
          }));
          setSelectedTool((current) => (current === "draw" ? null : "draw"));
        }}
      >
        <Icon
          className="fill-current text-gray-600 hover:text-black"
          path={mdiDraw}
          size={size}
        />
      </button>
      <ButtonIndicator enabled={selectedTool === "draw"} />
    </div>
  );
}

export function HighlightButton({ size }: { size: number | string }) {
  const [selectedTool, setSelectedTool] = useAtom(store.selectedToolAtom);
  const [, setPenState] = useAtom(store.penStateAtom);

  return (
    <div className="relative flex items-center">
      <button
        className="focus:outline-none"
        onClick={() => {
          setPenState((state) => ({
            ...state,
            lineWidth: 36,
            color: "yellow",
            opacity: 0.2,
          }));
          setSelectedTool((current) => (current === "draw" ? null : "draw"));
        }}
      >
        <Icon
          className="fill-current text-gray-600 hover:text-black"
          path={mdiMarker}
          size={size}
        />
      </button>
      <ButtonIndicator enabled={selectedTool === "draw"} />
    </div>
  );
}

export function EraseButton({ size }: { size: number | string }) {
  const [selectedTool, setSelectedTool] = useAtom(store.selectedToolAtom);

  return (
    <div className="relative flex items-center">
      <button
        className="focus:outline-none"
        onClick={() =>
          setSelectedTool((current) => (current === "erase" ? null : "erase"))
        }
      >
        <Icon
          className="fill-current text-gray-600 hover:text-black"
          path={mdiEraserVariant}
          size={size}
        />
      </button>
      <ButtonIndicator enabled={selectedTool === "erase"} />
    </div>
  );
}

export function BrushButton({ size }: { size: number | string }) {
  const [selectedTool, setSelectedTool] = useAtom(store.selectedToolAtom);

  return (
    <div className="relative flex items-center">
      <button
        className="focus:outline-none"
        onClick={() =>
          setSelectedTool((current) => (current === "brush" ? null : "brush"))
        }
      >
        <Icon
          className="fill-current text-gray-600 hover:text-black"
          path={mdiBrushVariant}
          size={size}
        />
      </button>
      <ButtonIndicator enabled={selectedTool === "brush"} />
    </div>
  );
}
