import { ReactNode, useEffect, useMemo } from "react";

import * as THREE from "three";

import { useAtom } from "jotai";
import { fieldAtom } from "./store";

import { useFieldState } from "./hooks";

import type { ElevationMap } from "../../types";
import { useCanvas } from "../ModelView/hooks";

function BlankPlane({
  width,
  height,
  color = 0xf1f3f5,
}: {
  width: number;
  height: number;
  color?: number;
}) {
  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        color={color}
        depthWrite={false}
        polygonOffset={true}
        polygonOffsetFactor={1}
      />
    </mesh>
  );
}

export function Field({
  elevationMap,
  elevationZoom = 1,
  width,
  height,
  color = 0xfaf9f9, // 0xe5e7eb, 0xf1f3f4, 0xf8f9fa
  children,
}: {
  elevationMap?: ElevationMap;
  elevationZoom?: number;
  width: number;
  height: number;
  color?: number | string;
  children?: ReactNode;
}) {
  if (!elevationMap) {
    // TODO: why 1000?
    elevationMap = useMemo(() => Array(1000).fill([0, 0, 0]), []);
  }

  const [, setField] = useAtom(fieldAtom);

  const canvas = useCanvas();
  const fieldState = useFieldState();
  const segments = useMemo(() => fieldState.canvas._segments, []);

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(width, height, segments - 1, segments - 1);
  }, []);

  useEffect(() => {
    if (!Array.isArray(elevationMap) || elevationMap.length === 0) return;

    const positionAttributeArray = new Float32Array(
      geometry.getAttribute("position").array,
    );

    const minLevel =
      elevationMap.reduce((min, v) => Math.min(min, v[2]), elevationMap[0][2]) -
      4; // Offset 4

    elevationMap.forEach((v) => {
      const pos = v[0] + segments * (segments - 1 - v[1]);
      positionAttributeArray[pos * 3 + 2] =
        (v[2] - minLevel) * fieldState.pixelPerMeter * elevationZoom; // pos.z
    });

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positionAttributeArray, 3),
    );

    const vertices = Array.from(positionAttributeArray);
    setField((current) =>
      Object.assign({}, current, {
        vertices,
        geometry,
        bbox: canvas?.bbox,
        ready: true,
      }),
    );
  }, [elevationMap, elevationZoom, canvas?.bbox]);

  return (
    <>
      <BlankPlane width={width} height={height} />
      <mesh name="field" geometry={geometry}>
        <meshBasicMaterial color={color} depthTest={false} />
      </mesh>
      {children}
    </>
  );
}
