import { useEffect, createContext, useState, useRef, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { AdaptiveEvents, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

import axios from "axios";
import debounce from "just-debounce-it";
// import { KeyboardKeyHold } from "hold-event";

import { useAtom } from "jotai";
import * as store from "./lib/store";

import { CameraControls } from "./lib/components/CameraControls";
import CameraControlsDefault from "camera-controls";

import Terrain from "./Terrain";
import Layer from "./Layer";
import Building from "./Building";

import DiscussAddon from "./addon/discuss/components/DiscussAddon";
import DrawAddon from "./addon/draw/components/DrawAddon";
import PointerAddon from "./addon/pointer/components/PointerAddon";

import type { Model } from "./types";
import * as constants from "./lib/constants";

const ZERO = new THREE.Vector3(0, 0, 0);

export const ModelContext = createContext<{ model: Partial<Model> }>({
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

/*
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
*/

function ExtendedCameraControls({ ...props }) {
  const CLOSEUP_THRESHOLD = 1000;
  const [, setCloseup] = useAtom(store.closeupAtom);
  const [controlsState] = useAtom(store.controlsStateAtom);

  const { camera, performance, regress } = useThree(
    ({ camera, performance }) => ({
      camera,
      performance,
      regress: performance.regress,
    }),
  );

  useEffect(() => {
    // performance.min = 0.5;
    // performance.debounce = 200;
  }, []);

  const ref = useRef<CameraControls>(null);

  useEffect(() => {
    if (!ref || !ref.current) return;

    const cameraControls = ref.current;

    if (!controlsState.enableRotate) {
      cameraControls.mouseButtons.left = CameraControlsDefault.ACTION.NONE;
    } else {
      cameraControls.mouseButtons.left = CameraControlsDefault.ACTION.ROTATE;
    }
  }, [controlsState]);

  const cb = useCallback((ev: any) => {
    const deboncedReset = debounce(() => {
      // console.log("reset");
      const position = new THREE.Vector3();
      ref.current?.getPosition(position);
      const dist = position.distanceTo(ZERO);
      // TODO: Handle constants properly
      if (dist > 1200) {
        ref.current?.setTarget(0, 0, 0, true);
      }
    }, 500);
    deboncedReset();

    // TODO: Use LOD instead
    const position = new THREE.Vector3();
    ref.current?.getPosition(position);
    const dist2 = position.distanceTo(ZERO);
    // console.log(dist2);
    dist2 < CLOSEUP_THRESHOLD ? setCloseup(true) : setCloseup(false);
  }, []);

  useEffect(() => {
    if (!ref || !ref.current) return;
    // console.log(ref.current);

    const cameraControls = ref.current;

    // TODO: Handle constants properly
    const bbox = new THREE.Box3(
      new THREE.Vector3(-512 * 2, -512 * 2, 0),
      new THREE.Vector3(512 * 2, 512 * 2, 512 * 3),
    );
    cameraControls.setBoundary(bbox);

    cameraControls.setTarget(0, 0, 0);
    cameraControls.setOrbitPoint(0, 0, 0);

    const updateConfig = (ev: KeyboardEvent) => {
      if (ev.shiftKey || ev.ctrlKey || ev.altKey || ev.metaKey) {
        cameraControls.mouseButtons.left = CameraControlsDefault.ACTION.TRUCK;
      } else {
        cameraControls.mouseButtons.left = CameraControlsDefault.ACTION.ROTATE;
      }
    };

    // cameraControls.removeEventListener("rest", cb);
    cameraControls.addEventListener("rest", cb);
    cameraControls.addEventListener("control", regress);
    window.addEventListener("keydown", updateConfig);
    window.addEventListener("keyup", updateConfig);

    return () => {
      cameraControls.removeEventListener("rest", cb);
      cameraControls.removeEventListener("control", regress);
      window.removeEventListener("keydown", updateConfig);
      window.removeEventListener("keyup", updateConfig);
    };
  }, [camera]);

  // TODO: Key controls
  // useEffect(() => {
  //   if (!ref || !ref.current) return;

  //   const cameraControls = ref.current;

  //   console.log("controls");

  //   const KEYCODE = {
  //     W: 87,
  //     A: 65,
  //     S: 83,
  //     D: 68,
  //     ARROW_LEFT: 37,
  //     ARROW_UP: 38,
  //     ARROW_RIGHT: 39,
  //     ARROW_DOWN: 40,
  //   };

  //   const moveForward = (ev: any) => {
  //       cameraControls.forward(0.05 * ev.deltaTime, false);
  //     },
  //     moveBackward = (ev: any) => {
  //       cameraControls.forward(-0.05 * ev.deltaTime, false);
  //     },
  //     rotateLeft = (ev: any) => {
  //       // TODO: not working; change target instead of rotation
  //       cameraControls.rotate(
  //         -0.1 * THREE.MathUtils.DEG2RAD * ev.deltaTime,
  //         0,
  //         true,
  //       );
  //     },
  //     rotateRight = (ev: any) => {
  //       cameraControls.rotate(
  //         0.1 * THREE.MathUtils.DEG2RAD * ev.deltaTime,
  //         0,
  //         true,
  //       );
  //     };

  //   const wKey = new KeyboardKeyHold(KEYCODE.W, 16.666);
  //   const aKey = new KeyboardKeyHold(KEYCODE.A, 16.666);
  //   const sKey = new KeyboardKeyHold(KEYCODE.S, 16.666);
  //   const dKey = new KeyboardKeyHold(KEYCODE.D, 16.666);
  //   aKey.addEventListener("holding", rotateLeft);
  //   dKey.addEventListener("holding", rotateRight);
  //   wKey.addEventListener("holding", moveForward);
  //   sKey.addEventListener("holding", moveBackward);

  //   const leftKey = new KeyboardKeyHold(KEYCODE.ARROW_LEFT, 16.666);
  //   const rightKey = new KeyboardKeyHold(KEYCODE.ARROW_RIGHT, 16.666);
  //   const upKey = new KeyboardKeyHold(KEYCODE.ARROW_UP, 16.666);
  //   const downKey = new KeyboardKeyHold(KEYCODE.ARROW_DOWN, 16.666);
  //   leftKey.addEventListener("holding", rotateLeft);
  //   rightKey.addEventListener("holding", rotateRight);
  //   upKey.addEventListener("holding", moveForward);
  //   downKey.addEventListener("holding", moveBackward);

  //   return () => {
  //     aKey.removeEventListener("holding", rotateLeft);
  //     dKey.removeEventListener("holding", rotateRight);
  //     wKey.removeEventListener("holding", moveForward);
  //     sKey.removeEventListener("holding", moveBackward);
  //     leftKey.removeEventListener("holding", rotateLeft);
  //     rightKey.removeEventListener("holding", rotateRight);
  //     upKey.removeEventListener("holding", moveForward);
  //     downKey.removeEventListener("holding", moveBackward);
  //   };
  // }, [ref?.current]);

  return (
    <CameraControls
      attach="cameraControls" // NOTE: -> scene.cameraControls
      ref={ref}
      minDistance={100}
      maxDistance={1500}
      maxPolarAngle={Math.PI / 2 - 0.1}
      dollyToCursor={true}
      azimuthRotateSpeed={0.5}
      polarRotateSpeed={0.5}
      dollySpeed={0.5} // TODO: Set faster on mobile debices
      boundaryEnclosesCamera={true}
    />
  );
}

async function completeModel(model: Partial<Model>, base?: string) {
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
    model.building = model.building || {};
    model.building.data = blankBuilding;
  }

  return model;
}

function ModelView({
  model,
  basePath,
  ...props
}: {
  model: Partial<Model>;
  basePath: string;
}) {
  // console.log({ model: JSON.stringify(model) });

  const [levelmap, setLevelmap] = useState([]);
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    completeModel(model, basePath).then((model) => {
      setLevelmap(model.terrain.data);
      setBuildings(model.building.data.buildings);
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
          {addons.includes("discuss") && <DiscussAddon />}
          {addons.includes("draw") && <DrawAddon />}
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
