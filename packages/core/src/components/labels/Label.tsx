import { ReactNode } from "react";

import { Html } from "@react-three/drei";

export function Label({
  visible,
  children,
  ...props
}: {
  visible: boolean;
  children?: ReactNode;
}) {
  return (
    <Html
      style={{
        pointerEvents: "none",
        userSelect: "none",
        // display: visible && current > 0.9 ? "block" : "none",
        display: visible ? "block" : "none",
        // visibility: visible && current > 0.9 ? "visible" : "hidden",
        width: "20rem",
        // border: "1px solid",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          fontSize: "0.8rem",
          fontWeight: 900,
          WebkitTextStroke: "1px white",
          color: "white",
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          fontSize: "0.8rem",
          fontWeight: "normal",
          color: "rgb(107 114 128)",
        }}
      >
        {children}
      </div>
    </Html>
  );
}
