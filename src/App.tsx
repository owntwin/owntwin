import { useEffect, useRef, useState } from "react";
import { Transition } from "react-transition-group";
import clsx from "clsx";

import { useAtom } from "jotai";
import * as store from "./lib/store";

import { Helmet } from "react-helmet-async";
import axios from "axios";

import ModelView from "./ModelView";
import DetailView from "./DetailView";
import Sidenav from "./ui/Sidenav";
import ItemInfo from "./ui/ItemInfo";
import Clock from "./ui/Clock";
import ExportButton from "./ui/ExportButton";

import "./App.css";
import { mdiArrowLeftThinCircleOutline, mdiCloseCircle } from "@mdi/js";

import { model as defaultModel } from "./model";
import { Definition, Model, Layer } from "./types";

// const DEBUG = false;

async function getModel(): Promise<Partial<Model>> {
  let basePath, path;

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  // TODO: Debug only
  if (params.has("twin")) {
    basePath = params.get("twin");
    if (typeof basePath !== "string") return {};
    path = new URL("./twinmodel.json", basePath).toString();
  } else {
    basePath = null;
    path = "./twinmodel.json";
  }
  let modelData = await axios
    .get(path)
    .then((resp) => resp.data)
    .catch(() => defaultModel);

  let model = modelData;

  model._basePath = basePath;

  if (params.has("no-terrain")) {
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

function Debug() {
  const [debugOpen, setDebugOpen] = useState(false);
  const [debug, setDebug] = useAtom(store.debugAtom);

  useEffect(() => {
    if (!!debug) setDebugOpen(true);
  }, [debug]);

  return (
    <div
      id="debug"
      className={clsx(
        "rounded-t-md bg-gray-800 text-white fixed bottom-0 left-0 right-0 h-48 p-4 text-sm shadow-md",
        debugOpen ? "block" : "hidden",
      )}
    >
      <div
        className="absolute top-4 right-4 cursor-pointer"
        onClick={() => {
          setDebugOpen(false);
          setDebug("");
        }}
      >
        <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
          <path fill="#eee" d={mdiCloseCircle} />
        </svg>
      </div>
      <div className="overflow-y-scroll w-full h-full">{debug}</div>
    </div>
  );
}

function App() {
  const [model, setModel] = useState<Partial<Model>>({
    id: undefined,
    name: undefined,
    type: undefined,
    iri: undefined,
    description: undefined,
    modules: [],
  });
  const [modelLoaded, setModelLoaded] = useState(false);

  const [, setLayersState] = useAtom(store.layersStateAtom);
  const [, setField] = useAtom(store.fieldAtom);

  const [entity, setEntity] = useAtom(store.entityAtom);
  const [detailEntity, setDetailEntity] = useAtom(store.detailEntityAtom);
  const [item, setItem] = useState({});

  useEffect(() => {
    (async () => {
      let model = await getModel();
      setModel(model);
      setField((current) => ({ ...current, bbox: model.bbox }));
      setModelLoaded(true);
    })();
  }, []);

  useEffect(() => {
    setLayersState(() => {
      const acc: Partial<Layer> = {};

      if (!model.modules) return acc;

      // TODO: Refactoring
      Object.entries(model.modules).forEach(([id, module]) => {
        const layers = module.definition.layers || [];
        layers.forEach((layer) => {
          acc[`${layer.id}`] = {
            enabled:
              model.properties &&
              (model.properties[`${id}:layers.${layer.id}.enabled`] || false),
          };
        });
      });

      return acc;
    });
  }, [setLayersState, model.modules, model.properties]);

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
    <div
      id="App"
      className={clsx("App", "fixed top-0 bottom-0 left-0 right-0")}
    >
      <Helmet>{model.name && <title>{model.name} - OwnTwin</title>}</Helmet>
      {/* <div
        className={clsx(
          "absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center text-sm text-gray-400 pointer-events-none",
          !detailEntity ? "flex" : "hidden",
        )}
      >
        <div>表示されない場合は再読み込み</div>
      </div> */}
      <div
        className={clsx(
          "absolute top-0 bottom-0 left-0 right-0",
          !detailEntity ? "block" : "hidden",
        )}
      >
        {modelLoaded && <ModelView model={model} basePath={model._basePath} />}
      </div>
      <Transition nodeRef={transitionRef} in={!!detailEntity} timeout={1}>
        {(state) => (
          <div
            ref={transitionRef}
            className={clsx(
              "detail-view",
              "absolute top-0 bottom-0 left-0 right-0",
              ["entering", "entered"].includes(state) ? "block" : "hidden",
            )}
          >
            <div
              className={clsx(
                "w-full h-full",
                state === "entered" ? "block" : "hidden",
              )}
            >
              {modelLoaded && (
                <DetailView
                  model={model}
                  type={"building"}
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
          modules={model.modules || []}
          properties={model.properties}
          back={
            detailEntity && (
              <div
                className="text-sm text-gray-600 px-2 py-2 cursor-pointer flex items-center bg-gray-50 hover:bg-gray-100"
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
                <div className="mr-1">
                  <svg
                    style={{ width: "18px", height: "18px" }}
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
      <Debug />
      <div className="absolute top-4 left-auto right-4 hidden sm:flex gap-2 h-10">
        <ExportButton iri={model.iri} />
        <Clock />
      </div>
      {modelLoaded && <Sidenav communityURL={model.community} />}
      <a href="//beta.owntwin.com" className="cursor-pointer">
        <div
          className={clsx(
            "logo",
            "absolute bottom-4 left-auto right-4 opacity-75 font-bold text-white bg-gray-500 rounded px-3 py-2",
          )}
        >
          <div>OwnTwin</div>
        </div>
      </a>
    </div>
  );
}

export default App;
