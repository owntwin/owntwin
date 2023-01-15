import { useMemo, useState } from "react";

import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import { DefaultMeshBuilding } from "./components/building";

import { useFieldState } from "./lib/hooks";

function Popup({ item, ...props }: { item: { type: string; name: string } }) {
  return (
    <div
      className="bg-white border rounded py-2 px-3"
      style={{ minWidth: "200px" }}
    >
      <div className="text-xs">{item.type}</div>
      <div>{item.name}</div>
      <div className="mt-3 text-xs text-gray-600">クリックで拡大</div>
    </div>
  );
}

function Building({
  base,
  z,
  depth,
  onPointerDown,
  onClick,
  ...props
}: {
  base: [number, number][];
  z: number;
  depth: number;
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  name?: string;
  type?: string;
}) {
  const fieldState = useFieldState();

  const originLng = base[0][0],
    originLat = base[0][1];
  const origin = fieldState.coordToPlane(originLng, originLat);
  if (!origin) return null;

  const baseShape = useMemo(() => {
    const shape = new THREE.Shape();

    const reversedPoints = base
      .slice()
      .reverse()
      .map((v) => {
        const p = fieldState.coordToPlane(v[0], v[1]);
        return p;
      });

    if (reversedPoints.some((p) => !p)) return undefined;
    shape.moveTo(0, 0);
    reversedPoints.forEach((p) => {
      p && shape.lineTo(p.x - origin.x, p.y - origin.y);
    });
    return shape;
  }, [base, origin.x, origin.y, depth]);

  const [hover, setHover] = useState(false);

  if (!baseShape) return null;

  return (
    <DefaultMeshBuilding
      baseShape={baseShape}
      height={depth}
      position={[origin.x, origin.y, z]}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerOver={(ev) => {
        ev.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      <Html style={{ pointerEvents: "none" }}>
        {hover && (
          <Popup item={{ name: props.name || "", type: props.type || "" }} />
        )}
      </Html>
    </DefaultMeshBuilding>
  );
}

export default Building;
