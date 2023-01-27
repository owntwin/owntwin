import { useEffect, useState } from "react";

import axios from "axios";

import { useAtom } from "jotai";
import * as store from "../lib/store";

import { CanvasView, Field } from "../core/components";
import { Layer } from "../layers";

import DiscussAddon from "../addon/discuss/components/DiscussAddon";
import DrawAddon from "../addon/draw/components/DrawAddon";
// import PointerAddon from "./addon/pointer/components/PointerAddon";

// TODO: type InternalModel should not be in core but in app
import type { InternalModel as Model, ElevationMap } from "../core";

import { CANVAS } from "../lib/constants";

/* Constants */
// TODO: improve
const defaultElevationZoom = 2;
const width = CANVAS.width,
  height = CANVAS.height;

const addons = import.meta.env.VITE_ADDONS
  ? import.meta.env.VITE_ADDONS.split(",")
  : [];

const fetchFieldData = async (definition: Model["field"], baseUrl?: string) => {
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

export default function ModelView({
  model,
  basePath,
}: {
  model: Partial<Model>;
  basePath?: string;
}) {
  const [layers] = useAtom(store.layersAtom);
  const [layersState] = useAtom(store.layersStateAtom);

  const [elevationMap, setElevationMap] = useState<ElevationMap>();

  // TODO: move away this somewhere else
  useEffect(() => {
    (async () => {
      if (model.field) {
        // TODO: this is not a field data but elevation data
        const fieldData = await fetchFieldData(model.field, basePath);
        fieldData && setElevationMap(fieldData);
      }
    })();
  }, [model, basePath]);

  return (
    <CanvasView width={width} height={height}>
      <Field
        width={width}
        height={height}
        elevationMap={elevationMap}
        elevationZoom={defaultElevationZoom}
      >
        {Object.entries(layers || {}).map(([id, layer]) => {
          if (!layersState[id] || !layersState[id].enabled) {
            return null;
          }
          return <Layer key={id} layer={layer} basePath={basePath} />;
        })}
        {addons.includes("discuss") && <DiscussAddon />}
        {addons.includes("draw") && <DrawAddon />}
        {/* {addons.includes("pointer") && <PointerAddon />} */}
      </Field>
      {/* <AdaptiveEvents /> */}
      {/* <Sphere args={[150, 32, 16]} /> */}
    </CanvasView>
  );
}
