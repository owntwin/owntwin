import { Html } from "@react-three/drei";

function SVGStrokeFilter() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0">
      <filter id="stroke">
        <feMorphology
          in="SourceAlpha"
          result="diated"
          operator="dilate"
          radius="1"
        ></feMorphology>
        <feFlood floodColor="#ffffff" floodOpacity="1" result="color"></feFlood>
        <feComposite
          in="color"
          in2="diated"
          operator="in"
          result="outer"
        ></feComposite>
        <feMerge>
          <feMergeNode in="outer" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </svg>
  );
}

// NOTE: Requires SVGStrokeFilter rendered beforehand
function Label({
  text,
  visible,
  ...props
}: {
  text?: string;
  visible: boolean;
}) {
  return (
    <Html style={{ pointerEvents: "none", userSelect: "none" }}>
      <div
        style={{
          display: visible ? "block" : "none",
          // fontSize: "0.75rem",
          // fontWeight: "normal",
          width: "10rem",
          // color: "rgb(156 163 175)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 400 10"
          height="0.75rem"
          // className="border"
          style={{ dominantBaseline: "hanging" }}
        >
          {/* <filter id="stroke">
              <feMorphology
                in="SourceAlpha"
                result="diated"
                operator="dilate"
                radius="1"
              ></feMorphology>
              <feFlood
                floodColor="#ffffff"
                floodOpacity="1"
                result="color"
              ></feFlood>
              <feComposite
                in="color"
                in2="diated"
                operator="in"
                result="outer"
              ></feComposite>
              <feMerge>
                <feMergeNode in="outer" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter> */}
          <text
            x="0"
            y="0"
            style={{
              fontWeight: "normal",
              fontSize: "0.75rem",
              fill: "rgb(107 114 128)",
            }}
            filter="url(#stroke)"
          >
            {text}
          </text>
        </svg>
      </div>
    </Html>
  );
}

export { SVGStrokeFilter, Label };
