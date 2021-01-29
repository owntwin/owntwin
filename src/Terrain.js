import { createContext, useContext, useEffect, useState } from 'react';
import { useUpdate } from 'react-three-fiber';
// import { Plane } from '@react-three/drei';
// import { CameraHelper } from 'three';
import { useAtom } from 'jotai';
import * as store from './lib/store';

// import tw from 'twin.macro';

import { ModelContext } from './ModelView';
import * as util from './lib/util';

export const TerrainContext = createContext();

const width = 1024,
  height = 1024;
const segments = 100;
const terrainLevelZoom = 2;

function BlankPlane({ width, height, color, ...props }) {
  const { model } = useContext(ModelContext);

  const [coords, setCoords] = useState([]);

  const [debug, setDebug] = useAtom(store.debugAtom);

  useEffect(() => {
    if (!debug) setCoords([]);
  }, [debug]);

  return (
    <mesh
      onDoubleClick={(ev) => {
        if (ev.shiftKey) {
          ev.stopPropagation();
          // console.log({ intersections: ev.intersections });
          if (ev.intersections.length > 0) {
            let point = ev.intersections[0].point;
            // console.log(point);
            let coord = util.planeToCoord(model, point.x, point.y);
            // setCoords((val) => [...val, `[${coord.lat}, ${coord.lng}, 0]`]);
            setCoords((val) => [...val, `[${coord.lng}, ${coord.lat}]`]);
            setDebug(`[${coords.join(', ')}]`);
          }
        }
      }}
    >
      <planeBufferGeometry args={[width, height]} />
      <meshBasicMaterial
        color={color || 0xf1f3f5}
        polygonOffset={true}
        polygonOffsetFactor={1}
      />
    </mesh>
  );
}

function Terrain({ levelmap, ...props }) {
  const [vertices, setVertices] = useState(null);

  const geom = useUpdate(
    (geometry) => {
      let zoom = terrainLevelZoom;
      for (let i = 0; i < levelmap.length; i++) {
        let v = levelmap[i];
        let pos = v[0] + segments * (segments - 1 - v[1]);
        geometry.vertices[pos].z = v[2] * zoom;
      }
      geometry.verticesNeedUpdate = true;
      setVertices(Array.from(geometry.vertices));
    },
    [levelmap],
  );

  return (
    <>
      <BlankPlane width={width} height={height} />
      <mesh>
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
