import { useEffect, useRef } from "react";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import throttle from "just-throttle";

import * as types from "../types";

import { useAtom } from "jotai";
import * as store from "../store";
import { controlsStateAtom } from "../../../lib/store";

import { subscribe, useSnapshot } from "valtio";
import { drawState, BACKEND_URL, twinId } from "../share";
declare module "valtio" {
  function useSnapshot<T extends object>(p: T): T;
}

// @ts-ignore
import { io } from "socket.io-client";

import { Line, LinePen } from "./Line";
import { Erase } from "./Erase";
import BrushAddon from "./Brush";

function Draw() {
  const three = useThree();
  const scene = three.scene as THREE.Scene;
  const raycaster = three.raycaster;

  const pen = useRef<THREE.Mesh>(null);

  const [, setControlsState] = useAtom(controlsStateAtom);
  useEffect(() => {
    setControlsState((state) => ({ ...state, enableRotate: false }));
    return () => {
      setControlsState((state) => ({ ...state, enableRotate: true }));
    };
  }, []);

  const terrain = scene.getObjectByName("terrain");

  useFrame((_, delta) => {
    if (!raycaster || !scene || !pen.current || !terrain) return;
    const intersects = raycaster.intersectObject(terrain);
    if (intersects.length > 0) {
      // console.log(intersects);
      const closest = intersects[0];
      pen.current.position.set(
        closest.point.x,
        closest.point.y,
        closest.point.z,
      );
    }
    // if (delta % 10 < 5) return;
  });

  // TODO: Fix initial position
  return <LinePen position={[0, 0, 0]} ref={pen} />;
}

export default function DrawAddon({
  brush = false,
  ...props
}: {
  brush?: boolean;
}) {
  const drawSnap = useSnapshot(drawState);

  const [selectedTool] = useAtom(store.selectedToolAtom);

  useEffect(() => {
    const endpoint = `${BACKEND_URL}/drawing/${twinId}`;

    const socket = io(endpoint, {
      transports: ["websocket"],
      autoConnect: false,
    });

    socket.on("connect", () => {
      // console.log(`connected to ${endpoint}`);
      socket.emit("read", null, (drawings: types.Drawing[]) => {
        // console.log("drawings", drawings);
        drawState.drawings = drawings;
      });
    });

    socket.on("updated", (drawings: types.Drawing[]) => {
      // console.log(drawings);
      drawState.drawings = drawings;
    });

    socket.connect();
    // console.log(`connecting to ${endpoint}`);

    const unsubscribe = subscribe(
      drawState,
      throttle(() => {
        if (!drawState.drawings) return;
        // console.log(`updating ${drawState.drawings}`);
        socket.emit("update", drawState.drawings);
      }, 0),
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      {selectedTool === "draw" && <Draw />}
      {selectedTool === "erase" && <Erase linesData={drawSnap.drawings} />}
      {drawSnap.drawings.map((linepts, i) => (
        <Line key={i} points={linepts.points} />
      ))}
      {brush && <BrushAddon />}
    </>
  );
}
