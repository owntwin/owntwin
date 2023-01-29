import { useEffect, useState } from "react";

import { useAtom } from "jotai";
import * as store from "./store";

import axios from "axios";

// import { Model } from "../core";
import type {
  Model as OTModel,
  InternalModel as Model,
  Layer,
  ElevationMap,
} from "../core";

import { model as defaultModel } from "../model";

type ModelLoad = {
  model: Partial<Model> | null;
  baseUrl: string | null;
};

export function useModelFetch(): ModelLoad {
  const [model, setModel] = useState<Partial<Model>>({});

  const [result, setResult] = useState<ModelLoad>({
    model: null,
    baseUrl: null,
  });

  const [, setField] = useAtom(store.fieldAtom);
  const [, setLayers] = useAtom(store.layersAtom);
  const [, setLayersState] = useAtom(store.layersStateAtom);
  const [, updateEntityStore] = useAtom(store.entityStoreAtom);

  useEffect(() => {
    let baseUrl: string | null, path: string;

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // TODO: debug only
    if (params.has("twin")) {
      baseUrl = params.get("twin");
      if (typeof baseUrl !== "string") return;
      path = new URL("./twin.json", baseUrl).toString();
    } else {
      baseUrl = null;
      path = "./twin.json";
    }

    (async () => {
      const model: Partial<Model> = await axios
        .get(path)
        .then((resp: { data: Partial<OTModel> }) => {
          const loadedModel = resp.data;
          const internalModel = {
            ...resp.data,
            bbox: loadedModel?.bbox
              ? {
                  minlng: loadedModel.bbox[0],
                  minlat: loadedModel.bbox[1],
                  maxlng: loadedModel.bbox[2],
                  maxlat: loadedModel.bbox[3],
                }
              : undefined,
          };
          return internalModel;
        })
        .catch(() => defaultModel);

      setModel(model);
      setResult({ model, baseUrl });
    })();
  }, [window?.location?.href]);

  useEffect(() => {
    if (!model?.bbox) return;
    // Set field
    setField((current) => ({ ...current, bbox: model.bbox }));
  }, [model?.bbox]);

  useEffect(() => {
    if (!model?.layers) return;

    // Transform models array to record
    // TODO: refactoring
    const layers = model.layers.reduce((prev, curr) => {
      return {
        ...prev,
        [curr.id]: curr,
      };
    }, {});
    setLayers(layers);

    // Set layers' enabled/disabled states
    // TODO: Refactoring
    setLayersState(() => {
      const newState: Partial<Layer> = {};

      if (!model?.layers) return newState;

      model.layers.forEach((layer) => {
        newState[layer.id] = {
          ...(newState[layer.id] || {}),
          enabled: layer.enabled === undefined ? true : layer.enabled,
        };
      });

      return newState;
    });
  }, [model?.layers]);

  useEffect(() => {
    if (!model?.entities) return;
    const entities = model.entities;

    // Load entities data
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
  }, [model?.entities]);

  return result;
}

export function useFieldFetch({
  field,
  baseUrl,
}: {
  field: Model["field"];
  baseUrl?: string;
}) {
  const [elevationMap, setElevationMap] = useState<ElevationMap>();

  const fetchFieldData = async (
    definition: Model["field"],
    baseUrl?: string,
  ) => {
    const blankField: [] = [];

    if (definition && definition.path) {
      definition.path = baseUrl
        ? new URL(definition.path, baseUrl).toString()
        : definition.path;
      const data = await axios
        .get(definition.path)
        .then((resp) => resp.data)
        .catch(() => blankField);
      return data;
    } else {
      // TODO: fix
      return blankField;
    }
  };
  useEffect(() => {
    (async () => {
      if (field) {
        // TODO: this is not a field data but elevation data
        const fieldData = await fetchFieldData(field, baseUrl);
        fieldData && setElevationMap(fieldData);
      }
    })();
  }, [field, baseUrl]);

  return { elevationMap };
}
