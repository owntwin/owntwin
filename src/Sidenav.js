import 'styled-components/macro';
// import { useState } from 'react';
import { mdiHelpCircleOutline, mdiAccountGroup, mdiFullscreen } from '@mdi/js';
import tw from 'twin.macro';

function Sidenav({ communityURL, ...props }) {
  const HELP_URL = 'https://beta.owntwin.com/docs/about';

  return (
    <div css={[tw`fixed bottom-4 left-4 flex items-center h-10`]}>
      <div css={[tw`mr-3 flex items-center`]}>
        <a href={HELP_URL} target="_blank" rel="noreferrer">
          <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
            <path fill="#000000" d={mdiHelpCircleOutline} />
          </svg>
        </a>
      </div>
      {!!communityURL && (
        <div css={[tw`mr-3 flex items-center`]}>
          <a href={communityURL} target="_blank" rel="noreferrer">
            <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
              <path fill="#000000" d={mdiAccountGroup} />
            </svg>
          </a>
        </div>
      )}
      <div css={[tw`flex items-center`]}>
        <button
          css={[tw`focus:outline-none`]}
          onClick={() => {
            const requestFullscreen =
              document.body.requestFullscreen ||
              document.body.webkitRequestFullscreen;
            requestFullscreen.call(document.body);
          }}
        >
          <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
            <path fill="#000000" d={mdiFullscreen} />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Sidenav;
