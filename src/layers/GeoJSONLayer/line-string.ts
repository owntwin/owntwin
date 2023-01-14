import * as util from "../../lib/util";

import { MeshLineGeometry } from "meshline";

import { BBox } from "../../types";

export function createGeometry(
  feature: GeoJSON.Feature<GeoJSON.LineString>,
  extrude: boolean,
  { bbox, getTerrainAltitude }: { bbox: BBox; getTerrainAltitude: Function },
) {
  const points: [number, number, number][] = feature.geometry.coordinates.map(
    (v) => {
      const p = util.coordToPlane(bbox, v[0], v[1]);
      const z = getTerrainAltitude(p.x + 1024 / 2, p.y + 1024 / 2) || 0;
      return [p.x, p.y, z];
    },
  );

  const geometry = new MeshLineGeometry();
  geometry.setPoints(points);

  return geometry;
}

export default {
  createGeometry,
};
