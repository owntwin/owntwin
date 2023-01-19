import {
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";

import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

import { useAtom } from "jotai";
// import * as store from "../store";
import * as appStore from "../../../lib/store";
import { controlsStateAtom } from "../../../lib/store";

import { drawState } from "../share";

import { Line } from "../types";

function Eraser({
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
        <meshBasicMaterial attach="material" color="#ffffff" />
      </Sphere>
    </>
  );
}

export function Erase({ linesData }: { linesData: Line[] }) {
  const three = useThree();
  const scene = three.scene as THREE.Scene;
  const raycaster = three.raycaster;

  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [active, setActive] = useState(false);

  const [hoveredEntity] = useAtom(appStore.hoveredEntityAtom);

  const curvesData = useMemo(() => {
    // NOTE: sometimes complex lines seem to cause error here
    const curvesData = linesData.map((line) => ({
      curve: new THREE.CatmullRomCurve3(
        line.points.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
      ),
      uuid: line.uuid,
    }));
    return curvesData;
  }, [linesData]);

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

  const handlePointerOver = useCallback(
    (uuid: string) => {
      if (active) {
        drawState.drawings = drawState.drawings.filter(
          (line) => line.uuid !== uuid,
        );
      }
      // console.log(active, uuid);
    },
    [active],
  );

  useEffect(() => {
    if (active && hoveredEntity.entity) {
      // console.log(hoveredEntity.entity);
      hoveredEntity.entity.material.color = new THREE.Color(0xffffff);
      // hoveredEntity.entity.material.opacity = 0.5;
      hoveredEntity.entity.userData.visibility = "auto";
      hoveredEntity.entity.visible = false;
    }
  }, [active, hoveredEntity.entity]);

  return (
    <>
      <Eraser position={position} size={12} setActive={setActive} />
      {curvesData.map(({ curve, uuid }) => {
        // NOTE: avoid error
        if (curve.points.length === 0) {
          return null;
        }
        return (
          <mesh
            visible={false}
            key={uuid}
            onPointerOver={() => handlePointerOver(uuid)}
          >
            <tubeGeometry args={[curve, 32, 16, 4]} />
            <meshBasicMaterial color={0x000000} />
          </mesh>
        );
      })}
    </>
  );
}
