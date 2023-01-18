import { useEffect, useState } from "react";
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
// import PointerAddon from "./addon/pointer/components/PointerAddon";

import * as types from "./types";
import type { Levelmap } from "./Terrain";

import * as constants from "./lib/constants";

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

const fetchTerrainData = async (
  definition: types.Model["terrain"],
  baseUrl?: string,
) => {
  const blankTerrain: [] = [];

  if (definition && definition.path) {
    definition.path = baseUrl
      ? new URL(definition.path, baseUrl).toString()
      : definition.path;
    const data = await axios
      .get(definition.path)
      .then((resp) => resp.data)
      .catch(() => blankTerrain);
    return data;
  } else {
    // TODO: fix
    return { data: blankTerrain };
  }
};

const fetchBuildingData = async (
  buildingData: types.Building,
  baseUrl?: string,
) => {
  const blankBuilding = {
    routes: [],
    buildings: [],
  };

  if (buildingData && buildingData.path) {
    buildingData.path = baseUrl
      ? new URL(buildingData.path, baseUrl).toString()
      : buildingData.path;
    const data = await axios
      .get(buildingData.path)
      .then((resp) => resp.data)
      .catch(() => blankBuilding);
    return data;
  } else {
    // buildingData = buildingData || {};
    // const data = blankBuilding;
    return;
  }
};

function ModelView({
  model,
  basePath,
  ...props
}: {
  model: Partial<types.Model>;
  basePath: string;
}) {
  // console.log({ model: JSON.stringify(model) });

  const [layersState] = useAtom(store.layersStateAtom);
  const [, setEntity] = useAtom(store.entityAtom);
  const [, setDetailEntity] = useAtom(store.detailEntityAtom);

  const [levelmap, setLevelmap] = useState<Levelmap>(
    Array(1000).fill([0, 0, 0]),
  );
  const [buildings, setBuildings] = useState<types.Building[]>([]);

  // TODO: move away this somewhere else
  useEffect(() => {
    (async () => {
      if (model.terrain) {
        model.terrain.data = await fetchTerrainData(model.terrain, basePath);
        setLevelmap(model.terrain.data || []);
      }
      if (model.building) {
        model.building.data = await fetchBuildingData(model.building, basePath);
        setBuildings(model.building?.data?.buildings || []);
      }
    })();
  }, [model, basePath]);

  useEffect(() => {
    // NOTE: https://stackoverflow.com/a/43321596/10954858
    const handler = (ev: any) => {
      if (ev.detail > 1) {
        ev.preventDefault();
      }
    };

    if (window) {
      window.addEventListener("pointerdown", handler);
      return () => {
        window.removeEventListener("pointerdown", handler);
      };
    }
  }, []);

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
      <Terrain
        levelmap={levelmap}
        elevationZoom={defaultElevationZoom}
        width={width}
        height={height}
      >
        {Object.values(model.modules || [])
          .reduce(
            (acc, module) => acc.concat(module.layers || []),
            [] as types.Layer[],
          )
          .map((layer) => {
            if (!layersState[layer.id] || !layersState[layer.id].enabled) {
              return null;
            }
            return <Layer key={layer.id} layer={layer} basePath={basePath} />;
          })}
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
        {/* {addons.includes("pointer") && <PointerAddon />} */}
      </Terrain>
      <ExtendedCameraControls />
      {/* <AdaptiveEvents /> */}
      {/* <Sphere args={[150, 32, 16]} /> */}
    </Canvas>
  );
}

export default ModelView;
