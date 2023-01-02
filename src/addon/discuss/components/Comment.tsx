import { useMemo } from "react";

import * as THREE from "three";
import { Html } from "@react-three/drei";

import { mdiPencilOutline, mdiDotsHorizontal } from "@mdi/js";

function Comment({
  position,
  content,
  ...props
}: {
  position: { x: number; y: number; z: number };
  content?: string;
}) {
  const _position = useMemo(
    () => new THREE.Vector3(position.x, position.y, position.z),
    [position],
  );
  // console.log({ position });

  return (
    <Html
      position={_position}
      style={{ transform: "translate3d(-50%,-100%,0)" }}
      distanceFactor={1000}
    >
      <div className="relative">
        <div
          className="rounded bg-gray-600 bg-opacity-50 text-white py-2 px-3"
          style={{ minWidth: "32px", width: "max-content", maxWidth: "180px" }}
        >
          <div className="text-xs">{content}</div>
        </div>
        <svg
          className="absolute text-gray-600 text-opacity-50 h-2 w-full left-0 top-full"
          x="0px"
          y="0px"
          viewBox="0 0 255 255"
          // xml:space="preserve"
        >
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
        </svg>
      </div>
    </Html>
  );
}

function CommentPrompt({ position, ...props }: { position: THREE.Vector3 }) {
  return (
    <Html
      position={position}
      style={{ transform: "translate3d(-50%,-100%,0)" }}
      distanceFactor={1000}
    >
      <div className="relative">
        <div
          className="rounded bg-gray-600 bg-opacity-50 text-white py-2 px-3"
          style={{}}
        >
          <div className="text-xs flex justify-center items-center">
            <div className="flex justify-center items-center w-5 h-5 text-white">
              <svg
                className="fill-current"
                style={{ width: "24px", height: "24px" }}
                viewBox="0 0 24 24"
              >
                <path d={mdiPencilOutline} />
              </svg>
            </div>
            <div className="flex justify-center items-center w-5 h-5 text-white">
              <svg
                className="fill-current"
                style={{ width: "24px", height: "24px" }}
                viewBox="0 0 24 24"
              >
                <path d={mdiDotsHorizontal} />
              </svg>
            </div>
          </div>
        </div>
        <svg
          className="absolute text-gray-600 text-opacity-50 h-2 w-full left-0 top-full"
          x="0px"
          y="0px"
          viewBox="0 0 255 255"
          // xml:space="preserve"
        >
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
        </svg>
      </div>
    </Html>
  );
}

export default Comment;
export { CommentPrompt };
