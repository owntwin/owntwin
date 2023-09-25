import { useCallback } from "react";

import { Label } from "../labels";

import { useAtom } from "jotai";
import * as store from "../../store";

export function BeamAnchor({
  position,
  label,
  labelVisibility = "auto",
  height = 256,
  radius = 5,
  color = 0x2196f3,
}: {
  position: [number, number, number];
  label?: string;
  labelVisibility?: "auto" | "always";
  height?: number;
  radius?: number;
  color?: string | number;
}) {
  const [closeup] = useAtom(store.closeupAtom);

  const geometry = useCallback(
    (geometry: THREE.CylinderGeometry) => {
      if (geometry) {
        geometry.rotateX(Math.PI / 2); // TODO: Use lookAt
        geometry.translate(0, 0, height / 2);
      }
    },
    [height],
  );

  // useLayoutEffect(() => {
  //   // mesh.current.rotateX(Math.PI / 2);
  //   mesh.current.up.set(0, 0, 1);
  //   mesh.current.lookAt(0, 0, mesh.current.position.z);
  //   mesh.current.position.z = height / 2;
  // }, []);

  return (
    <mesh position={position}>
      <cylinderGeometry ref={geometry} args={[radius, radius, height, 8]} />
      <meshBasicMaterial color={color} opacity={0.5} transparent={true} />
      <Label visible={labelVisibility === "always" || closeup}>
        <pre>{label}</pre>
      </Label>
    </mesh>
  );
}
