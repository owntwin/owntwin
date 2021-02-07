import { useState } from 'react';

import { useAtom } from 'jotai';
import * as store from './lib/store';

import tw from 'twin.macro';
import {
  // mdiChevronUp, mdiChevronDown,
  mdiMenuUp,
  mdiMenuDown,
  mdiInformationOutline,
  mdiOpenInNew,
} from '@mdi/js';

function getField(entity, key) {
  const splitted = key.split(':', 2);
  if (splitted.length === 2) {
    return entity && entity.properties && entity.properties[key]
      ? encodeURIComponent(entity.properties[key])
      : null;
  } else {
    return entity && entity[key] ? encodeURIComponent(entity[key]) : null;
  }
}

function ModulePane({ id, module, properties, isOpen, ...props }) {
  const [paneOpen, setPaneOpen] = useState(isOpen || false);
  const [moduleInfoOpen, setModuleInfoOpen] = useState(false);

  const [layersState, setLayersState] = useAtom(store.layersStateAtom);
  const [entity] = useAtom(store.entityAtom);

  const definition = module.definition;
  const layers = definition.layers;
  const actions = definition.actions || [];
  const filters = [];

  properties = properties || {};

  return (
    <div css={[tw`border-b`]}>
      <div
        css={[tw`px-3 py-2 cursor-pointer hover:bg-blue-100 flex flex-col`]}
        onClick={(ev) => {
          setPaneOpen(!paneOpen);
        }}
      >
        <div css={[tw`flex items-center`]}>
          <div css={[tw`flex-grow`]}>{definition.name}</div>
          <div css={[tw`flex items-center`]}>
            <div
              css={[tw`rounded p-1 hover:bg-blue-200`]}
              onClick={(ev) => {
                if (paneOpen) {
                  ev.stopPropagation();
                  setModuleInfoOpen(!moduleInfoOpen);
                } else {
                  setModuleInfoOpen(true);
                }
              }}
            >
              <svg
                css={[tw`fill-current text-gray-600`]}
                style={{ width: '18px', height: '18px' }}
                viewBox="0 0 24 24"
              >
                <path d={mdiInformationOutline} />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {paneOpen && (
        <div css={[tw`px-3 pb-3 text-sm`]}>
          {moduleInfoOpen && (
            <div css={[tw`mb-2 mt-1`]}>
              <div css={[tw`my-1`]}>説明</div>
              <div css={[tw`p-2 text-sm bg-gray-100 rounded`]}>
                <pre css={[tw`break-words whitespace-pre-wrap`]}>
                  {definition.description || (
                    <span css={[tw`text-gray-600`]}>未登録</span>
                  )}
                </pre>
              </div>
              <div css={[tw`mt-2 mb-1`]}>利用条件</div>
              <div css={[tw`p-2 text-sm bg-gray-100 rounded`]}>
                <pre css={[tw`break-words whitespace-pre-wrap`]}>
                  {definition.license || (
                    <span css={[tw`text-gray-600`]}>未登録</span>
                  )}
                </pre>
              </div>
            </div>
          )}
          <div css={[tw`mb-2`]}>
            <div css={[tw`my-1`]}>アクション</div>
            <ul>
              {actions.length > 0 ? (
                actions.map((action, i) => {
                  const getProperty = (key) => {
                    return (
                      properties[`${id}:actions.${action.id}.${key}`] ||
                      action[key] ||
                      null
                    );
                  };
                  const missingFields = [];

                  if (!getProperty('href')) {
                    missingFields.push('href');
                  }

                  if (!!action.fields) {
                    action.fields.forEach((field) => {
                      const ok = getField(entity, field) !== null;
                      if (!ok) {
                        missingFields.push(field);
                      }
                    });
                  }

                  function href() {
                    const params = action.fields
                      ? action.fields.map((field) => {
                          const assign_to = getProperty(`fields.assign_to`); // TODO: Fix
                          if (!assign_to) return '';
                          const param = assign_to[field],
                            value = getField(entity, field);
                          if (!param || !value) return '';
                          return `${param}=${value}`;
                        })
                      : [];

                    return `${getProperty('href')}?${
                      action.default_param ? `${action.default_param}&` : ''
                    }${params.join('&')}`;
                  }

                  return (
                    <li key={i}>
                      <a
                        href={href()}
                        onClick={(ev) => {
                          if (missingFields.length > 0) {
                            ev.preventDefault();
                            return false;
                          }
                        }}
                        target="_blank"
                        rel="noreferrer"
                        css={[
                          tw`flex items-center cursor-pointer hover:text-gray-800`,
                        ]}
                      >
                        <svg
                          css={[tw`fill-current text-black mr-0.5`]}
                          style={{ width: '14px', height: '14px' }}
                          viewBox="0 0 24 24"
                        >
                          <path d={mdiOpenInNew} />
                        </svg>
                        <div
                          css={[
                            missingFields.length > 0 ? tw`line-through` : null,
                          ]}
                        >
                          {action.text}
                        </div>
                      </a>
                      {missingFields.length > 0 && (
                        <div
                          css={[
                            tw`bg-gray-500 text-white rounded px-1 py-0.5 mb-0.5 text-xs`,
                          ]}
                        >
                          情報を追加してください:{' '}
                          <code>{missingFields.join(', ')}</code>
                        </div>
                      )}
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
        </div>
      )}
    </div>
  );
}

function ItemInfo({
  name,
  type,
  iri,
  item,
  modules,
  properties,
  isOpen,
  back,
  ...props
}) {
  const [paneOpen, setPaneOpen] = useState(isOpen || false);
  const [helpClicked, setHelpClicked] = useState(false);
  const description = item.description || null;

  return (
    <div
      css={[
        tw`fixed top-4 left-4 flex flex-col bg-white shadow rounded right-4 sm:right-auto sm:w-72`,
        paneOpen ? tw`bottom-20` : tw`bottom-auto`,
      ]}
      style={{ ...props.style, maxHeight: '40rem', zIndex: '20000000' }}
    >
      <div>
        {back}
        <div css={[back ? tw`border-t` : null, tw`py-2 px-3 rounded bg-white`]}>
          <div css={[tw`text-xs`]}>{type}</div>
          <div>{name}</div>
          <div css={[tw`text-xs text-gray-600 break-all`]}>
            {iri ? iri : '未登録'}
          </div>
        </div>
      </div>
      <div
        css={[
          tw`border-t flex justify-center cursor-pointer py-1 hover:bg-gray-100`,
        ]}
        onClick={() => {
          setPaneOpen(!paneOpen);
          !helpClicked && setHelpClicked(true);
        }}
      >
        <div css={[tw`text-xs text-gray-800 flex items-center`]}>
          <svg
            css={[tw`fill-current text-gray-600`]}
            style={{ width: '18px', height: '18px' }}
            viewBox="0 0 24 24"
          >
            <path d={paneOpen ? mdiMenuUp : mdiMenuDown} />
          </svg>
          {!helpClicked && <div>クリックで開く/閉じる</div>}
        </div>
      </div>
      <div
        css={[
          paneOpen ? tw`block` : tw`hidden`,
          tw`flex-grow overflow-y-scroll`,
        ]}
      >
        <div css={[tw`mt-0 px-2 py-1 text-xs text-gray-800`]}>
          インフォメーション
        </div>
        <div css={[tw`border rounded-sm py-2 px-3 m-2 mt-0`]}>
          <div css={[tw`text-sm`, !description && tw`text-gray-600`]}>
            {description ? description : '未登録'}
          </div>
        </div>
        <div css={[tw`py-2`]}>
          <div css={[tw`px-2 py-1 border-b text-xs text-gray-800`]}>
            モジュール
          </div>
          {Object.entries(modules).map(([id, module]) => (
            <ModulePane
              key={id}
              id={id}
              module={module}
              properties={properties}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ItemInfo;
