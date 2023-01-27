import { useEffect, useState } from "react";

import "./App.css";

import clsx from "clsx";

import { useAtom } from "jotai";
import * as store from "./lib/store";

import { Helmet } from "react-helmet-async";
import axios from "axios";

import Sidenav from "./ui/Sidenav";
import ItemInfo from "./ui/ItemInfo";
import Clock from "./ui/Clock";
import ExportButton from "./ui/ExportButton";

import ModelView from "./components/ModelView";
import Debug from "./components/Debug";

import { model as defaultModel } from "./model";

import type { InternalModel as Model, Layer } from "./core";

async function getModel(): Promise<{
  model: Partial<Model> | null;
  basePath: string | null;
}> {
  let basePath, path;

  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  // TODO: debug only
  if (params.has("twin")) {
    basePath = params.get("twin");
    if (typeof basePath !== "string") return { model: null, basePath: null };
    path = new URL("./twin.json", basePath).toString();
  } else {
    basePath = null;
    path = "./twin.json";
  }
  const model = await axios
    .get(path)
    .then((resp) => resp.data)
    .catch(() => defaultModel);

  model.bbox = {
    minlng: model.bbox[0],
    minlat: model.bbox[1],
    maxlng: model.bbox[2],
    maxlat: model.bbox[3],
  };

  return { model, basePath };
}

function App() {
  const [model, setModel] = useState<Partial<Model>>({
    id: undefined,
    displayName: undefined,
    type: undefined,
    description: undefined,
  });
  const [basePath, setBasePath] = useState<string>();
  const [modelLoaded, setModelLoaded] = useState(false);

  const [, setLayers] = useAtom(store.layersAtom);
  const [, setLayersState] = useAtom(store.layersStateAtom);
  const [, setField] = useAtom(store.fieldAtom);

  useEffect(() => {
    (async () => {
      const { model, basePath } = await getModel();
      if (!model) return;
      setModel(model);
      basePath && setBasePath(basePath);
      model.bbox && setField((current) => ({ ...current, bbox: model.bbox }));
      setModelLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!model.layers) return;
    const layers = model.layers.reduce((prev, curr) => {
      return {
        ...prev,
        [curr.id]: curr,
      };
    }, {});
    setLayers(layers);
  }, [model.layers]);

  useEffect(() => {
    setLayersState(() => {
      const newState: Partial<Layer> = {};

      if (!model.layers) return newState;

      // TODO: Refactoring
      model.layers.forEach((layer) => {
        newState[layer.id] = {
          ...(newState[layer.id] || {}),
          enabled: layer.enabled === undefined ? true : layer.enabled,
        };
      });

      return newState;
    });
  }, [model.layers]);

  const [, updateEntityStore] = useAtom(store.entityStoreAtom);

  useEffect(() => {
    if (!model.entities) return;
    const entities = model.entities;
    updateEntityStore((store) => {
      const storeFragment: typeof store = {};
      Object.entries(entities).forEach(([id, v]) => {
        const entry = {
          ...(store[id] || {}),
          ...v,
        };
        storeFragment[id] = entry;
      });
      return {
        ...store,
        ...storeFragment,
      };
    });
  }, [model.entities]);

  return (
    <div
      id="App"
      className={clsx("App", "fixed top-0 bottom-0 left-0 right-0")}
    >
      <Helmet>
        {model.displayName && <title>{model.displayName} - OwnTwin</title>}
      </Helmet>
      <div className="absolute top-0 bottom-0 left-0 right-0">
        {modelLoaded && <ModelView model={model} basePath={basePath} />}
      </div>
      {modelLoaded && (
        <ItemInfo
          displayName={model.displayName}
          type={model.type}
          homepage={model.homepage}
          description={model.description}
          properties={model.properties}
          actions={model.actions}
          layers={model.layers}
        />
      )}
      <Debug />
      <div className="absolute top-4 left-auto right-4 hidden sm:flex gap-2 h-10">
        <ExportButton homepage={model.homepage} />
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
