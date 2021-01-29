import {
  // useEffect,
  useState,
} from 'react';

import { useAtom } from 'jotai';
import * as store from './lib/store';

import tw from 'twin.macro';

function ModulePane({ module, isOpen, ...props }) {
  const [paneOpen, setPaneOpen] = useState(isOpen || false);
  const [layersState, setLayersState] = useAtom(store.layersStateAtom);

  const layers = module.layers;
  const filters = [],
    guides = [];

  return (
    <div css={[tw`border-b`]}>
      <div
        css={[tw`px-3 py-2 cursor-pointer hover:bg-blue-100 flex`]}
        onClick={(ev) => {
          setPaneOpen(!paneOpen);
        }}
      >
        <div css={[tw`flex-grow`]}>{module.name}</div>
        <div>?</div>
      </div>
      {paneOpen && (
        <div css={[tw`px-3 pb-3 text-sm`]}>
          <div css={[tw`mb-2`]}>
            <div css={[tw`my-1`]}>レイヤー</div>
            <ul>
              {layers.length > 0 ? (
                layers.map((item, i) => {
                  return (
                    <li key={i}>
                      <input
                        css={[tw`mr-1`]}
                        type="checkbox"
                        checked={layersState[item.id].enabled}
                        onChange={(ev) => {
                          setLayersState((state) => {
                            state[item.id].enabled = !state[item.id].enabled;
                            return Object.assign({}, state);
                          });
                        }}
                      />
                      {item.name}
                    </li>
                  );
                })
              ) : (
                <li>
                  <span css={[tw`text-gray-600`]}>未登録</span>
                </li>
              )}
            </ul>
          </div>
          <div css={[tw`mb-2`]}>
            <div css={[tw`my-1`]}>フィルター</div>
            <ul>
              {filters.length > 0 ? (
                filters.map((item, i) => (
                  <li key={i}>
                    <span css={[tw`text-gray-600`]}>{item.name}</span>
                  </li>
                ))
              ) : (
                <li>
                  <span css={[tw`text-gray-600`]}>未登録</span>
                </li>
              )}
            </ul>
          </div>
          <div css={[tw`mb-2`]}>
            <div css={[tw`my-1`]}>ガイド</div>
            <ul>
              {guides.length > 0 ? (
                guides.map((item, i) => (
                  <li key={i}>
                    <span css={[tw`text-gray-600`]}>{item.name}</span>
                  </li>
                ))
              ) : (
                <li>
                  <span css={[tw`text-gray-600`]}>未登録</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Drawer({ isOpen, item, modules, ...props }) {
  return (
    <div
      style={{ width: '20rem', left: isOpen ? '0' : '-100%' }}
      css={[
        tw`top-0 left-0 fixed h-full overflow-auto z-30 bg-white
  transition-all ease-in-out duration-300 transform`,
      ]}
    >
      <div css={[tw`py-2`]}>
        <div css={[tw`px-2 py-1 border-b text-xs text-gray-800`]}>
          モジュール
        </div>
        {Object.entries(modules).map(([id, module]) => (
          <ModulePane key={id} module={module} />
        ))}
      </div>
    </div>
  );
}

export default Drawer;
