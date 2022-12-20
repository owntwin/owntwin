import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
// import { Plane } from '@react-three/drei';
import {
  // CameraHelper,
  BufferAttribute,
} from "three";
import { useAtom } from "jotai";
import * as store from "./lib/store";

// import tw from 'twin.macro';

import { ModelContext } from "./ModelView";
import * as util from "./lib/util";

export const TerrainContext = createContext();

const segments = util.canvas.segments;

function BlankPlane({ width, height, color, ...props }) {
  // const { model } = useContext(ModelContext);
  const _model = useContext(ModelContext);
  const model = _model.model; // TODO: Fix

  const [, setCoords] = useState([]);

  const [debug, setDebug] = useAtom(store.debugAtom);

  useEffect(() => {
    if (!debug) setCoords([]);
  }, [debug]);

  return (
    <mesh // TODO: model && <mesh ?
      onDoubleClick={(ev) => {
        if (ev.shiftKey) {
          ev.stopPropagation();
          // console.log({ intersections: ev.intersections });
          if (ev.intersections.length > 0) {
            let point = ev.intersections[0].point;
            // console.log(point);
            let coord = util.planeToCoord(model.bbox, point.x, point.y);
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
        color={color || 0xf1f3f5}
        polygonOffset={true}
        polygonOffsetFactor={1}
      />
    </mesh>
  );
}

function Terrain({ levelmap, zoom, width, height, ...props }) {
  const [vertices, setVertices] = useState(null);

  const geom = useRef();
  useLayoutEffect(() => {
    // TODO: useEffect
    const positionAttribute = geom.current.getAttribute("position");

    levelmap.forEach((v) => {
      const pos = v[0] + segments * (segments - 1 - v[1]);
      positionAttribute.array[pos * 3 + 2] = v[2] * zoom; // pos.z
    });

    // console.log(positionAttribute);
    geom.current.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(positionAttribute.array), 3),
    );
    setVertices(Array.from(positionAttribute.array));
  }, [levelmap, zoom]);

  return (
    <>
      <BlankPlane width={width} height={height} />
      <mesh name="terrain">
        <planeGeometry
          ref={geom}
          args={[width, height, segments - 1, segments - 1]}
        />
        <meshBasicMaterial color={0xf8f9fa} />
      </mesh>
      <TerrainContext.Provider
        value={{ geometry: geom.current, vertices: vertices }} // should be geom?
      >
        {props.children}
      </TerrainContext.Provider>
    </>
  );
}

export default Terrain;
