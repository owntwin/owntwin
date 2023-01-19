import { useEffect, useRef } from "react";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useAtom } from "jotai";
import { controlsStateAtom } from "../../../lib/store";
import { penStateAtom } from "../store";

import { LinePen } from "./Line";

export function Draw() {
  const [penState] = useAtom(penStateAtom);

  const three = useThree();
  const scene = three.scene as THREE.Scene;
  const raycaster = three.raycaster;

  const pen = useRef<THREE.Mesh>(null);

  const [, setControlsState] = useAtom(controlsStateAtom);
  useEffect(() => {
    setControlsState((state) => ({ ...state, enableRotate: false }));
    return () => {
      setControlsState((state) => ({ ...state, enableRotate: true }));
    };
  }, []);

  const terrain = scene.getObjectByName("terrain");

  useFrame((_, delta) => {
    if (!raycaster || !scene || !pen.current || !terrain) return;
    const intersects = raycaster.intersectObject(terrain);
    if (intersects.length > 0) {
      // console.log(intersects);
      const closest = intersects[0];
      pen.current.position.set(
        closest.point.x,
        closest.point.y,
        closest.point.z,
      );
    }
    // if (delta % 10 < 5) return;
  });

  // TODO: Fix initial position
  return (
    <LinePen
      position={[0, 0, 0]}
      ref={pen}
      lineWidth={penState.lineWidth}
      color={penState.color}
      opacity={penState.opacity}
    />
  );
}
