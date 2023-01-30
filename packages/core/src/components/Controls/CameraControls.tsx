// Derived from https://codesandbox.io/embed/react-three-fiber-camera-controls-4jjor

import {
  forwardRef,
  ForwardedRef,
  MutableRefObject,
  useEffect,
  useRef,
} from "react";
import {
  MOUSE,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  MathUtils,
} from "three";
import {
  ReactThreeFiber,
  extend,
  useFrame,
  useThree,
  Overwrite,
  NodeProps,
  EventManager,
} from "@react-three/fiber";
import CameraControlsDefault from "camera-controls";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      cameraControlsDefault: ReactThreeFiber.Node<
        CameraControlsDefault,
        typeof CameraControlsDefault
      >;
    }
  }
}

const subsetOfTHREE = {
  MOUSE: MOUSE,
  Vector2: Vector2,
  Vector3: Vector3,
  Vector4: Vector4,
  Quaternion: Quaternion,
  Matrix4: Matrix4,
  Spherical: Spherical,
  Box3: Box3,
  Sphere: Sphere,
  Raycaster: Raycaster,
  MathUtils: {
    DEG2RAD: MathUtils.DEG2RAD,
    clamp: MathUtils.clamp,
  },
};

CameraControlsDefault.install({ THREE: subsetOfTHREE });
extend({ CameraControlsDefault });

export const CameraControls = forwardRef<
  CameraControlsDefault,
  Overwrite<
    Partial<CameraControlsDefault>,
    NodeProps<CameraControlsDefault, typeof CameraControlsDefault>
  >
>((props, ref) => {
  const cameraControls = useRef<CameraControlsDefault | null>(null);
  const camera = useThree((state) => state.camera);
  const renderer = useThree((state) => state.gl);

  // NOTE: wee need following lines to make CameraControls work in a module
  // Refer to https://github.com/pmndrs/drei/blob/master/src/core/OrbitControls.tsx
  const events = useThree((state) => state.events) as EventManager<HTMLElement>;
  const explDomElement = (events.connected ||
    renderer.domElement) as HTMLElement;
  useEffect(() => {
    cameraControls.current?.connect(explDomElement);
    return () => void cameraControls.current?.dispose();
  }, [cameraControls.current, ref, explDomElement]);

  useFrame((_, delta) => cameraControls.current?.update(delta));
  // useFrame((_, delta) => cameraControls.current?.update(delta), -1);

  useEffect(() => () => cameraControls.current?.dispose(), []);

  return (
    <cameraControlsDefault
      ref={mergeRefs<CameraControlsDefault>(cameraControls, ref)}
      args={[camera, renderer.domElement]}
      {...props}
    />
  );
});

export type CameraControls = CameraControlsDefault;

function mergeRefs<T>(...refs: (MutableRefObject<T> | ForwardedRef<T>)[]) {
  return (instance: T): void => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
    }
  };
}
