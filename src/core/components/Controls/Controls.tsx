import { useEffect, useRef, useCallback } from "react";

import { useThree } from "@react-three/fiber";
import * as THREE from "three";

import debounce from "just-debounce-it";
// import { KeyboardKeyHold } from "hold-event";

import { useAtom } from "jotai";
import { closeupAtom, controlsStateAtom } from "../../store";

import { CameraControls } from "./CameraControls";
import CameraControlsDefault from "camera-controls";

const ZERO = new THREE.Vector3(0, 0, 0);

const isTouch = () =>
  window.matchMedia("(pointer: coarse)").matches ? true : false;

export function ExtendedCameraControls({ ...props }) {
  const CLOSEUP_THRESHOLD = 1000; // TODO: remove constants
  const [, setCloseup] = useAtom(closeupAtom);
  const [controlsState] = useAtom(controlsStateAtom);

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

    // TODO: ensure proper order
    if (controlsState.truckMode) {
      cameraControls.mouseButtons.left = CameraControlsDefault.ACTION.TRUCK;
    } else {
      cameraControls.mouseButtons.left = CameraControlsDefault.ACTION.ROTATE;
    }

    if (!controlsState.enableRotate) {
      cameraControls.mouseButtons.left = CameraControlsDefault.ACTION.NONE;
      cameraControls.touches.one = CameraControlsDefault.ACTION.NONE;
    } else {
      // cameraControls.mouseButtons.left = CameraControlsDefault.ACTION.ROTATE;
      cameraControls.touches.one = CameraControlsDefault.ACTION.TOUCH_ROTATE;
    }
  }, [controlsState, controlsState.enableRotate, controlsState.truckMode]);

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
      // TODO: dynamically change speed depending on pointerType
      dollySpeed={isTouch() ? 0.9 : 0.5}
      boundaryEnclosesCamera={true}
    />
  );
}
