import {
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";

import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

// import { throttle } from 'lodash-es';

import { useAtom } from "jotai";
import * as store from "../store";
import * as appStore from "../../../lib/store";
import { controlsStateAtom } from "../../../lib/store";

function BrushPen({
  position,
  size,
  setActive,
}: {
  position: [number, number, number];
  size: number;
  setActive: Dispatch<SetStateAction<boolean>>;
}) {
  const [_active, _setActive] = useState(false);

  const onDown = useCallback(
    (ev?: unknown) => {
      if (!_active) {
        _setActive(true);
        setActive(true);
      }
    },
    [_active],
  );

  const onMove = useCallback(
    (ev: ThreeEvent<PointerEvent>) => {
      // TODO: throttle
      if (["touch", "pen"].includes(ev.pointerType) && !_active) {
        _setActive(true);
        setActive(true);
      }
    },
    [_active],
  );

  return (
    <>
      <Sphere
        args={[size]}
        position={position}
        onPointerDown={() => onDown()}
        onPointerMove={(ev) => onMove(ev)}
        onPointerUp={() => {
          _setActive(false);
          setActive(false);
        }}
      >
        <meshBasicMaterial attach="material" color={0xf3f3f3} />
      </Sphere>
    </>
  );
}

function Brush() {
  const three = useThree();
  const scene = three.scene as THREE.Scene;
  const raycaster = three.raycaster;

  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [active, setActive] = useState(false);

  const [hoveredEntity] = useAtom(appStore.hoveredEntityAtom);

  const [, setControlsState] = useAtom(controlsStateAtom);
  useEffect(() => {
    setControlsState((state) => ({ ...state, enableRotate: false }));
    return () => {
      setControlsState((state) => ({ ...state, enableRotate: true }));
    };
  }, []);

  // TODO: useMemo?
  const terrain = scene.getObjectByName("terrain");

  useFrame((_, delta) => {
    if (!raycaster || !scene || !terrain) return;
    const intersects = raycaster.intersectObject(terrain);
    if (intersects.length > 0) {
      // console.log(intersects);
      const closest = intersects[0];
      setPosition([closest.point.x, closest.point.y, closest.point.z]);
    }
  });

  useEffect(() => {
    if (active && hoveredEntity.entity) {
      // console.log(hoveredEntity.entity);
      hoveredEntity.entity.material.color = new THREE.Color(0x93c5fd);
      // hoveredEntity.entity.material.transparent = true;
      // hoveredEntity.entity.material.opacity = 1;
      hoveredEntity.entity.userData.visibility = "always";
      hoveredEntity.entity.visible = true;
    }
  }, [active, hoveredEntity.entity]);

  return <BrushPen position={position} size={8} setActive={setActive} />;
}

export default function BrushAddon({ ...props }) {
  const [selectedTool] = useAtom(store.selectedToolAtom);

  return <>{selectedTool === "brush" && <Brush />}</>;
}
