import { ReactNode, useEffect, useMemo, useState } from "react";

import * as THREE from "three";
import { MeshProps } from "@react-three/fiber";

// export type Building = {
//   id: string;
//   name: string;
//   path: string;
//   base: [number, number][];
//   z: number;
//   depth: number;
//   type: string;
//   data?: any;
// };

export function Building({
  id,
  position,
  children,
  ...props
}: {
  id: string;
  position?: GeoJSON.Position;
  children?: ReactNode;
}) {
  return <>{children}</>;
}

export function DefaultMeshBuilding({
  baseShape,
  height,
  position = [0, 0, 0],
  color = {
    default: 0xf1f3f4,
    line: 0xcccccc,
    hover: 0x666666,
  },
  wireframe = false,
  onPointerOver,
  onPointerOut,
  children,
  ...props
}: {
  baseShape: THREE.Shape;
  height: number;
  position?: [number, number, number];
  color?: { default: number; line: number; hover: number };
  wireframe?: boolean;
  onPointerOver?: Function;
  onPointerOut?: Function;
  children?: ReactNode;
} & MeshProps) {
  const [hover, setHover] = useState(false);

  const geom = useMemo(() => {
    const extrudeSettings = {
      steps: 1,
      depth: height || 50,
      bevelEnabled: false,
    };
    return new THREE.ExtrudeGeometry(baseShape, extrudeSettings);
  }, [baseShape]);

  useEffect(() => {
    if (hover) {
      document.body.style.cursor = "pointer";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hover]);

  return (
    <mesh
      position={position}
      geometry={geom}
      onPointerOver={(ev) => {
        ev.stopPropagation();
        setHover(true);
        onPointerOver && onPointerOver(ev);
      }}
      onPointerOut={(ev) => {
        setHover(false);
        onPointerOut && onPointerOut(ev);
      }}
      {...props}
    >
      <meshLambertMaterial
        color={hover ? color.hover : color.default}
        wireframe={wireframe}
        visible={!wireframe}
      />
      <lineSegments>
        <edgesGeometry attach="geometry" args={[geom, 45]} />
        <lineBasicMaterial color={color.line} attach="material" />
      </lineSegments>
      {children}
    </mesh>
  );
}
