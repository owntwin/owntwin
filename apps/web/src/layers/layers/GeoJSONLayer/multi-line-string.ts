import * as BufferGeometryUtils from "three-stdlib/utils/BufferGeometryUtils";

import { createGeometry as lineStringCreateGeometry } from "./line-string";

import type { FieldState } from "@owntwin/core";

export function createGeometry(
  feature: GeoJSON.Feature<GeoJSON.MultiLineString>,
  fieldState: FieldState,
) {
  const geometries: THREE.BufferGeometry[] = [];

  feature.geometry.coordinates.map((coord) => {
    const geom = lineStringCreateGeometry(
      {
        type: "Feature",
        geometry: { type: "LineString", coordinates: coord },
        properties: feature.properties,
      },
      fieldState,
    );
    geom && geometries.push(geom);
  });

  const mergedGeometry =
    geometries.length > 0
      ? BufferGeometryUtils.mergeBufferGeometries(geometries, false)
      : null;

  if (mergedGeometry) {
    mergedGeometry.type = "MeshLineGeometry";
  }

  return mergedGeometry;
}

export default {
  createGeometry,
};
