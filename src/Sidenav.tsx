import "styled-components/macro";
import { mdiHelpCircleOutline, mdiAccountGroup, mdiFullscreen } from "@mdi/js";
import tw from "twin.macro";

import DiscussInput from "./addon/discuss/components/Input";
import DiscussButton from "./addon/discuss/components/Button";
import DrawButton from "./addon/draw/components/Button";

const addons = import.meta.env.VITE_ADDONS
  ? import.meta.env.VITE_ADDONS.split(",")
  : [];

function Sidenav({ communityURL, ...props }) {
  const HELP_URL = "https://beta.owntwin.com/docs/about";

  return (
    <div
      css={[
        tw`fixed bottom-4 left-4 right-4 sm:right-auto flex items-center h-10`,
      ]}
    >
      <div css={[tw`flex items-center`]}>
        <a href={HELP_URL} target="_blank" rel="noreferrer">
          <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24">
            <path fill="#000000" d={mdiHelpCircleOutline} />
          </svg>
        </a>
      </div>
      {!!communityURL && (
        <div css={[tw`ml-3 flex items-center`]}>
          <a href={communityURL} target="_blank" rel="noreferrer">
            <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24">
              <path fill="#000000" d={mdiAccountGroup} />
            </svg>
          </a>
        </div>
      )}
      <div css={[tw`ml-3 flex items-center`]}>
        <button
          css={[tw`focus:outline-none`]}
          onClick={() => {
            const requestFullscreen =
              document.body.requestFullscreen ||
              document.body.webkitRequestFullscreen;
            requestFullscreen.call(document.body);
          }}
        >
          <svg style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24">
            <path fill="#000000" d={mdiFullscreen} />
          </svg>
        </button>
      </div>
      {addons.includes("draw") && (
        <div css={[tw`ml-3 flex items-center relative`]}>
          <DrawButton width="24px" height="24px" />
        </div>
      )}
      {addons.includes("discuss") && (
        <>
          <div css={[tw`ml-3 flex items-center relative`]}>
            <DiscussButton width="24px" height="24px" />
          </div>
          <div
            css={[
              tw`absolute sm:static bottom-14 sm:bottom-auto w-full sm:w-auto sm:ml-3 flex items-center`,
            ]}
          >
            <DiscussInput />
          </div>
        </>
      )}
    </div>
  );
}

export default Sidenav;
