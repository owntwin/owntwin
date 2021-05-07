import { Suspense } from 'react';

import PNGLayer from './layers/PNGLayer';
import SVGMeshLayer from './layers/SVGMeshLayer';

function Layer({ def, basePath, ...props }) {
  if (basePath) {
    def.path = basePath ? new URL(def.path, basePath).toString() : def.path;
  }
  if (def.format === 'svg') {
    return <SVGMeshLayer url={def.path} />;
  } else if (def.format === 'png') {
    return (
      <Suspense fallback={null}>
        <PNGLayer url={def.path} opacity={0.5} />
      </Suspense>
    );
  }
}

export default Layer;
