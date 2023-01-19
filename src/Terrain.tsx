import { createContext, ReactNode, useEffect, useMemo, useState } from "react";

// import { Plane } from '@react-three/drei';
import {
  // CameraHelper,
  BufferAttribute,
} from "three";
import * as THREE from "three";

import { useAtom } from "jotai";
import * as store from "./lib/store";

import * as util from "./lib/util";
import { CANVAS } from "./lib/constants";
import { useFieldState } from "./lib/hooks";

export type Terrain = {
  geometry: THREE.PlaneGeometry;
  vertices: number[];
};
export type Levelmap = [number, number, number][];

export const TerrainContext = createContext<Partial<Terrain>>({
  geometry: undefined,
});

function BlankPlane({
  width,
  height,
  color = 0xf1f3f5,
}: {
  width: number;
  height: number;
  color?: number;
}) {
  const [field] = useAtom(store.fieldAtom);

  const [, setCoords] = useState<string[]>([]);

  const [debug, setDebug] = useAtom(store.debugAtom);

  useEffect(() => {
    if (!debug) setCoords([]);
  }, [debug]);

  return (
    <mesh // TODO: field && <mesh ?
      onDoubleClick={(ev) => {
        if (!field.bbox) {
          console.error("field.bbox is undefined");
          return;
        }
        if (ev.shiftKey) {
          ev.stopPropagation();
          // console.log({ intersections: ev.intersections });
          if (ev.intersections.length > 0) {
            let point = ev.intersections[0].point;
            // console.log(point);
            let coord = util.planeToCoord(field.bbox, point.x, point.y);
            // setCoords((val) => [...val, `[${coord.lat}, ${coord.lng}, 0]`]);
            setCoords((val) => {
              let coords = [...val, `[${coord.lng}, ${coord.lat}]`];
              setDebug(`[${coords.join(", ")}]`);
              return coords;
            });
          }
        }
      }}
    >
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

function Terrain({
  levelmap,
  elevationZoom,
  width,
  height,
  color = 0xfaf9f9,
  children,
  ...props
}: {
  levelmap: Levelmap;
  elevationZoom: number;
  width: number;
  height: number;
  color?: number | string;
  children?: ReactNode;
}) {
  // const [vertices, setVertices] = useState(null);
  const [, setField] = useAtom(store.fieldAtom);
  const segments = CANVAS.segments;

  const fieldState = useFieldState();

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(width, height, segments - 1, segments - 1);
  }, []);

  const vertices = useMemo(() => {
    if (!Array.isArray(levelmap) || levelmap.length === 0) return null;

    const positionAttributeArray = new Float32Array(
      geometry.getAttribute("position").array,
    );

    const minLevel =
      levelmap.reduce((min, v) => Math.min(min, v[2]), levelmap[0][2]) - 4; // Offset 4

    levelmap.forEach((v) => {
      const pos = v[0] + segments * (segments - 1 - v[1]);
      positionAttributeArray[pos * 3 + 2] =
        (v[2] - minLevel) * fieldState.pixelPerMeter * elevationZoom; // pos.z
    });

    geometry.setAttribute(
      "position",
      new BufferAttribute(positionAttributeArray, 3),
    );

    return Array.from(positionAttributeArray);
  }, [levelmap, elevationZoom]);

  useEffect(() => {
    if (!vertices) return;
    setField((current) => Object.assign(current, { vertices, ready: true }));
  }, [vertices]);

  return (
    <>
      <BlankPlane width={width} height={height} />
      <mesh name="terrain" geometry={geometry}>
        {/* <meshBasicMaterial color={0xe5e7eb} /> */}
        <meshBasicMaterial color={color} />
        {/* <meshBasicMaterial color={0xf1f3f4} /> */}
        {/* <meshBasicMaterial color={0xf8f9fa} /> */}
      </mesh>
      {vertices && (
        <TerrainContext.Provider
          value={{ geometry }} // should be geom?
        >
          {children}
        </TerrainContext.Provider>
      )}
    </>
  );
}

export default Terrain;
