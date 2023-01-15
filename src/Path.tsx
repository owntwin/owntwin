import { useMemo } from "react";

import { extend } from "@react-three/fiber";
import * as THREE from "three";

import {
  MeshLineGeometry,
  MeshLineMaterial,
  //  MeshLineRaycast
} from "meshline";

import * as util from "./lib/util";

import { useAtom } from "jotai";
import * as store from "./lib/store";

extend({ MeshLineGeometry, MeshLineMaterial });

function Path({
  coordinates,
  color,
  ...props
}: {
  coordinates: [number, number][];
  color?: number | string;
}) {
  const [field] = useAtom(store.fieldAtom);

  const points = useMemo(() => {
    if (!field.bbox) return;
    const bbox = field.bbox;
    const points = coordinates.map((coord) => {
      const xy = util.coordToPlane(bbox, coord[0], coord[1]);
      return [xy.x, xy.y, 50]; // TODO: Remove constant
    });
    return points.flat();
  }, [field.bbox, coordinates]);

  // TODO: Curve

  return points ? (
    <mesh position={[0, -0.4, 2]}>
      <meshLineGeometry attach="geometry" points={points} />
      <meshLineMaterial
        attach="material"
        transparent
        depthTest={false}
        lineWidth={10}
        color={color || "green"}
        // dashArray={0.05}
        // dashRatio={0.95}
      />
    </mesh>
  ) : null;
}

export { Path };
