import { useEffect, useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Toolbar from "@radix-ui/react-toolbar";

import {
  mdiHelpCircleOutline,
  mdiAccountGroup,
  mdiFullscreen,
  mdiCursorPointer,
  mdiCursorMove,
} from "@mdi/js";
import { Icon } from "@mdi/react";

import DiscussInput from "../addon/discuss/components/Input";
import DiscussButton from "../addon/discuss/components/Button";
import {
  // BrushButton,
  DrawButton,
  EraseButton,
} from "../addon/draw/components/Button";

import { useAtom } from "jotai";
import * as appStore from "../lib/store";
import * as drawStore from "../addon/draw/store";

import { testTouch } from "../lib/util";

import { Z_INDEX } from "../lib/constants";

const addons = import.meta.env.VITE_ADDONS
  ? import.meta.env.VITE_ADDONS.split(",")
  : [];

function HelpMenuButton() {
  const HELP_URL = "https://beta.owntwin.com/docs/about";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {/* <a href={HELP_URL} target="_blank" rel="noreferrer"> */}
        {/* <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24">
            <path fill="#000000" d={mdiHelpCircleOutline} />
          </svg> */}
        <button className="focus-visible:outline-none">
          <Icon
            path={mdiHelpCircleOutline}
            size="24px"
            className="fill-current hover:text-gray-500"
          />
        </button>
        {/* </a> */}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="border shadow-sm rounded-md bg-white mx-2 px-0 py-1"
          sideOffset={5}
        >
          <DropdownMenu.Item asChild>
            <a
              href="./twinmodel.json"
              target="_blank"
              rel="noopener"
              className="block w-32 text-sm px-4 py-2 hover:bg-gray-100 focus-visible:outline-none"
            >
              定義ファイルを開く
            </a>
          </DropdownMenu.Item>
          {/* <DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 focus-visible:outline-none">
            ライセンス・権利情報
          </DropdownMenu.Item> */}
          <DropdownMenu.Item asChild>
            <a
              href={HELP_URL}
              target="_blank"
              rel="noopener"
              className="block w-32 text-sm px-4 py-2 hover:bg-gray-100 focus-visible:outline-none"
            >
              ヘルプ
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Arrow className="fill-current text-gray-200" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function FullscreenButton() {
  return (
    <button
      className="focus:outline-none"
      onClick={() => {
        const requestFullscreen =
          document.body.requestFullscreen ||
          (document.body as any).webkitRequestFullscreen;
        requestFullscreen.call(document.body);
      }}
    >
      <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24">
        <path fill="#000000" d={mdiFullscreen} />
      </svg>
    </button>
  );
}

function CursorControlButton({
  size,
  className,
  ...props
}: {
  size: number | string;
  className?: string;
}) {
  const [, setSelectedTool] = useAtom(drawStore.selectedToolAtom);

  return (
    <button
      className={`focus:outline-none ${className}`}
      onClick={() => {
        setSelectedTool(null);
      }}
      {...props}
    >
      <Icon
        className="fill-current text-gray-600 hover:text-black"
        path={mdiCursorPointer}
        size={size}
      />
    </button>
  );
}

function CursorMoveButton({
  size,
  className,
  as = "button",
  ...props
}: {
  size: number | string;
  className?: string;
  as?: "button" | "div";
}) {
  const [, setControlsState] = useAtom(appStore.controlsStateAtom);

  return (
    <button
      className={`focus:outline-none ${className}`}
      onClick={() => {
        setControlsState((state) => {
          return Object.assign(state, { truckMode: !state.truckMode });
        });
      }}
      {...props}
    >
      <Icon
        className="fill-current text-gray-600 hover:text-black"
        path={mdiCursorMove}
        size={size}
      />
    </button>
  );
}

function InteractionToolbar() {
  const [value, setValue] = useState("cursor-control");
  const [selectedTool, setSelectedTool] = useAtom(drawStore.selectedToolAtom);
  const [, setControlsState] = useAtom(appStore.controlsStateAtom);

  const isTouch = useMemo(() => testTouch(), []);

  // TODO: ensure performance
  useEffect(() => {
    if (selectedTool !== null && !["draw", "erase"].includes(value)) {
      setSelectedTool(null);
    }
    if (
      (selectedTool === null &&
        !["cursor-control", "cursor-move"].includes(value)) ||
      !value
    ) {
      setValue("cursor-control");
    }
    // TODO: performance fix
    if (value !== "cursor-move") {
      setControlsState((state) => {
        return Object.assign(state, { truckMode: false });
      });
    }
  }, [value, selectedTool]);

  // TODO: fix invalid button inside button
  // TODO: toggle cursor mode depending modifier keys
  return (
    <Toolbar.Root>
      <Toolbar.ToggleGroup
        type="single"
        className="ml-3 flex items-center relative gap-1.5 bg-white rounded-full border px-3 py-1 h-9"
        value={value}
        onValueChange={(value) => {
          setValue(value);
        }}
      >
        <Toolbar.ToggleItem
          value="cursor-control"
          className="hover:border-b-2 radix-state-on:border-b-2 relative flex items-center px-[2px] py-[1px]"
        >
          <CursorControlButton size="22px" />
        </Toolbar.ToggleItem>
        {!isTouch && (
          <Toolbar.ToggleItem
            value="cursor-move"
            className="hover:border-b-2 radix-state-on:border-b-2 relative flex items-center px-[2px] py-[1px]"
          >
            <CursorMoveButton size="22px" />
          </Toolbar.ToggleItem>
        )}
        {addons.includes("draw") && (
          <>
            <Toolbar.ToggleItem
              value="draw"
              className="hover:border-b-2 radix-state-on:border-b-2"
            >
              <DrawButton size="24px" />
            </Toolbar.ToggleItem>
            <Toolbar.ToggleItem
              value="erase"
              className="hover:border-b-2 radix-state-on:border-b-2"
            >
              <EraseButton size="24px" />
            </Toolbar.ToggleItem>
          </>
        )}
      </Toolbar.ToggleGroup>
    </Toolbar.Root>
  );
}

function Sidenav({ communityURL, ...props }: { communityURL?: string }) {
  const [isFullscreenAvailable, setIsFullscreenAvailable] = useState(true);

  useEffect(() => {
    // NOTE: fullscreen is unavailable on iPhone; what about on Android?
    setIsFullscreenAvailable(document.fullscreenEnabled);
  }, []);

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:right-auto flex items-center h-10"
      style={{ zIndex: Z_INDEX.sidenav }}
    >
      <div className="flex items-center">
        <HelpMenuButton />
      </div>
      {!!communityURL && (
        <div className="ml-3 flex items-center">
          <a href={communityURL} target="_blank" rel="noreferrer">
            <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24">
              <path fill="#000000" d={mdiAccountGroup} />
            </svg>
          </a>
        </div>
      )}
      {isFullscreenAvailable && (
        <div className="ml-3 flex items-center">
          <FullscreenButton />
        </div>
      )}
      <InteractionToolbar />
      {/* {addons.includes("draw") && (
        <div className="ml-3 flex items-center relative gap-1.5 bg-white/75 rounded-full border px-3 py-1">
          <DrawButton size="24px" />
          // <BrushButton size="24px" />
          <EraseButton size="24px" />
        </div>
      )} */}
      {addons.includes("discuss") && (
        <>
          <div className="ml-3 flex items-center relative">
            <DiscussButton width="24px" height="24px" />
          </div>
          <div className="absolute sm:static bottom-14 sm:bottom-auto w-full sm:w-auto sm:ml-3 flex items-center">
            <DiscussInput />
          </div>
        </>
      )}
    </div>
  );
}

export default Sidenav;
