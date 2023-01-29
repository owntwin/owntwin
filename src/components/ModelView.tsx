import { useAtom } from "jotai";
import * as store from "../lib/store";

import { CanvasView, Field } from "../core/components";
import { Layer } from "../layers";

import DiscussAddon from "../addon/discuss/components/DiscussAddon";
import DrawAddon from "../addon/draw/components/DrawAddon";
// import PointerAddon from "./addon/pointer/components/PointerAddon";

import { useFieldFetch } from "../lib/hooks";

// TODO: type InternalModel should not be in core but in app
import type { InternalModel as Model } from "../core";

// NOTE: this constant is unproblematic as it is of app
import { CANVAS } from "../lib/constants";

/* Constants */
// TODO: improve
const defaultElevationZoom = 2;
const width = CANVAS.width,
  height = CANVAS.height;
const addons = import.meta.env.VITE_ADDONS
  ? import.meta.env.VITE_ADDONS.split(",")
  : [];

export default function ModelView({
  model,
  basePath,
}: {
  model: Partial<Model>;
  basePath?: string;
}) {
  // TODO: layer/entities logics must be called in ModelView, not in App!
  const [layers] = useAtom(store.layersAtom);
  const [layersState] = useAtom(store.layersStateAtom);

  const { elevationMap } = useFieldFetch({
    field: model.field,
    baseUrl: basePath,
  });

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
