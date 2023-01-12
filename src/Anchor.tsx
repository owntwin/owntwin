import { useLayoutEffect, useRef } from "react";

import { Html } from "@react-three/drei";

import { Label } from "./Label";

import { useAtom } from "jotai";
import * as store from "./lib/store";

function SphereAnchor({
  position,
  label,
  color = 0x2196f3,
  ...props
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

function BeamAnchor({
  position,
  label,
  labelVisibility = "auto",
  height = 256,
  radius = 5,
  color = 0x2196f3,
  ...props
}: {
  position: [number, number, number];
  label?: string;
  labelVisibility?: "auto" | "always";
  height?: number;
  radius?: number;
  color?: string | number;
}) {
  // const mesh = useRef(null);
  const geom = useRef<THREE.CylinderGeometry>(null);

  const [closeup] = useAtom(store.closeupAtom);

  useLayoutEffect(() => {
    if (geom.current) {
      geom.current.rotateX(Math.PI / 2); // TODO: Use lookAt
      geom.current.translate(0, 0, height / 2);
    }
  }, [height]);

  // useLayoutEffect(() => {
  //   // mesh.current.rotateX(Math.PI / 2);
  //   mesh.current.up.set(0, 0, 1);
  //   mesh.current.lookAt(0, 0, mesh.current.position.z);
  //   mesh.current.position.z = height / 2;
  // }, []);

  return (
    <mesh position={position}>
      <cylinderGeometry ref={geom} args={[radius, radius, height, 8]} />
      <meshBasicMaterial color={color} opacity={0.5} transparent={true} />
      <Label text={label} visible={labelVisibility === "always" || closeup} />
      {/* <Html style={{ pointerEvents: "none", userSelect: "none" }}>
        <div
          style={{
            display: labelVisibility === "always" || closeup ? "block" : "none",
            // fontSize: "0.75rem",
            // fontWeight: "normal",
            width: "10rem",
            // color: "rgb(156 163 175)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 10"
            height="0.75rem"
            // className="border"
            style={{ dominantBaseline: "hanging" }}
          > */}
      {/* <filter id="stroke">
              <feMorphology
                in="SourceAlpha"
                result="diated"
                operator="dilate"
                radius="1"
              ></feMorphology>
              <feFlood
                floodColor="#ffffff"
                floodOpacity="1"
                result="color"
              ></feFlood>
              <feComposite
                in="color"
                in2="diated"
                operator="in"
                result="outer"
              ></feComposite>
              <feMerge>
                <feMergeNode in="outer" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter> */}
      {/* <text
              x="0"
              y="0"
              style={{
                fontWeight: "normal",
                fontSize: "0.75rem",
                fill: "rgb(107 114 128)",
              }}
              filter="url(#stroke)"
            >
              {label}
            </text>
          </svg>
        </div>
      </Html> */}
    </mesh>
  );
}

export { SphereAnchor, BeamAnchor };

// export default function Anchor({ ...props }) {
// return (
//   <mesh
//     key={j}
//     position={[p.x - origin.x, p.y - origin.y, floorHeight / 2]}
//     userData={{ data: v }}
//     visible={activeFloor === null || activeFloor === i + 1}
//   >
//     <sphereBufferGeometry args={[0.1, 20, 20]} />
//     <meshBasicMaterial color={0x2196f3} />
//     <mesh
//       name="hitbox"
//       visible={activeFloor === null || activeFloor === i + 1}
//       onPointerOver={(ev) => {
//         ev.stopPropagation();
//         activeFloor === i + 1 && setAnchorHover(v.id);
//       }}
//       onPointerOut={(ev) => {
//         ev.stopPropagation();
//         anchorHover === v.id && setAnchorHover(null);
//       }}
//       onPointerDown={(ev) => {
//         if (activeFloor !== i + 1 || !anchorHover === v.id) return;
//         ev.stopPropagation();
//         // TODO: Switch on click
//         // setLocalEntity(v);
//         setEntity(v);
//         setAnchorActive(v.id);
//       }}
//     >
//       <sphereBufferGeometry args={[1, 20, 20]} />
//       <meshBasicMaterial
//         visible={anchorHover === v.id || anchorActive === v.id}
//         color={0x2196f3}
//         opacity={0.5}
//         transparent={true}
//       />
//     </mesh>
//     <Html style={{ pointerEvents: 'none' }}>
//       <div
//         style={{
//           display:
//             activeFloor === null || activeFloor === i + 1 ? 'block' : 'none',
//           fontSize: '0.75rem',
//           fontWeight:
//             anchorHover === v.id || anchorActive === v.id ? 'bold' : null,
//           width: '10rem',
//         }}
//       >
//         {v.name}
//       </div>
//     </Html>
//   </mesh>
// );
// }
