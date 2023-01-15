import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { mdiHelpCircleOutline, mdiAccountGroup, mdiFullscreen } from "@mdi/js";
import { Icon } from "@mdi/react";

import DiscussInput from "../addon/discuss/components/Input";
import DiscussButton from "../addon/discuss/components/Button";
import {
  // BrushButton,
  DrawButton,
  EraseButton,
} from "../addon/draw/components/Button";

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
              href="./twin.json"
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

function Sidenav({ communityURL, ...props }: { communityURL?: string }) {
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
      <div className="ml-3 flex items-center">
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
      </div>
      {addons.includes("draw") && (
        <div className="ml-3 flex items-center relative gap-1.5 bg-white/75 rounded-full border px-3 py-1">
          <DrawButton size="24px" />
          {/* <BrushButton size="24px" /> */}
          <EraseButton size="24px" />
        </div>
      )}
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
