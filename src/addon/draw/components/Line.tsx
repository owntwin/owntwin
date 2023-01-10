import { forwardRef, useRef, useState, useCallback, Ref, useMemo } from "react";

import { extend, Object3DNode, ThreeEvent } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

import {
  MeshLineGeometry,
  MeshLineMaterial,
  //  MeshLineRaycast
} from "meshline";

import * as types from "../types";

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
  ...props
}: {
  points: types.Line["points"] | THREE.Vector3[];
  color?: string | number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  const _points = useMemo(
    () =>
      points
        .map((p: any) => new THREE.Vector3(p.x, p.y, p.z + 1)) // NOTE: z+1 to avoid flickering
        .reduce(
          (prev: number[], current) => [...prev, ...current.toArray()],
          [],
        ),
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
        lineWidth={4}
        color={color}
        opacity={0.75}
        {...props}
        // dashArray={0.05}
        // dashRatio={0.95}
      />
    </mesh>
  );
}

export const LinePen = forwardRef(
  (
    { position }: { position: [number, number, number] },
    ref: Ref<THREE.Mesh>,
  ) => {
    // const { scene } = useThree();

    // TODO: Improve
    if (ref === null || typeof ref === "function") {
      console.error("invalid ref");
      return null;
    }

    const [enabled, setEnabled] = useState(false);
    const [points, setPoints] = useState<THREE.Vector3[]>([]);

    const onDown = (ev?: unknown) => {
      if (!enabled) {
        setPoints([]);
        setEnabled(true);
      }
    };

    const onMove = useCallback(
      (ev: ThreeEvent<PointerEvent>) => {
        // throttle(
        if (["touch", "pen"].includes(ev.pointerType) && !enabled) {
          setPoints([]);
          setEnabled(true);
        }
        if (enabled) {
          setPoints((pts) => {
            if (ref.current) {
              const pt = ref.current.position.clone();
              return [...pts, pt];
            } else {
              return pts;
            }
          });
        }
      },
      [enabled, setPoints],
    );
    // , null);

    return (
      <>
        <Sphere
          args={[10]}
          position={position}
          ref={ref}
          // onDoubleClick={() => {
          //   // NOTE: toggle enableRotate?
          // }}
          onPointerDown={() => onDown()}
          onPointerUp={() => {
            setEnabled(false);
            const size = Math.log(points.length) * 10;
            const curvePoints = new THREE.CatmullRomCurve3(points).getPoints(
              size,
            );
            drawState.drawings.push({
              points: curvePoints.map((p) => ({ x: p.x, y: p.y, z: p.z })),
              uuid: THREE.MathUtils.generateUUID(),
            });
            // setLinesData((current) => [
            //   ...current,
            //   {
            //     points: curvePoints,
            //     uuid: THREE.MathUtils.generateUUID(),
            //   },
            // ]);
          }}
          onPointerMove={(ev) => onMove(ev)}
        >
          <meshBasicMaterial attach="material" color="#f3f3f3" />
        </Sphere>
        {enabled && <Line points={points} />}
      </>
    );
  },
);
