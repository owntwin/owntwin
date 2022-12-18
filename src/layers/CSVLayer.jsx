import { useContext, useEffect, useState } from 'react';

import axios from 'axios';

import * as util from '../lib/util';

import { TerrainContext } from '../Terrain';
import { ModelContext } from '../ModelView';

import {
  // SphereAnchor,
  BeamAnchor,
} from '../Anchor';

import { parse as parseCSV } from 'csv-parse/browser/esm/sync';

function Anchor({
  coordinates,
  bbox,
  terrain,
  label = null,
  labelVisibility = 'auto',
  clip = true,
  size = {},
  ...props
}) {
  const originLng = parseFloat(coordinates[0]),
    originLat = parseFloat(coordinates[1]);

  const origin = util.coordToPlane(bbox, originLng, originLat);
  // const z = 0; // coordinates[0][2]; // TODO: z from GeoJSON?
  // TODO: Fix: terrain is [0,1023], origin.x/y is [-512,512]
  const z =
    util.getTerrainAltitude(
      terrain,
      origin.x + 1024 / 2,
      origin.y + 1024 / 2,
    ) || 0;

  // const geom = new THREE.SphereBufferGeometry(1, 20, 20);
  // geom.translate(origin.x, origin.y, z);

  // console.log(coordinates, origin, [origin.x, origin.y, z]);

  // NOTE: Clip off-terrain anchors
  // TODO: Fix
  if (
    clip &&
    (origin.x < -util.canvas.width / 2 ||
      util.canvas.width / 2 <= origin.x ||
      origin.y < -util.canvas.height / 2 ||
      util.canvas.height / 2 <= origin.y)
  )
    return <></>;

  return (
    <BeamAnchor
      position={[origin.x, origin.y, z]}
      label={label}
      labelVisibility={labelVisibility}
      height={size.height}
      color={props.color}
    />
  );
}

export default function CSVLayer({ url, clip = true, ...props }) {
  const terrain = useContext(TerrainContext);
  const _model = useContext(ModelContext);
  const model = _model.model; // TODO: Fix
  const [data, setData] = useState(null);

  /* load JSON from URL */
  useEffect(() => {
    !!url &&
      (async () => {
        const _data = await axios.get(url).then((resp) => resp.data);
        // console.log(_data);
        const records = parseCSV(_data, {
          columns: true,
          skip_empty_lines: true,
        });
        // console.log(records);
        setData(records);
      })();
  }, [url]);

  return (
    <group opacity={props.opacity ? props.opacity : 0.5}>
      {data &&
        model &&
        terrain &&
        data.map((record) => {
          // console.log(record);
          return (
            <Anchor
              clip={clip}
              coordinates={[record[props.keys.lng], record[props.keys.lat]]}
              bbox={model.bbox}
              terrain={terrain}
              label={record[props.keys.label]}
              labelVisibility={props.labelVisibility}
              color={props.color}
              size={props.size}
            />
          );
        })}
    </group>
  );
}
