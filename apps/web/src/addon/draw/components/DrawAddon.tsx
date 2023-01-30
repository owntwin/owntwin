import { useEffect } from "react";

import throttle from "just-throttle";

import type * as types from "../types";

import { useAtom } from "jotai";
import * as store from "../store";

import { subscribe, useSnapshot } from "valtio";
import { drawState, BACKEND_URL, twinId } from "../share";
declare module "valtio" {
  function useSnapshot<T extends object>(p: T): T;
}

// @ts-ignore
import { io } from "socket.io-client";

import { Draw } from "./Draw";
import { Line } from "./Line";
import { Erase } from "./Erase";
import BrushAddon from "./Brush";

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
        <Line
          key={i}
          points={linepts.points}
          lineWidth={linepts.lineWidth}
          color={linepts.color}
          opacity={linepts.opacity}
        />
      ))}
      {brush && <BrushAddon />}
    </>
  );
}
