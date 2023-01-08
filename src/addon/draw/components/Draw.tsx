import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useCallback,
  Ref,
  useMemo,
} from "react";

import {
  extend,
  useFrame,
  useThree,
  Object3DNode,
  ThreeEvent,
} from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

import {
  MeshLineGeometry,
  MeshLineMaterial,
  //  MeshLineRaycast
} from "meshline";

import { useAtom } from "jotai";
import * as store from "../store";

// @ts-ignore
import { io } from "socket.io-client";

import { subscribe, useSnapshot } from "valtio";
import { drawState, BACKEND_URL, twinId } from "../share";
declare module "valtio" {
  function useSnapshot<T extends object>(p: T): T;
}

import { Erase } from "./Erase";
import BrushAddon from "./Brush";

import * as types from "../types";
import throttle from "just-throttle";

extend({ MeshLineGeometry, MeshLineMaterial });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>;
      meshLineMaterial: Object3DNode<MeshLineMaterial, typeof MeshLineMaterial>;
    }
  }
}

function Line({
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
        .map((p: any) => new THREE.Vector3(p.x, p.y, p.z))
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

const Pen = forwardRef(
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
          //   scene.orbitControls.enableRotate = !scene.orbitControls.enableRotate;
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

function Draw() {
  const three = useThree();
  const scene = three.scene as THREE.Scene & { orbitControls: OrbitControls };
  const raycaster = three.raycaster;

  const pen = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!scene.orbitControls) return;
    scene.orbitControls.enableRotate = false;
    return () => {
      scene.orbitControls.enableRotate = true;
    };
  }, [scene.orbitControls]);

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

  return <Pen position={[0, 0, 0]} ref={pen} />;
}

export default function DrawAddon({ ...props }) {
  const drawSnap = useSnapshot(drawState);

  const [selectedTool] = useAtom(store.selectedToolAtom);

  useEffect(() => {
    const endpoint = `${BACKEND_URL}/drawing/${twinId}`;

    const socket = io(endpoint, {
      transports: ["websocket"],
      autoConnect: false,
    });

    socket.on("connect", () => {
      // console.log(`connected to ${endpoint}`);
      socket.emit("read", null, (drawings: types.Drawing[]) => {
        // console.log("drawings", drawings);
        drawState.drawings = drawings;
      });
    });

    socket.on("updated", (drawings: types.Drawing[]) => {
      // console.log(drawings);
      drawState.drawings = drawings;
    });

    socket.connect();
    // console.log(`connecting to ${endpoint}`);

    const unsubscribe = subscribe(
      drawState,
      throttle(() => {
        if (!drawState.drawings) return;
        // console.log(`updating ${drawState.drawings}`);
        socket.emit("update", drawState.drawings);
      }, 0),
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      {selectedTool === "draw" && <Draw />}
      {selectedTool === "erase" && <Erase linesData={drawSnap.drawings} />}
      {drawSnap.drawings.map((linepts, i) => (
        <Line key={i} points={linepts.points} />
      ))}
      <BrushAddon />
    </>
  );
}
