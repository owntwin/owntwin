import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";

function SVGStrokeFilter() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0">
      <filter id="stroke">
        <feMorphology
          in="SourceAlpha"
          result="dilated"
          operator="dilate"
          radius="1"
        />
        <feFlood floodColor="#ffffff" floodOpacity="1" result="color" />
        <feComposite in="color" in2="dilated" operator="in" result="outer" />
        <feMerge>
          <feMergeNode in="outer" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </svg>
  );
}

// NOTE: Requires SVGStrokeFilter rendered beforehand
// TODO: fix performance regression on mobile devices; use plain-text when needed?
function SVGLabel({
  text,
  visible,
  ...props
}: {
  text?: string;
  visible: boolean;
}) {
  const current = useThree((state) => state.performance.current);

  return visible && current > 0.9 ? (
    <Html style={{ pointerEvents: "none", userSelect: "none" }}>
      <div
        style={{
          // display: visible && current > 0.99 ? "block" : "none",
          // visibility: visible && current > 0.99 ? "visible" : "hidden",
          // fontSize: "0.75rem",
          // fontWeight: "normal",
          width: "10rem",
          // color: "rgb(156 163 175)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 400 20"
          height="1.5rem"
          // style={{ display: visible && current > 0.5 ? "block" : "none" }}
          // style={{ dominantBaseline: "hanging" }} // NOTE: Not working in Safari :(
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
            y="50%"
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
  ) : null;
}

function Label({
  text,
  visible,
  ...props
}: {
  text?: string;
  visible: boolean;
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
        {text}
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
        {text}
      </div>
    </Html>
  );
}

export { SVGStrokeFilter, SVGLabel, Label };
