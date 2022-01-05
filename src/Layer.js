import { Suspense } from 'react';

import PNGLayer from './layers/PNGLayer';
import SVGMeshLayer from './layers/SVGMeshLayer';
import GeoJSONLayer from './layers/GeoJSONLayer';
import CSVLayer from './layers/CSVLayer';

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
  } else if (def.format === 'geojson') {
    return <GeoJSONLayer url={def.path} opacity={0.5} />;
  } else if (def.format === 'csv') {
    return (
      <CSVLayer
        url={def.path}
        keys={def.keys}
        color={def.color}
        size={def.size}
        opacity={0.5}
      />
    );
  }
}

export default Layer;
