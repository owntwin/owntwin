import { useContext } from "react";

import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

import { FieldContext } from "../core/components/Field";

function PNGLayer({ url, ...props }: { url: string; opacity?: number }) {
  const field = useContext(FieldContext);

  const texture = useLoader(THREE.TextureLoader, url);

  return field.geometry ? (
    <mesh geometry={field.geometry}>
      <meshBasicMaterial
        map={texture}
        transparent={true}
        color={0xffffff}
        opacity={props.opacity ? props.opacity : 0.5}
      />
    </mesh>
  ) : null;
}

export default PNGLayer;
