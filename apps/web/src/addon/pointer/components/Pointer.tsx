import { useState, Dispatch, SetStateAction, useCallback } from "react";

import { ThreeEvent } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";

export function Pointer({
  position,
  size,
  setActive,
}: {
  position: [number, number, number];
  size: number;
  setActive?: Dispatch<SetStateAction<boolean>>;
}) {
  const [_active, _setActive] = useState(false);

  const onDown = useCallback(
    (ev?: unknown) => {
      if (!_active) {
        _setActive(true);
        setActive && setActive(true);
      }
    },
    [_active],
  );

  const onMove = useCallback(
    (ev: ThreeEvent<PointerEvent>) => {
      // TODO: throttle
      if (["touch", "pen"].includes(ev.pointerType) && !_active) {
        _setActive(true);
        setActive && setActive(true);
      }
    },
    [_active],
  );

  return (
    <>
      <Sphere
        args={[size]}
        position={position}
        onPointerDown={() => onDown()}
        onPointerMove={(ev) => onMove(ev)}
        onPointerUp={() => {
          _setActive(false);
          setActive && setActive(false);
        }}
      >
        <meshBasicMaterial attach="material" color="yellow" />
      </Sphere>
    </>
  );
}
