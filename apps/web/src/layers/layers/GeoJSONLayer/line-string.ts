import { MeshLineGeometry } from "meshline";

import type { FieldState } from "@owntwin/core";

export function createGeometry(
  feature: GeoJSON.Feature<GeoJSON.LineString>,
  fieldState: FieldState,
) {
  const points: [number, number, number][] = feature.geometry.coordinates.map(
    (v) => {
      const p = fieldState.coordToPlane(v[0], v[1]);
      const z = fieldState.getAltitude(p.x + 1024 / 2, p.y + 1024 / 2) || 0;
      return [p.x, p.y, z + 1];
    },
  );

  const geometry = new MeshLineGeometry();
  geometry.setPoints(points);

  // TODO: refactoring
  if (geometry) {
    geometry.type = "MeshLineGeometry";
  }

  return geometry;
}

export default {
  createGeometry,
};
