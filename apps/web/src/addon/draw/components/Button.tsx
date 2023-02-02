import { useEffect, useState } from "react";

import clsx from "clsx";

import { Icon } from "@mdi/react";
import { mdiBrushVariant, mdiDraw, mdiEraserVariant, mdiMarker } from "@mdi/js";

import * as Popover from "@radix-ui/react-popover";
import * as ToggleGroup from "@radix-ui/react-toggle-group";

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

function ColorOption({ color, ...props }: { color: string }) {
  return (
    <button
      className="hover:bg-gray-50 radix-state-on:bg-blue-50 w-9 h-9 flex items-center justify-center"
      {...props}
    >
      <div className={`w-6 h-6 rounded-full border ${color}`} />
    </button>
  );
}

export function DrawButton({
  size,
  onClick,
  ...props
}: {
  size: number | string;
  onClick?: Function;
}) {
  const [selectedTool, setSelectedTool] = useAtom(store.selectedToolAtom);
  const [, setPenState] = useAtom(store.penStateAtom);

  const [open, setOpen] = useState(false);
  const [popoverLeaving, setPopoverLeaving] = useState(false);
  const [lineWidth, setLineWidth] = useState<number>(4);
  const [color, setColor] = useState<any>(undefined);

  const colorOptions = [
    { color: "black", style: "bg-black" },
    { color: "gray", style: "bg-gray-400" },
    { color: "yellow", style: "bg-yellow-400" },
    { color: "red", style: "bg-red-400" },
    { color: "blue", style: "bg-blue-400" },
    { color: "green", style: "bg-green-400" },
  ];

  useEffect(() => {
    setPenState((state) => ({
      ...state,
      lineWidth,
      color,
      opacity: undefined,
    }));
  }, [lineWidth, color]);

  return (
    <Popover.Root open={open}>
      <Popover.Trigger asChild>
        <button
          {...props}
          aria-label="Draw options"
          onClick={(ev) => {
            onClick && onClick(ev); // From asChild
            if (popoverLeaving) {
              setPopoverLeaving(false);
            } else {
              setOpen((current) => !current);
            }
            setPenState((state) => ({
              ...state,
              lineWidth,
              color,
              opacity: undefined,
            }));
            // setSelectedTool((current) => (current === "draw" ? null : "draw"));
          }}
        >
          <Icon
            className="fill-current text-gray-600 hover:text-black"
            path={mdiDraw}
            size={size}
          />
          <ButtonIndicator enabled={selectedTool === "draw"} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white border rounded-md shadow-sm"
          sideOffset={7}
          onInteractOutside={(ev) => {
            if (open) {
              setPopoverLeaving(true);
              setOpen(false);
            }
          }}
        >
          <div className="flex">
            <ToggleGroup.Root
              type="single"
              defaultValue="4"
              value={lineWidth.toString()}
              asChild
              onValueChange={(value) => {
                // console.log(value);
                value && setLineWidth(parseFloat(value));
              }}
            >
              <div className="flex">
                <ToggleGroup.Item value="0.5" aria-label={color} asChild>
                  <button className="hover:bg-gray-50 radix-state-on:bg-blue-50 w-9 h-9 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                  </button>
                </ToggleGroup.Item>
                <ToggleGroup.Item value="4" aria-label={color} asChild>
                  <button className="hover:bg-gray-50 radix-state-on:bg-blue-50 w-9 h-9 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  </button>
                </ToggleGroup.Item>
              </div>
            </ToggleGroup.Root>
            <ToggleGroup.Root
              type="single"
              defaultValue="black"
              value={color}
              asChild
              onValueChange={(value) => {
                // console.log(value);
                value && setColor(value);
              }}
            >
              <div className="flex border-l-2 border-gray-100">
                {colorOptions.map(({ color, style }) => (
                  <ToggleGroup.Item
                    key={color}
                    value={color}
                    aria-label={color}
                    asChild
                  >
                    <ColorOption color={style} />
                  </ToggleGroup.Item>
                ))}
              </div>
            </ToggleGroup.Root>
          </div>
          <Popover.Arrow className="fill-gray-200" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
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
