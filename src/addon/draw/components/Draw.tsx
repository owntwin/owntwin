import { forwardRef, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

// import { throttle } from 'lodash-es';

import {
  MeshLineGeometry,
  MeshLineMaterial,
  //  MeshLineRaycast
} from "meshline";

import * as store from "../store";

extend({ MeshLineGeometry, MeshLineMaterial });

function Line({ points, ...props }) {
  // useEffect(() => console.log(points), [points]);

  return (
    <mesh>
      <meshLineGeometry attach="geometry" points={points} />
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

const Pen = forwardRef(({ position, setLinePoints, ...props }, ref) => {
  // const { scene } = useThree();

  const [enabled, setEnabled] = useState(false);
  const [points, setPoints] = useState([]);

  const onDown = (ev) => {
    if (!enabled) {
      setPoints([]);
      setEnabled(true);
    }
  };

  const onMove = (ev) => {
    // throttle(
    if (["touch", "pen"].includes(ev.pointerType) && !enabled) {
      setPoints([]);
      setEnabled(true);
    }
    if (enabled) {
      setPoints((pts) => {
        const pt = ref.current.position.clone();
        // console.log(pts, pt);
        return [...pts, pt];
      });
    }
  };
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
        // onClick={() => {
        //   console.log('click');
        // }}
        onPointerDown={() => onDown()}
        onPointerUp={() => {
          setEnabled(false);
          const size = Math.log(points.length) * 10;
          const curvePoints = new THREE.CatmullRomCurve3(points).getPoints(
            size,
          );
          setLinePoints((linepts) => [...linepts, curvePoints]);
        }}
        onPointerMove={(ev) => onMove(ev)}
      >
        <meshBasicMaterial attach="material" color="#f3f3f3" />
      </Sphere>
      {enabled && <Line points={points} />}
    </>
  );
});

function Draw({ setLinePoints, ...props }) {
  const { scene, raycaster } = useThree();

  const pen = useRef();

  useEffect(() => {
    if (!scene.orbitControls) return;
    scene.orbitControls.enableRotate = false;
    return () => {
      scene.orbitControls.enableRotate = true;
    };
  }, [scene.orbitControls]);

  const terrain = scene.getObjectByName("terrain");

  useFrame((_, delta) => {
    if (!raycaster || !scene || !pen.current) return;
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

  return (
    <>
      <Pen position={[0, 0, 0]} ref={pen} setLinePoints={setLinePoints} />
    </>
  );
}

export default function DrawAddon({ ...props }) {
  const [linePoints, setLinePoints] = useState([]);

  const [enabled] = useAtom(store.enabledAtom);

  return (
    <>
      {enabled && <Draw setLinePoints={setLinePoints} />}
      {linePoints.map((linepts, i) => (
        <Line key={i} points={linepts} />
      ))}
    </>
  );
}
