import { useEffect } from "react";

import { useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

export function Camera({
  width,
  height,
  position = [0, -800 * 1.2, 400 * 1.2], // TODO: fix constants
}: {
  width: number;
  height: number;
  position?: [number, number, number];
}) {
  // const camera = useRef();
  // useHelper(camera, THREE.CameraHelper, 1, "hotpink");

  const { gl } = useThree();

  useEffect(() => {
    if (!gl) return;
    gl.clippingPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), width / 2 - 2),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), width / 2 - 2),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), height / 2 - 2),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), height / 2 - 2),
    ];
  }, []);

  // TODO: fix constants
  return (
    <PerspectiveCamera
      makeDefault
      up={[0, 0, 1]}
      position={position}
      fov={60}
      aspect={window.innerWidth / window.innerHeight}
      near={1}
      far={(width + height) * 1.25}
    />
  );
}
