import 'styled-components/macro';
import { useEffect } from 'react';
import {
  mdiHelpCircleOutline,
  mdiAccountGroup,
  mdiFullscreen,
  mdiCommentTextMultipleOutline,
} from '@mdi/js';
import tw from 'twin.macro';

import { useAtom } from 'jotai';

import Input from './addon/discuss/components/Input';
import * as discussStore from './addon/discuss/store';

const addons = process.env.REACT_APP_ADDONS
  ? process.env.REACT_APP_ADDONS.split(',')
  : [];

function DiscussButton({ width, height, ...props }) {
  const [enabled, setEnabled] = useAtom(discussStore.enabledAtom);
  const [status] = useAtom(discussStore.statusAtom);

  useEffect(() => {}, [enabled]);

  const indicatorStyles = {
    CONNECTED: tw`bg-blue-400`,
    ERROR: tw`bg-red-400`,
  };

  return (
    <>
      <button
        css={[tw`focus:outline-none`]}
        onClick={() => setEnabled(!enabled)}
      >
        <svg style={{ width, height }} viewBox="0 0 24 24">
          <path fill="#000000" d={mdiCommentTextMultipleOutline} />
        </svg>
      </button>
      {(enabled || status === 'ERROR') && (
        <span css={[tw`flex absolute h-3 w-3 top-0 right-0 -mt-1 -mr-1`]}>
          <span
            css={[
              tw`absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75`,
              indicatorStyles[status],
            ]}
          ></span>
        </span>
      )}
    </>
  );
}

function Sidenav({ communityURL, ...props }) {
  const HELP_URL = 'https://beta.owntwin.com/docs/about';

  return (
    <div
      css={[
        tw`fixed bottom-4 left-4 right-4 sm:right-auto flex items-center h-10`,
      ]}
    >
      <div css={[tw`flex items-center`]}>
        <a href={HELP_URL} target="_blank" rel="noreferrer">
          <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
            <path fill="#000000" d={mdiHelpCircleOutline} />
          </svg>
        </a>
      </div>
      {!!communityURL && (
        <div css={[tw`ml-3 flex items-center`]}>
          <a href={communityURL} target="_blank" rel="noreferrer">
            <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
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
          <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
            <path fill="#000000" d={mdiFullscreen} />
          </svg>
        </button>
      </div>
      {addons.includes('discuss') && (
        <>
          <div css={[tw`ml-3 flex items-center relative`]}>
            <DiscussButton width="24px" height="24px" />
          </div>
          <div
            css={[
              tw`absolute sm:static bottom-14 sm:bottom-auto w-full sm:w-auto sm:ml-3 flex items-center`,
            ]}
          >
            <Input />
          </div>
        </>
      )}
    </div>
  );
}

export default Sidenav;
