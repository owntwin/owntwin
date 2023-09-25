import { useAtom } from "jotai";
import * as store from "../lib/store";

import { ModelView, Field } from "@owntwin/core";
// TODO: type InternalModel should not be in core but in app
import type { InternalModel as Model } from "@owntwin/core";

import { Layer } from "../layers/index";

import DiscussAddon from "../addon/discuss/components/DiscussAddon";
import DrawAddon from "../addon/draw/components/DrawAddon";
// import PointerAddon from "./addon/pointer/components/PointerAddon";

import { useFieldFetch } from "../lib/hooks";

export default function Viewer({
  model,
  baseUrl,
  width = 1024,
  height = 1024,
  addons = [],
  options = {
    elevationZoom: 1,
  },
}: {
  model: Partial<Model>;
  baseUrl?: string;
  width?: number;
  height?: number;
  addons?: string[];
  options?: {
    elevationZoom?: number;
  };
}) {
  // TODO: layer/entities logics must be called in Viewer, not in App!
  const [layers] = useAtom(store.layersAtom);
  const [layersState] = useAtom(store.layersStateAtom);

  const { elevationMap } = useFieldFetch({
    field: model.field,
    baseUrl: baseUrl,
  });

  return (
    <ModelView width={width} height={height} bbox={model.bbox}>
      <Field
        width={width}
        height={height}
        elevationMap={elevationMap}
        elevationZoom={options?.elevationZoom || 1}
      >
        {Object.entries(layers || {}).map(([id, layer]) => {
          if (!layersState[id] || !layersState[id].enabled) {
            return null;
          }
          return <Layer key={id} layer={layer} baseUrl={baseUrl} />;
        })}
        {addons.includes("discuss") && <DiscussAddon />}
        {addons.includes("draw") && <DrawAddon />}
        {/* {addons.includes("pointer") && <PointerAddon />} */}
      </Field>
      {/* <AdaptiveEvents /> */}
      {/* <Sphere args={[150, 32, 16]} /> */}
    </ModelView>
  );
}
