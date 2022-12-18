import "styled-components/macro";
import { Html } from "@react-three/drei";
import tw from "twin.macro";
import { mdiPencilOutline, mdiDotsHorizontal } from "@mdi/js";

import * as THREE from "three";

function Comment({
  position,
  content = null,
  z,
  depth,
  onPointerDown,
  ...props
}) {
  position = new THREE.Vector3(position.x, position.y, position.z);
  // console.log({ position });

  return (
    <Html
      position={position}
      style={{ transform: "translate3d(-50%,-100%,0)" }}
      distanceFactor={1000}
    >
      <div css={[tw`relative`]}>
        <div
          css={[tw`rounded bg-gray-600 bg-opacity-50 text-white py-2 px-3`]}
          style={{ minWidth: "32px", width: "max-content", maxWidth: "180px" }}
        >
          <div css={[tw`text-xs`]}>{content}</div>
        </div>
        <svg
          css={[
            tw`absolute text-gray-600 text-opacity-50 h-2 w-full left-0 top-full`,
          ]}
          x="0px"
          y="0px"
          viewBox="0 0 255 255"
          // xml:space="preserve"
        >
          <polygon css={[tw`fill-current`]} points="0,0 127.5,127.5 255,0" />
        </svg>
      </div>
    </Html>
  );
}

function CommentPrompt({ position, base, z, depth, onPointerDown, ...props }) {
  return (
    <Html
      position={position}
      style={{ transform: "translate3d(-50%,-100%,0)" }}
      distanceFactor={1000}
    >
      <div css={[tw`relative`]}>
        <div
          css={[tw`rounded bg-gray-600 bg-opacity-50 text-white py-2 px-3`]}
          style={{}}
        >
          <div css={[tw`text-xs flex justify-center items-center`]}>
            <div
              css={[tw`flex justify-center items-center w-5 h-5 text-white`]}
            >
              <svg
                css={[tw`fill-current`]}
                style={{ width: "24px", height: "24px" }}
                viewBox="0 0 24 24"
              >
                <path d={mdiPencilOutline} />
              </svg>
            </div>
            <div
              css={[tw`flex justify-center items-center w-5 h-5 text-white`]}
            >
              <svg
                css={[tw`fill-current`]}
                style={{ width: "24px", height: "24px" }}
                viewBox="0 0 24 24"
              >
                <path d={mdiDotsHorizontal} />
              </svg>
            </div>
          </div>
        </div>
        <svg
          css={[
            tw`absolute text-gray-600 text-opacity-50 h-2 w-full left-0 top-full`,
          ]}
          x="0px"
          y="0px"
          viewBox="0 0 255 255"
          // xml:space="preserve"
        >
          <polygon css={[tw`fill-current`]} points="0,0 127.5,127.5 255,0" />
        </svg>
      </div>
    </Html>
  );
}

export default Comment;
export { CommentPrompt };
