// Derived from https://github.com/pmndrs/drei/blob/1667297a64766b2d2c50198da35615554116bf3d/src/core/Detailed.tsx

import * as React from "react";
import { LOD, Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import mergeRefs from "react-merge-refs";

type Props = JSX.IntrinsicElements["lOD"] & {
  children: React.ReactElement<Object3D>[];
  distances: number[];
  hysteresis?: number;
};

export const Detailed = React.forwardRef(
  ({ children, distances, hysteresis = 0.0, ...props }: Props, ref) => {
    const lodRef = React.useRef<LOD>(null!);
    React.useLayoutEffect(() => {
      const { current: lod } = lodRef;
      lod.levels.length = 0;
      lod.children.forEach((object, index) =>
        lod.levels.push({ object, distance: distances[index], hysteresis }),
      );
    });
    useFrame((state) => lodRef.current?.update(state.camera));
    return (
      <lOD ref={mergeRefs([lodRef, ref])} {...props}>
        {children}
      </lOD>
    );
  },
);
