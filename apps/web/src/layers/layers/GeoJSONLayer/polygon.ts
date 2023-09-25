import * as THREE from "three";
import { ElevatedShapeGeometry } from "@owntwin/core/lib/components";

import { coordSorter } from "@owntwin/core/lib/utils";

import type { FieldState } from "@owntwin/core";

function computeShape({
  coordinates,
  fieldState,
}: {
  coordinates: GeoJSON.Position[][];
  fieldState: FieldState;
}) {
  // TODO: Support hole (coordinate[1])
  // TODO: Fix naming
  let _coordinates = coordinates[0];

  const originLng = _coordinates[0][0],
    originLat = _coordinates[0][1];

  const origin = fieldState.coordToPlane(originLng, originLat);
  // const z = 0; // _coordinates[0][2]; // TODO: z from GeoJSON?
  // TODO: Fix: field is [0,1023], origin.x/y is [-512,512]
  // const z = getFieldAltitude(origin.x + 1024 / 2, origin.y + 1024 / 2) || 0;

  const shape = new THREE.Shape();

  shape.moveTo(0, 0);
  _coordinates
    .slice()
    .reverse()
    .forEach((v) => {
      const p = fieldState.coordToPlane(v[0], v[1]);
      shape.lineTo(p.x - origin.x, p.y - origin.y);
    });

  return shape;
}

function createElevatedShapeGeometry({
  coordinates,
  fieldState,
}: {
  coordinates: GeoJSON.Position[][];
  fieldState: FieldState;
}) {
  // TODO: Support hole (coordinate[1])
  // TODO: Fix naming
  const _coordinates = coordinates[0];

  const originLng = _coordinates[0][0],
    originLat = _coordinates[0][1];

  const origin = fieldState.coordToPlane(originLng, originLat);

  const shape = computeShape({ coordinates, fieldState });

  const elevatation = _coordinates
    .slice()
    .sort(coordSorter)
    .map((v) => {
      const p = fieldState.coordToPlane(v[0], v[1]);
      const z = fieldState.getAltitude(p.x + 1024 / 2, p.y + 1024 / 2) || 0;
      // return v[2] * fieldState.pixelPerMeter * 2;
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
  fieldState,
  ...props
}: {
  coordinates: GeoJSON.Position[][];
  fieldState: FieldState;
  height: number;
}) {
  const depth = props.height * fieldState.pixelPerMeter;

  // TODO: Support hole (coordinate[1])
  // TODO: Fix naming
  const _coordinates = coordinates[0];

  const originLng = _coordinates[0][0],
    originLat = _coordinates[0][1];

  const origin = fieldState.coordToPlane(originLng, originLat);
  // const z = 0; // _coordinates[0][2]; // TODO: z from GeoJSON?
  // TODO: Fix: field is [0,1023], origin.x/y is [-512,512]
  const z =
    fieldState.getAltitude(origin.x + 1024 / 2, origin.y + 1024 / 2) || 0;

  const shape = computeShape({ coordinates, fieldState });

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
  fieldState: FieldState,
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
      height: feature.properties.attributes.measuredHeight,
      fieldState,
    });
  } else {
    geometry = createElevatedShapeGeometry({
      coordinates: feature.geometry.coordinates,
      fieldState,
    });
  }

  return geometry;
}

export default {
  createGeometry,
};
