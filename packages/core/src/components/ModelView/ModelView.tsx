import { ReactNode, useEffect } from "react";

import { Canvas } from "@react-three/fiber";

import { Camera } from "../Camera";
import { ExtendedCameraControls } from "../Controls";

import { useAtom } from "jotai";
import { canvasAtom } from "./store";

// TODO: Remove constants
const _segments = 100;

export function ModelView({
  width = 1024,
  height = 1024,
  bbox,
  children,
}: {
  addons?: ReactNode[];
  width?: number;
  height?: number;
  // TODO: allow computed value
  bbox: any;
  children?: ReactNode;
}) {
  const [, setCanvas] = useAtom(canvasAtom);

  useEffect(() => {
    setCanvas({
      width,
      height,
      _segments,
      bbox,
    });
  }, [width, height, bbox]);

  useEffect(() => {
    // NOTE: https://stackoverflow.com/a/43321596/10954858
    const handler = (ev: any) => {
      if (ev.detail > 1) {
        ev.preventDefault();
      }
    };
    if (window) {
      window.addEventListener("pointerdown", handler);
      return () => {
        window.removeEventListener("pointerdown", handler);
      };
    }
  }, []);

  return (
    <Canvas
      linear={false} // NOTE: just for explicity; see https://github.com/pmndrs/react-three-fiber/releases/tag/v8.0.0
      flat={true} // TODO: reconsideration
      // dpr={Math.min(2, window.devicePixelRatio)}
      // gl={{ powerPreference: "default", antialias: false }}
      gl={{ powerPreference: "high-performance", antialias: false }}
      // frameloop="demand"
    >
      <Camera width={width} height={height} />
      {children}
      <ExtendedCameraControls />
    </Canvas>
  );
}
