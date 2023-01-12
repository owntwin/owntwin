import { Suspense } from "react";

import PNGLayer from "./layers/PNGLayer";
import SVGMeshLayer from "./layers/SVGMeshLayer";
import GeoJSONLayer from "./layers/GeoJSONLayer";
import CSVLayer from "./layers/CSVLayer";
import { Layer as ILayer } from "./types";

function Layer({
  def,
  basePath,
  ...props
}: {
  def: ILayer;
  basePath?: string;
}) {
  if (basePath) {
    def.path = basePath ? new URL(def.path, basePath).toString() : def.path;
  }
  if (def.format === "svg") {
    return <SVGMeshLayer url={def.path} color={def.color} />;
  } else if (def.format === "png") {
    return (
      <Suspense>
        <PNGLayer url={def.path} opacity={0.5} />
      </Suspense>
    );
  } else if (def.format === "geojson") {
    return (
      <Suspense>
        <GeoJSONLayer
          url={def.path}
          opacity={0.5}
          colors={def.colors}
          extrude={def.extrude}
        />
      </Suspense>
    );
  } else if (def.format === "csv") {
    return (
      <CSVLayer
        url={def.path}
        keys={def.keys}
        color={def.color}
        labelVisibility={def.labelVisibility}
        size={def.size}
        opacity={0.5}
      />
    );
  } else {
    return null;
  }
}

export default Layer;
