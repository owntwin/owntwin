import { useContext } from "react";
import { useLoader } from "@react-three/fiber";

import * as THREE from "three";

import { TerrainContext } from "../Terrain";

function PNGLayer({ url, ...props }) {
  const terrain = useContext(TerrainContext);

  const texture = useLoader(THREE.TextureLoader, url);

  return (
    <mesh geometry={terrain.geometry}>
      <meshBasicMaterial
        map={texture}
        transparent={true}
        color={0xffffff}
        opacity={props.opacity ? props.opacity : 0.5}
      />
    </mesh>
  );
}

export default PNGLayer;
