import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { useFrame, useThree } from "@react-three/fiber";

import { proxy, subscribe, useSnapshot } from "valtio";

import { BACKEND_URL, twinId } from "../index";
import * as store from "../store";
import { Pointer } from "./Pointer";

// @ts-ignore
import { io } from "socket.io-client";
import throttle from "just-throttle";

const state = proxy<{ cursors: Record<string, Cursor> }>({ cursors: {} });

const userId = Math.random().toString();

type Cursor = {
  position: [number, number, number];
};

export default function PointerAddon({ ...props }) {
  const [enabled, setEnabled] = useAtom(store.enabledAtom);
  const [, setStatus] = useAtom(store.statusAtom);

  const three = useThree();
  const scene = three.scene as THREE.Scene;
  const raycaster = three.raycaster;

  const field = scene.getObjectByName("field");

  useEffect(() => {
    const socket = io(`${BACKEND_URL}/cursor/${twinId}`, {
      transports: ["websocket"],
      autoConnect: false,
    });

    socket.on("connect", () => {
      console.log(`connected to ${BACKEND_URL}/cursor/${twinId}`);
      socket.emit("read", null, (cursors: Record<string, Cursor>) => {
        console.log("cursors", cursors);
        state.cursors = cursors;
      });
    });

    socket.on("updated", (cursors: Record<string, Cursor>) => {
      // console.log(cursors);
      state.cursors = cursors;
    });

    socket.connect();
    console.log(`connecting to ${BACKEND_URL}/cursor/${twinId}`);

    const unsubscribe = subscribe(
      state,
      throttle(() => {
        state.cursors &&
          state.cursors[userId] &&
          socket.emit("update", state.cursors[userId]);
      }, 100),
    );

    return () => unsubscribe();
  }, []);

  useFrame((_, delta) => {
    if (!raycaster || !scene || !field) return;
    const intersects = raycaster.intersectObject(field);
    if (intersects.length > 0) {
      // console.log(intersects);
      const closest = intersects[0];
      state.cursors[userId] = {
        position: [closest.point.x, closest.point.y, closest.point.z],
      };
    }
  });

  const stateSnap = useSnapshot(state);

  return (
    <>
      {stateSnap.cursors &&
        Object.entries(stateSnap.cursors).map(([k, v]: [string, any]) =>
          true ? <Pointer key={k} position={v.position} size={12} /> : null,
        )}
    </>
  );
  // return enabled ? <></> : null;
}
