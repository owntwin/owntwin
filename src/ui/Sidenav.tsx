import { mdiHelpCircleOutline, mdiAccountGroup, mdiFullscreen } from "@mdi/js";

import DiscussInput from "../addon/discuss/components/Input";
import DiscussButton from "../addon/discuss/components/Button";
import { DrawButton, EraseButton } from "../addon/draw/components/Button";

const addons = import.meta.env.VITE_ADDONS
  ? import.meta.env.VITE_ADDONS.split(",")
  : [];

function Sidenav({ communityURL, ...props }: { communityURL?: string }) {
  const HELP_URL = "https://beta.owntwin.com/docs/about";

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto flex items-center h-10">
      <div className="flex items-center">
        <a href={HELP_URL} target="_blank" rel="noreferrer">
          <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24">
            <path fill="#000000" d={mdiHelpCircleOutline} />
          </svg>
        </a>
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
