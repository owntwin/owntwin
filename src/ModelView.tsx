import { useEffect, createContext, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
// import { CameraHelper } from 'three';
import axios from "axios";

import { useAtom } from "jotai";
import * as store from "./lib/store";

import Terrain from "./Terrain";
import Layer from "./Layer";
import Building from "./Building";

import Discuss from "./addon/discuss/components/Discuss";
import DrawAddon from "./addon/draw/components/Draw";

export const ModelContext = createContext();

/* Constants */
// TODO: Improve
const terrainLevelZoom = 2;
const width = 1024,
  height = 1024;

const addons = import.meta.env.VITE_ADDONS
  ? import.meta.env.VITE_ADDONS.split(",")
  : [];

function DefaultCamera({ ...props }) {
  // const camera = useRef();
  // useHelper(camera, CameraHelper, 1, 'hotpink');

  return (
    <PerspectiveCamera
      makeDefault
      up={[0, 0, 1]}
      position={[0, -800 * 1.2, 400 * 1.2]}
      fov={60}
      aspect={window.innerWidth / window.innerHeight}
      near={1}
      far={2048}
      // ref={camera}
    />
  );
}

function ExtendedOrbitControls({ ...props }) {
  const CLOSEUP_THRESHOLD = 400000;

  const [, setCloseup] = useAtom(store.closeupAtom);
  const { camera } = useThree();

  return (
    <OrbitControls
      attach="orbitControls"
      target={[0, 0, 0]}
      minDistance={100}
      maxDistance={1500}
      maxPolarAngle={Math.PI / 2 - 0.1}
      zoomSpeed={0.5}
      onEnd={() => {
        const dist2 =
          camera.position.x ** 2 +
          camera.position.y ** 2 +
          camera.position.z ** 2;
        // console.log(dist2);
        dist2 < CLOSEUP_THRESHOLD ? setCloseup(true) : setCloseup(false);
      }}
    />
  );
}

async function completeModel(model, base?: string) {
  const blankTerrain: [] = [];

  if (model.terrain && model.terrain.path) {
    model.terrain.path = base
      ? new URL(model.terrain.path, base).toString()
      : model.terrain.path;
    model.terrain.data = await axios
      .get(model.terrain.path)
      .then((resp) => resp.data)
      .catch(() => blankTerrain);
  } else {
    model.terrain = model.terrain || {};
    model.terrain.data = blankTerrain;
  }

  const blankBuilding = {
    routes: [],
    buildings: [],
  };

  if (model.building && model.building.path) {
    model.building.path = base
      ? new URL(model.building.path, base).toString()
      : model.building.path;
    model.building.data = await axios
      .get(model.building.path)
      .then((resp) => resp.data)
      .catch(() => blankBuilding);
  } else {
    model.building = model.building || {};
    model.building.data = blankBuilding;
  }

  return model;
}

function ModelView({ model, basePath, ...props }) {
  // console.log({ model: JSON.stringify(model) });

  const [levelmap, setLevelmap] = useState([]);
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    completeModel(model, basePath).then((model) => {
      setLevelmap(model.terrain.data);
      setBuildings(model.building.data.buildings);
    });
  }, [model, basePath]);

  const [layersState] = useAtom(store.layersStateAtom);
  const [, setEntity] = useAtom(store.entityAtom);
  const [, setDetailEntity] = useAtom(store.detailEntityAtom);

  return (
    <Canvas
      id="model-view-canvas"
      linear={false} // NOTE: See https://github.com/pmndrs/react-three-fiber/releases/tag/v8.0.0
      flat={true} // TODO: Reconsideration
      dpr={Math.min(2, window.devicePixelRatio)}
      gl={{ powerPreference: "default", antialias: false }}
      // frameloop="demand"
    >
      <DefaultCamera />
      <ambientLight args={[0xffffff, 1]} />
      <pointLight position={[10, 10, 10]} />
      <ModelContext.Provider value={{ model: model }}>
        <Terrain
          levelmap={levelmap}
          zoom={terrainLevelZoom}
          width={width}
          height={height}
        >
          {Object.values(model.modules)
            .reduce(
              (acc, module) => acc.concat(module.definition.layers || []),
              [],
            )
            .map((layer) =>
              layersState[layer.id] && layersState[layer.id].enabled ? (
                <Layer key={layer.id} def={layer} basePath={basePath} />
              ) : null,
            )}
          {buildings.map((building) => (
            <Building
              key={building.id}
              base={building.base}
              z={building.z}
              depth={building.depth}
              name={building.name}
              type={building.type}
              onPointerDown={(ev) => {
                ev.stopPropagation();
                setEntity(building);
                setDetailEntity(building);
              }}
            />
          ))}
          {addons.includes("discuss") && <Discuss />}
          {addons.includes("draw") && <DrawAddon />}
        </Terrain>
      </ModelContext.Provider>
      )
      <ExtendedOrbitControls />
    </Canvas>
  );
}

export default ModelView;
