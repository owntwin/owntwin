import { useEffect, useRef, useState } from 'react';
import { Transition } from 'react-transition-group';

import { useAtom } from 'jotai';
import * as store from './lib/store';

import axios from 'axios';

import ModelView from './ModelView';
import Sidenav from './Sidenav';
import ItemInfo from './ItemInfo';
import Clock from './Clock';
import DetailView from './DetailView';

import tw from 'twin.macro';
import './App.css';
import { mdiArrowLeftThinCircleOutline, mdiCloseCircle } from '@mdi/js';

import { model as defaultModel } from './model';

// const DEBUG = false;

async function getModel() {
  let model, basePath, path;
  const url = new URL(window.location);
  const params = new URLSearchParams(url.search);
  // TODO: Debug only
  if (params.has('twin')) {
    basePath = params.get('twin');
    path = new URL('./twin.json', basePath);
  } else {
    basePath = null;
    path = './twin.json';
  }
  model = await axios
    .get(path)
    .then((resp) => resp.data)
    .catch(() => defaultModel);
  model._basePath = basePath;

  if (params.has('no-terrain')) {
    model.terrain = null;
  }

  model.bbox = {
    minlng: model.bbox[0],
    minlat: model.bbox[1],
    maxlng: model.bbox[2],
    maxlat: model.bbox[3],
  };

  return model;
}

function App() {
  const [model, setModel] = useState({
    id: null,
    name: null,
    type: null,
    iri: null,
    description: null,
    modules: [],
  });
  const [modelLoaded, setModelLoaded] = useState(false);

  const [, setLayersState] = useAtom(store.layersStateAtom);

  const [entity, setEntity] = useAtom(store.entityAtom);
  const [detailEntity, setDetailEntity] = useAtom(store.detailEntityAtom);
  const [item, setItem] = useState({});

  const [debugOpen, setDebugOpen] = useState(false);
  const [debug, setDebug] = useAtom(store.debugAtom);

  useEffect(() => {
    (async () => {
      let model = await getModel();
      setModel(model);
      setModelLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!!debug) setDebugOpen(true);
  }, [debug]);

  useEffect(() => {
    setLayersState(() => {
      return Object.values(model.modules)
        .reduce((acc, module) => acc.concat(module.layers), [])
        .reduce((acc, layer) => {
          acc[`${layer.id}`] = { enabled: layer.enabled };
          return acc;
        }, {});
    });
  }, [setLayersState, model.modules]);

  useEffect(() => {
    !entity && model && model.id && setEntity(model);
    if (!entity) return;
    setItem({
      name: entity.name,
      type: entity.type_label || entity.type,
      iri: entity.iri,
      description: entity.description,
    });
  }, [entity, setEntity, model]);

  const transitionRef = useRef(null);

  return (
    <div className="App">
      <div
        style={{ display: !detailEntity ? 'block' : 'none' }}
        css={[tw`absolute top-0 bottom-0 left-0 right-0`]}
      >
        {modelLoaded && <ModelView model={model} basePath={model._basePath} />}
      </div>
      <Transition nodeRef={transitionRef} in={!!detailEntity} timeout={1}>
        {(state) => (
          <div
            ref={transitionRef}
            className="detail-view"
            css={[
              tw`absolute top-0 bottom-0 left-0 right-0`,
              ['entering', 'entered'].includes(state) ? tw`block` : tw`hidden`,
            ]}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                display: state === 'entered' ? 'block' : 'none',
              }}
            >
              {modelLoaded && (
                <DetailView
                  model={model}
                  type={'building'}
                  entity={detailEntity}
                />
              )}
            </div>
          </div>
        )}
      </Transition>
      {modelLoaded && (
        <ItemInfo
          name={item.name}
          type={item.type}
          iri={item.iri}
          item={item}
          modules={model.modules}
          back={
            detailEntity && (
              <div
                css={[
                  tw`text-sm text-gray-600 px-2 py-2 cursor-pointer flex items-center bg-gray-50 hover:bg-gray-100`,
                ]}
                onClick={(ev) => {
                  ev.stopPropagation();
                  if (detailEntity.id === entity.id) {
                    setDetailEntity(null);
                    setEntity(null);
                  } else {
                    setEntity(detailEntity);
                  }
                }}
              >
                <div css={[tw`mr-1`]}>
                  <svg
                    style={{ width: '18px', height: '18px' }}
                    viewBox="0 0 24 24"
                  >
                    <path fill="#888" d={mdiArrowLeftThinCircleOutline} />
                  </svg>
                </div>
                <div>戻る</div>
              </div>
            )
          }
        />
      )}
      <div
        id="debug"
        css={[
          tw`rounded-t-md bg-gray-800 text-white fixed bottom-0 left-0 right-0 h-48 p-4 text-sm shadow-md`,
          debugOpen ? tw`block` : tw`hidden`,
        ]}
      >
        <div
          css={[tw`absolute top-4 right-4 cursor-pointer`]}
          onClick={() => {
            setDebugOpen(false);
            setDebug('');
          }}
        >
          <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
            <path fill="#eee" d={mdiCloseCircle} />
          </svg>
        </div>
        <div css={[tw`overflow-y-scroll w-full h-full`]}>{debug}</div>
      </div>
      <div css={[tw`absolute top-4 left-auto right-4 hidden sm:block`]}>
        <Clock />
      </div>
      {modelLoaded && <Sidenav communityURL={model.community} />}
      <a href="//beta.owntwin.com" css={[tw`cursor-pointer`]}>
        <div
          className="logo"
          css={[
            tw`absolute bottom-4 left-auto right-4 opacity-75 font-bold text-white bg-gray-500 rounded px-3 py-2`,
          ]}
        >
          <div>OwnTwin</div>
        </div>
      </a>
    </div>
  );
}

export default App;
