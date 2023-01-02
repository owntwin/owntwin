import { useContext, useMemo } from "react";

import { extend } from "@react-three/fiber";
import * as THREE from "three";

import {
  MeshLineGeometry,
  MeshLineMaterial,
  //  MeshLineRaycast
} from "meshline";

import { ModelContext } from "./ModelView";

import * as util from "./lib/util";

extend({ MeshLineGeometry, MeshLineMaterial });

function Path({
  coordinates,
  color,
  ...props
}: {
  coordinates: [number, number][];
  color?: number | string;
}) {
  const { model } = useContext(ModelContext);

  const points = useMemo(() => {
    if (!model.bbox) return;
    const bbox = model.bbox;
    const points = coordinates.map((coord) => {
      const xy = util.coordToPlane(bbox, coord[0], coord[1]);
      return [xy.x, xy.y, 50]; // TODO: Remove constant
    });
    return points.flat();
  }, [model.bbox, coordinates]);

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
