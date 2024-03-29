import { Suspense } from "react";

import {
  CSVLayer,
  GeoJSONLayer,
  PNGLayer,
  SVGMeshLayer,
  FlatGeobufLayer,
  GeoJSONTileLayer,
} from "./layers";

import type { Layer as OTLayer } from "@owntwin/core";

export function Layer({
  layer,
  baseUrl,
}: {
  layer: OTLayer;
  baseUrl?: string;
}) {
  // console.log("layer", layer);

  if (layer.path && baseUrl) {
    // TODO: fix
    layer.path =
      baseUrl && !layer.path.startsWith("http")
        ? new URL(layer.path, baseUrl).toString()
        : layer.path;
  }

  if (layer.format === "svg") {
    return <SVGMeshLayer url={layer.path} color={layer.color} />;
  } else if (layer.format === "png") {
    return (
      <Suspense>
        <PNGLayer url={layer.path} opacity={0.5} />
      </Suspense>
    );
  } else if (layer.format === "geojson") {
    return (
      <Suspense>
        <GeoJSONLayer
          url={layer.path}
          data={layer.data}
          opacity={0.5}
          colors={layer.colors}
          extrude={layer.extrude}
          selectable={layer.selectable}
        />
      </Suspense>
    );
  } else if (layer.format === "csv") {
    return (
      <CSVLayer
        url={layer.path}
        keys={layer.keys}
        color={layer.color}
        labelVisibility={layer.labelVisibility}
        size={layer.size}
        opacity={0.5}
        anchor={layer.anchor}
      />
    );
  } else if (layer.format === "fgb" || layer.format === "flatgeobuf") {
    return (
      <FlatGeobufLayer
        url={layer.path}
        opacity={0.5}
        colors={layer.colors}
        extrude={layer.extrude}
        {...layer}
      />
    );
  } else if (layer.format === "geojsontile") {
    return (
      <GeoJSONTileLayer
        url={layer.path}
        zoom={layer.zoom}
        opacity={0.5}
        colors={layer.colors}
        extrude={layer.extrude}
        {...layer}
      />
    );
  } else {
    return null;
  }
}
