export default function Anchor({ ...props }) {
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
}
