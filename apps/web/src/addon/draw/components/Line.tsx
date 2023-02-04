import { forwardRef, useRef, useState, useCallback, Ref, useMemo } from "react";

import { extend, Object3DNode, ThreeEvent, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

import { Detailed } from "../../../lib/components/Detailed";

import {
  MeshLineGeometry,
  MeshLineMaterial,
  //  MeshLineRaycast
} from "meshline";

import type * as types from "../types";

import { drawState } from "../share";

extend({ MeshLineGeometry, MeshLineMaterial });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>;
      meshLineMaterial: Object3DNode<MeshLineMaterial, typeof MeshLineMaterial>;
    }
  }
}

export function Line({
  points,
  color = "rgb(55, 65, 81)",
  lineWidth = 4,
  opacity = 0.75,
  ...props
}: Omit<types.Line, "uuid">) {
  const ref = useRef<THREE.Mesh>(null);

  const _points = useMemo(
    () =>
      points
        .map((p: any) => [p.x, p.y, p.z + 1]) // NOTE: z+1 to avoid flickering
        .reduce((prev: number[], current) => [...prev, ...current], []),
    [points],
  );

  // useEffect(() => {
  //   // NOTE: Add CatmullRomCurve3 if needed
  //   // console.log(points);
  //   const bounds = points.map(point => {
  //     const boundingSphere = new THREE.Sphere(point, 8);
  //     return boundingSphere;
  //   });
  // }, [points]);

  return (
    <mesh ref={ref}>
      <meshLineGeometry attach="geometry" points={_points} />
      <meshLineMaterial
        attach="material"
        transparent
        depthTest={false}
        lineWidth={lineWidth}
        color={color}
        opacity={opacity}
        {...props}
        // dashArray={0.05}
        // dashRatio={0.95}
      />
    </mesh>
  );
}

export const LinePen = forwardRef(
  (
    {
      position,
      lineWidth,
      opacity,
      color,
    }: {
      position: [number, number, number];
      lineWidth?: number;
      color?: string | number;
      opacity?: number;
    },
    ref: Ref<THREE.Group>,
  ) => {
    // const { scene } = useThree();

    // TODO: Improve
    if (ref === null || typeof ref === "function") {
      console.error("invalid ref");
      return null;
    }

    const [enabled, setEnabled] = useState(false);
    // const [points, setPoints] = useState<THREE.Vector3[]>([]);
    const [points, setPoints] = useState<{ x: number; y: number; z: number }[]>(
      [],
    );

    const handlePointerDown = useCallback(
      (ev?: ThreeEvent<PointerEvent>) => {
        if (!enabled) {
          setPoints([]);
          setEnabled(true);
        }
      },
      [enabled],
    );

    const handlePointerUp = useCallback(() => {
      setEnabled(false);
      const size = Math.log(points.length) * 10;
      const curvePoints = new THREE.CatmullRomCurve3(
        points.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
      ).getPoints(size);
      drawState.drawings.push({
        points: curvePoints.map((p) => ({ x: p.x, y: p.y, z: p.z })),
        lineWidth,
        color,
        opacity,
        uuid: THREE.MathUtils.generateUUID(),
      });
    }, [points, lineWidth, color, opacity]);

    useFrame((_, delta) => {
      if (!enabled || !ref.current) return;

      // NOTE: The line below could be slow, but what can we do?
      // const pt = ref.current.position.clone();
      const pt = {
        x: ref.current.position.x,
        y: ref.current.position.y,
        z: ref.current.position.z,
      };
      // const pt = ev.eventObject.position.clone(); // Seems slower

      // NOTE: setTimeout here makes little sense, but we keep it for future improvements;
      // The problem is that onPointerMove() call seems to be dropped when the pointer moves fast.
      // We need performance tuning and/or something like getCoalescedEvents().
      setTimeout(() => {
        // console.log(pt);
        setPoints((pts) => {
          if (
            pts.length > 0 &&
            pts[pts.length - 1].x === pt.x &&
            pts[pts.length - 1].y === pt.y &&
            pts[pts.length - 1].z === pt.z
          )
            return pts;
          return [...pts, pt];
        });
      }, 0);
    });

    const handlePointerMove = useCallback(
      (ev: ThreeEvent<PointerEvent>) => {
        if (!enabled && ["touch", "pen"].includes(ev.pointerType)) {
          setPoints([]);
          setEnabled(true);
        }
      },
      [enabled],
    );

    return (
      <>
        <group
          position={position}
          ref={ref}
          // onDoubleClick={() => {
          //   // NOTE: toggle enableRotate?
          // }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
        >
          <Detailed distances={[0, 512]}>
            <Sphere args={[2]}>
              <meshBasicMaterial
                color="#f3f3f3"
                depthWrite={false}
                depthTest={false}
              />
            </Sphere>
            <Sphere args={[10]}>
              <meshBasicMaterial
                color="#f3f3f3"
                depthWrite={false}
                depthTest={false}
              />
            </Sphere>
          </Detailed>
        </group>
        {enabled && (
          <Line
            points={points}
            lineWidth={lineWidth}
            color={color}
            opacity={opacity}
          />
        )}
      </>
    );
  },
);
