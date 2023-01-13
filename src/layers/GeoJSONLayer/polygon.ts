import * as THREE from "three";
import ElevatedShapeGeometry from "../../lib/components/ElevatedShapeGeometry";

import * as util from "../../lib/util";

import { BBox } from "../../types";

function computeShape({
  coordinates,
  bbox,
  ...props
}: {
  coordinates: GeoJSON.Position[][];
  bbox: BBox;
}) {
  // TODO: Support hole (coordinate[1])
  // TODO: Fix naming
  let _coordinates = coordinates[0];

  const originLng = _coordinates[0][0],
    originLat = _coordinates[0][1];

  const origin = util.coordToPlane(bbox, originLng, originLat);
  // const z = 0; // _coordinates[0][2]; // TODO: z from GeoJSON?
  // TODO: Fix: terrain is [0,1023], origin.x/y is [-512,512]
  // const z = getTerrainAltitude(origin.x + 1024 / 2, origin.y + 1024 / 2) || 0;

  const shape = new THREE.Shape();

  shape.moveTo(0, 0);
  _coordinates
    .slice()
    .reverse()
    .forEach((v) => {
      const p = util.coordToPlane(bbox, v[0], v[1]);
      shape.lineTo(p.x - origin.x, p.y - origin.y);
    });

  return shape;
}

function createElevatedShapeGeometry({
  coordinates,
  bbox,
  getTerrainAltitude,
  ...props
}: {
  coordinates: GeoJSON.Position[][];
  bbox: BBox;
  getTerrainAltitude: Function;
}) {
  // TODO: Support hole (coordinate[1])
  // TODO: Fix naming
  const _coordinates = coordinates[0];

  const originLng = _coordinates[0][0],
    originLat = _coordinates[0][1];

  const origin = util.coordToPlane(bbox, originLng, originLat);

  const shape = computeShape({ coordinates, bbox });

  const elevatation = _coordinates
    .slice()
    .sort(util.coordSorter)
    .map((v) => {
      const p = util.coordToPlane(bbox, v[0], v[1]);
      const z = getTerrainAltitude(p.x + 1024 / 2, p.y + 1024 / 2) || 0;
      return z;
      // TODO: return v[2];
    });

  //   const geom = new THREE.ShapeGeometry(shape, 1);
  const geom = new ElevatedShapeGeometry(shape, 1, elevatation);

  geom.translate(origin.x, origin.y, 1);

  return geom;
}

function createExtrudeGeometry({
  coordinates,
  bbox,
  getTerrainAltitude,
  ...props
}: {
  coordinates: GeoJSON.Position[][];
  bbox: BBox;
  getTerrainAltitude: Function;
  height: number;
}) {
  const depth = props.height / 2;

  // TODO: Support hole (coordinate[1])
  // TODO: Fix naming
  const _coordinates = coordinates[0];

  const originLng = _coordinates[0][0],
    originLat = _coordinates[0][1];

  const origin = util.coordToPlane(bbox, originLng, originLat);
  // const z = 0; // _coordinates[0][2]; // TODO: z from GeoJSON?
  // TODO: Fix: terrain is [0,1023], origin.x/y is [-512,512]
  const z = getTerrainAltitude(origin.x + 1024 / 2, origin.y + 1024 / 2) || 0;

  const shape = computeShape({ coordinates, bbox });

  const extrudeSettings = {
    steps: 1,
    depth: depth || 10,
    bevelEnabled: false,
    curveSegments: 1,
  };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.translate(origin.x, origin.y, z);

  return geom;
}

export function createGeometry(
  feature: GeoJSON.Feature<GeoJSON.Polygon>,
  extrude: boolean,
  { bbox, getTerrainAltitude }: { bbox: BBox; getTerrainAltitude: Function },
) {
  let geometry: THREE.BufferGeometry;

  if (extrude) {
    // NOTE: return null if cannot be extruded
    if (
      !feature.properties?.attributes?.measuredHeight &&
      !feature.properties?.attributes?.height
    ) {
      return null;
    }
    geometry = createExtrudeGeometry({
      coordinates: feature.geometry.coordinates,
      bbox: bbox,
      height: feature.properties.attributes.measuredHeight,
      getTerrainAltitude,
    });
  } else {
    geometry = createElevatedShapeGeometry({
      coordinates: feature.geometry.coordinates,
      bbox: bbox,
      getTerrainAltitude,
    });
  }

  return geometry;
}

export default {
  createGeometry,
};
