import { useContext, useEffect, useMemo, useState } from "react";

import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import * as util from "./lib/util";

import MeshBuilding from "./components/Building";

import { ModelContext } from "./ModelView";

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
}) {
  const { model } = useContext(ModelContext);

  const originLng = base[0][0],
    originLat = base[0][1];
  const origin = util.coordToPlane(model.bbox, originLng, originLat);

  const baseShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    base
      .slice()
      .reverse()
      .forEach((v) => {
        const p = util.coordToPlane(model.bbox, v[0], v[1]);
        shape.lineTo(p.x - origin.x, p.y - origin.y);
      });
    return shape;
  }, [model, base, origin.x, origin.y, depth]);

  const [hover, setHover] = useState(false);

  return (
    <MeshBuilding
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
        {hover && <Popup item={{ name: props.name, type: props.type }} />}
      </Html>
    </MeshBuilding>
  );
}

export default Building;
