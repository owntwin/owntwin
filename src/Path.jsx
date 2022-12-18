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

function Path({ coordinates, color, ...props }) {
  const { model } = useContext(ModelContext);

  const points = useMemo(() => {
    const points = coordinates.map((coord) => {
      const xy = util.coordToPlane(model.bbox, coord[0], coord[1]);
      return new THREE.Vector3(xy.x, xy.y, 50); // TODO: Remove constant
    });
    return points;
  }, [model.bbox, coordinates]);

  // TODO: Curve

  return (
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
  );
}

export { Path };
