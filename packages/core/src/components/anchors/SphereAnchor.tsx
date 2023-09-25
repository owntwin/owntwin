import { useAtom } from "jotai";
import * as store from "../../store";

import { Label } from "../labels";

export function SphereAnchor({
  position,
  label,
  labelVisibility = "auto",
  radius = 40,
  color = 0x2196f3,
  opacity = 0.25,
}: {
  position: [number, number, number];
  label?: string;
  labelVisibility?: string;
  radius?: number;
  color?: string | number;
  opacity?: number;
}) {
  const [closeup] = useAtom(store.closeupAtom);

  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 20, 20]} />
      <meshBasicMaterial
        color={color}
        opacity={opacity}
        transparent={true}
        depthWrite={false}
      />
      <Label visible={labelVisibility === "always" || closeup}>
        <pre>{label}</pre>
      </Label>
    </mesh>
  );
}
