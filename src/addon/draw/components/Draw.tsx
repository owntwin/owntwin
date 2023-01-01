import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
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

// import { throttle } from 'lodash-es';

import {
  MeshLineGeometry,
  MeshLineMaterial,
  //  MeshLineRaycast
} from "meshline";

import { useAtom } from "jotai";
import * as store from "../store";

extend({ MeshLineGeometry, MeshLineMaterial });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>;
      meshLineMaterial: Object3DNode<MeshLineMaterial, typeof MeshLineMaterial>;
    }
  }
}

type Line = {
  points: THREE.Vector3[];
  uuid: string;
};

function Line({ points, ...props }: { points: THREE.Vector3[] }) {
  const [, setLines] = useAtom(store.linesAtom);

  // useEffect(() => console.log(points), [points]);
  const ref = useRef<THREE.Mesh>(null);

  const _points = useMemo(
    () =>
      points.reduce(
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

  // useEffect(() => {
  //   setLines((lines) => {
  //     if (ref.current !== null) {
  //       console.log([...lines, ref.current]);
  //       return [...lines, ref.current];
  //     } else {
  //       console.log(lines);
  //       return lines;
  //     }
  //   });
  // }, [ref.current]);

  return (
    <mesh ref={ref}>
      <meshLineGeometry attach="geometry" points={_points} />
      <meshLineMaterial
        attach="material"
        transparent
        depthTest={false}
        lineWidth={4}
        color={"rgb(55, 65, 81)"}
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
    {
      position,
      setLinePoints,
    }: {
      position: [number, number, number];
      setLinePoints: Dispatch<SetStateAction<Line[]>>;
    },
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
            setLinePoints((current) => [
              ...current,
              {
                points: curvePoints,
                uuid: THREE.MathUtils.generateUUID(),
              },
            ]);
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

function Draw({
  setLinePoints,
}: {
  setLinePoints: Dispatch<SetStateAction<Line[]>>;
}) {
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

  return <Pen position={[0, 0, 0]} ref={pen} setLinePoints={setLinePoints} />;
}

const Eraser = ({
  position,
  size,
  setActive,
}: {
  position: [number, number, number];
  size: number;
  setActive: Dispatch<SetStateAction<boolean>>;
}) => {
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
};

function Erase({
  setLinePoints,
  linePoints,
}: {
  setLinePoints: Dispatch<SetStateAction<Line[]>>;
  linePoints: Line[];
}) {
  const three = useThree();
  const scene = three.scene as THREE.Scene & { orbitControls: OrbitControls };
  const raycaster = three.raycaster;

  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [active, setActive] = useState(false);

  const curvesData = useMemo(() => {
    const curvesData = linePoints.map((line) => ({
      curve: new THREE.CatmullRomCurve3(line.points),
      uuid: line.uuid,
    }));
    return curvesData;
  }, [linePoints]);

  useEffect(() => {
    if (!scene.orbitControls) return;
    scene.orbitControls.enableRotate = false;
    return () => {
      scene.orbitControls.enableRotate = true;
    };
  }, [scene.orbitControls]);

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

  const handlePointerOver = useCallback((uuid: string) => {
    if (active) {
      setLinePoints((current) => current.filter((line) => line.uuid !== uuid));
    }
    // console.log(active, uuid);
  }, [active]);

  return (
    <>
      <Eraser position={position} size={16} setActive={setActive} />
      {curvesData.map(({ curve, uuid }) => (
        <mesh
          visible={false}
          key={uuid}
          onPointerOver={() => handlePointerOver(uuid)}
        >
          <tubeGeometry args={[curve, 32, 16, 4]} />
          <meshBasicMaterial color={0x000000} />
        </mesh>
      ))}
    </>
  );
}

export default function DrawAddon({ ...props }) {
  const [linePoints, setLinePoints] = useState<Line[]>([]);

  const [selectedTool] = useAtom(store.selectedToolAtom);

  return (
    <>
      {selectedTool === "draw" && <Draw setLinePoints={setLinePoints} />}
      {selectedTool === "erase" && (
        <Erase setLinePoints={setLinePoints} linePoints={linePoints} />
      )}
      {linePoints.map((linepts, i) => (
        <Line key={i} points={linepts.points} />
      ))}
    </>
  );
}
