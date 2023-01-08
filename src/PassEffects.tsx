import { EffectComposer, SMAA } from "@react-three/postprocessing";
import { FXAAEffect } from "postprocessing";
import { forwardRef, Suspense, useMemo } from "react";

const FXAA = forwardRef(({}, ref) => {
  const effect = useMemo(() => new FXAAEffect(), []);
  return <primitive ref={ref} object={effect} />;
});

export function PassEffects() {
  const datas = {
    density: 1.25,
  };

  return (
    <Suspense fallback={null}>
      <EffectComposer multisampling={0}>
        <>
          {/* <FXAA /> */}
          <SMAA />
        </>
      </EffectComposer>
    </Suspense>
  );
}
