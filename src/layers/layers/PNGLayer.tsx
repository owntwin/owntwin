import { useContext } from "react";

import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

import { FieldContext } from "../../core/components/Field";

export function PNGLayer({
  url,
  opacity = 0.5,
}: {
  url: string;
  opacity?: number;
}) {
  const field = useContext(FieldContext);

  const texture = useLoader(THREE.TextureLoader, url);

  return field.geometry ? (
    <mesh geometry={field.geometry}>
      <meshBasicMaterial
        map={texture}
        transparent={true}
        color={0xffffff}
        opacity={opacity}
      />
    </mesh>
  ) : null;
}
