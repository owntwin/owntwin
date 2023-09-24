import { useCallback, useEffect, useState } from "react";

import { useAtom } from "jotai";
import * as store from "./store";

import axios from "axios";
import urlJoin from "url-join";

import { fromUrl } from "geotiff";
// @ts-ignore
import SphericalMercator from "@mapbox/sphericalmercator";

const sm = new SphericalMercator();

// import { Model } from "../core";
import type {
  Model as OTModel,
  InternalModel as Model,
  Layer,
  ElevationMap,
} from "@owntwin/core";

import { model as defaultModel } from "../model";

type ModelLoad = {
  model: Partial<Model> | null;
  baseUrl?: string;
};

const API_MODE = parseInt(import.meta.env.VITE_API_MODE);

export function useModelFetch(): ModelLoad {
  const [model, setModel] = useState<Partial<Model>>({});

  const [result, setResult] = useState<ModelLoad>({
    model: null,
    baseUrl: undefined,
  });

  const [, setLayers] = useAtom(store.layersAtom);
  const [, setLayersState] = useAtom(store.layersStateAtom);
  const [, updateEntityStore] = useAtom(store.entityStoreAtom);

  useEffect(() => {
    let baseUrl: string | undefined, path: string;

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    // console.log(url, { API_MODE });

    // TODO: debug only
    if (params.has("twin")) {
      baseUrl = params.get("twin") || undefined;
      if (typeof baseUrl !== "string") return;
      path = new URL("./twin.json", baseUrl).toString();
    } else if (API_MODE) {
      // TODO: refactoring
      baseUrl = undefined;
      path = urlJoin("/api/", url.pathname, "twin.json");
    } else {
      baseUrl = undefined;
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
  }, []);

  // useEffect(() => {
  //   if (!model?.bbox) return;
  //   // Set field
  //   setField((current) => ({ ...current, bbox: model.bbox }));
  // }, [model?.bbox]);

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

  // const fetchFieldData = useCallback(
  //   async (definition: Model["field"], baseUrl?: string) => {
  //     if ((field as any).format === "cog") {
  //       const blankField: [] = [];

  //       if (definition && definition.path) {
  //         definition.path = baseUrl
  //           ? new URL(definition.path, baseUrl).toString()
  //           : definition.path;

  //         try {
  //           // const source = new SourceUrl(definition.path);
  //           // const cog = await CogTiff.create(source);

  //           // const img = cog.getImage(0);
  //           // console.log(img.bbox, img.size, img.tileSize, img.tileCount);
  //           // // if (!img.isTiled()) return blankField;
  //           // const tile = await cog.getTile(25, 25, 0);
  //           // if (!tile) throw new Error("Failed to get a tile");
  //           // const u8arr = pako.inflate(tile.bytes);
  //           // const data = new Float32Array(u8arr.buffer);
  //           // // console.log(Array.from(data).map((v) => v.toString(16)));
  //           // console.log({ data, bytes: tile.bytes });
  //           const tiff = await fromUrl(definition.path);

  //           const bboxXY = sm.convert(
  //             [
  //               139.735107421875, 35.64055713458091, 139.75433349609375,
  //               35.656180416320154,
  //             ],
  //             "900913",
  //           );
  //           console.log({ bboxXY });

  //           const [f32arr, width, height] = await tiff.readRasters({
  //             bbox: bboxXY,
  //             // TODO: fix
  //             width: 100,
  //             height: 100,
  //           });
  //           const _fieldData = Array.from(f32arr as Float32Array);
  //           const fieldData = [...Array(Math.ceil(_fieldData.length / 100))]
  //             .map((_) => _fieldData.splice(0, 100))
  //             .map((row, i) => row.map((v, j) => [i, j, v]));
  //           // console.log(fieldData);
  //           return fieldData;
  //         } catch (err) {
  //           console.error(err);
  //           return blankField;
  //         }
  //       }
  //     } else {
  //       const blankField: [] = [];

  //       if (definition && definition.path) {
  //         definition.path = baseUrl
  //           ? new URL(definition.path, baseUrl).toString()
  //           : definition.path;
  //         const data = await axios
  //           .get(definition.path)
  //           .then((resp) => resp.data)
  //           .catch(() => blankField);
  //         return data;
  //       } else {
  //         // TODO: fix
  //         return blankField;
  //       }
  //     }
  //   },
  //   [field],
  // );

  useEffect(() => {
    (async () => {
      if (field && !elevationMap) {
        const fetchFieldData = async (
          definition: Model["field"],
          baseUrl?: string,
        ) => {
          if ((field as any).format === "cog") {
            const blankField: [] = [];

            if (definition && definition.path) {
              definition.path = baseUrl
                ? new URL(definition.path, baseUrl).toString()
                : definition.path;

              console.log("definition.path", definition.path);

              try {
                // const source = new SourceUrl(definition.path);
                // const cog = await CogTiff.create(source);

                // const img = cog.getImage(0);
                // console.log(img.bbox, img.size, img.tileSize, img.tileCount);
                // // if (!img.isTiled()) return blankField;
                // const tile = await cog.getTile(25, 25, 0);
                // if (!tile) throw new Error("Failed to get a tile");
                // const u8arr = pako.inflate(tile.bytes);
                // const data = new Float32Array(u8arr.buffer);
                // // console.log(Array.from(data).map((v) => v.toString(16)));
                // console.log({ data, bytes: tile.bytes });
                const tiff = await fromUrl(definition.path);

                const bboxXY = sm.convert(
                  [
                    139.735107421875, 35.64055713458091, 139.75433349609375,
                    35.656180416320154,
                  ],
                  "900913",
                );

                // console.log({ bboxXY });

                const [f32arr, width, height] = await tiff.readRasters({
                  bbox: bboxXY,
                  // TODO: fix
                  width: 100,
                  height: 100,
                });
                const _fieldData = Array.from(f32arr as Float32Array);
                // NOTE: awful!
                const fieldData = _fieldData.map((v, i) => {
                  return [i % 100, 100 - Math.floor(i / 100), v];
                });
                // console.log(fieldData);
                return fieldData;
              } catch (err) {
                console.error(err);
                return blankField;
              }
            }
          } else {
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
          }
        };

        console.log("setting elevation");

        // TODO: this is not a field data but elevation data
        const fieldData = await fetchFieldData(field, baseUrl);
        fieldData && setElevationMap(fieldData);
      }
    })();
  }, [field, baseUrl]);

  return { elevationMap };
}
