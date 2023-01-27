import { Html } from "@react-three/drei";

export function SphereAnchor({
  position,
  label,
  color = 0x2196f3,
}: {
  position: [number, number, number];
  label?: string;
  color?: string | number;
}) {
  return (
    <mesh position={position}>
      <sphereBufferGeometry args={[40, 20, 20]} />
      <meshBasicMaterial color={color} opacity={0.5} transparent={true} />
      <Html style={{ pointerEvents: "none", userSelect: "none" }}>
        <div
          style={{
            display: true ? "block" : "none",
            fontSize: "0.75rem",
            fontWeight: "normal",
            width: "10rem",
            color: "rgb(156 163 175)",
          }}
        >
          {label}
        </div>
      </Html>
    </mesh>
  );
}
