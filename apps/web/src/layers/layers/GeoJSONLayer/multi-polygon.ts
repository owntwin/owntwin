import * as BufferGeometryUtils from "three-stdlib/utils/BufferGeometryUtils";

import { createGeometry as polygonCreateGeometry } from "./polygon";

import type { FieldState } from "@owntwin/core";

export function createGeometry(
  feature: GeoJSON.Feature<GeoJSON.MultiPolygon>,
  extrude: boolean,
  fieldState: FieldState,
) {
  const geometries: THREE.BufferGeometry[] = [];

  feature.geometry.coordinates.map((coord) => {
    const geom = polygonCreateGeometry(
      {
        type: "Feature",
        geometry: { type: "Polygon", coordinates: coord },
        properties: feature.properties,
      },
      extrude,
      fieldState,
    );
    geom && geometries.push(geom);
  });

  const mergedGeometry =
    geometries.length > 0
      ? BufferGeometryUtils.mergeBufferGeometries(geometries, false)
      : null;

  // TODO: fix
  if (mergedGeometry) {
    mergedGeometry.type = "BufferGeometry";
  }

  return mergedGeometry;
}

export default {
  createGeometry,
};
