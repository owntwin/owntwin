import { useEffect, useRef } from "react";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { useControls } from "@owntwin/core";

import { useAtom } from "jotai";
import { penStateAtom } from "../store";

import { LinePen } from "./Line";

export function Draw() {
  const [penState] = useAtom(penStateAtom);

  const three = useThree();
  const scene = three.scene as THREE.Scene;
  const raycaster = three.raycaster;

  const pen = useRef<THREE.Group>(null);

  const { setState: setControlsState } = useControls();
  useEffect(() => {
    setControlsState((state) => ({ ...state, enableRotate: false }));
    return () => {
      setControlsState((state) => ({ ...state, enableRotate: true }));
    };
  }, []);

  const field = scene.getObjectByName("field");

  useFrame((_, delta) => {
    if (!raycaster || !scene || !pen.current || !field) return;
    const intersects = raycaster.intersectObject(field);
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
