import { useEffect, createContext, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveEvents, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

import { ExtendedCameraControls } from "./Controls";

import axios from "axios";

import { useAtom } from "jotai";
import * as store from "./lib/store";

import Terrain from "./Terrain";
import Layer from "./Layer";
import Building from "./Building";

import DiscussAddon from "./addon/discuss/components/DiscussAddon";
import DrawAddon from "./addon/draw/components/DrawAddon";
import PointerAddon from "./addon/pointer/components/PointerAddon";

import * as types from "./types";
import type { Levelmap } from "./Terrain";

import * as constants from "./lib/constants";

export const ModelContext = createContext<{ model: Partial<types.Model> }>({
  model: {},
});

/* Constants */
// TODO: Improve
const defaultElevationZoom = 2;
const width = constants.CANVAS.width,
  height = constants.CANVAS.height;

const addons = import.meta.env.VITE_ADDONS
  ? import.meta.env.VITE_ADDONS.split(",")
  : [];

function DefaultCamera({ ...props }) {
  // const camera = useRef();
  // useHelper(camera, THREE.CameraHelper, 1, 'hotpink');

  const { gl } = useThree();

  useEffect(() => {
    if (!gl) return;
    gl.clippingPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), 512 - 2),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), 512 - 2),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), 512 - 2),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), 512 - 2),
    ];
  }, []);

  return (
    <PerspectiveCamera
      makeDefault
      up={[0, 0, 1]}
      position={[0, -800 * 1.2, 400 * 1.2]}
      fov={60}
      aspect={window.innerWidth / window.innerHeight}
      near={1}
      far={2048 * 1.25}
      // ref={camera}
    />
  );
}

async function completeModel(model: Partial<types.Model>, base?: string) {
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
    model.terrain = model.terrain ? model.terrain : { data: blankTerrain };
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
    // model.building = model.building || {};
    // model.building.data = blankBuilding;
  }

  return model;
}

function ModelView({
  model,
  basePath,
  ...props
}: {
  model: Partial<types.Model>;
  basePath: string;
}) {
  // console.log({ model: JSON.stringify(model) });

  const [levelmap, setLevelmap] = useState<Levelmap>([]);
  const [buildings, setBuildings] = useState<types.Building[]>([]);

  useEffect(() => {
    completeModel(model, basePath).then((model) => {
      setLevelmap(model.terrain?.data || []);
      setBuildings(model.building?.data.buildings);
    });
  }, [model, basePath]);

  useEffect(() => {
    // NOTE: https://stackoverflow.com/a/43321596/10954858
    const handler = (ev: any) => {
      if (ev.detail > 1) {
        ev.preventDefault();
      }
    };

    if (window) {
      window.addEventListener("mousedown", handler);
      return () => {
        window.removeEventListener("mousedown", handler);
      };
    }
  }, []);

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
          elevationZoom={defaultElevationZoom}
          width={width}
          height={height}
        >
          {model.modules &&
            Object.values(model.modules)
              .reduce(
                (acc, module) => acc.concat(module.definition.layers || []),
                [] as types.Layer[],
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
          {addons.includes("discuss") && <DiscussAddon />}
          {addons.includes("draw") && <DrawAddon />}
          {addons.includes("pointer") && <PointerAddon />}
        </Terrain>
      </ModelContext.Provider>
      {/* <ExtendedOrbitControls /> */}
      <ExtendedCameraControls />
      {/* <AdaptiveEvents /> */}
      {/* <Sphere args={[150, 32, 16]} /> */}
    </Canvas>
  );
}

export default ModelView;
