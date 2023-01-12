import { useContext, useEffect, useMemo, useState } from "react";

import axios from "axios";

import { BBox } from "../types";
import * as util from "../lib/util";

import { ModelContext } from "../ModelView";
import {
  // SphereAnchor,
  BeamAnchor,
} from "../Anchor";

import { parse as parseCSV } from "csv-parse/browser/esm/sync";

import { useAtom } from "jotai";
import { getTerrainAltitudeAtom } from "../lib/store";

function Anchor({
  coordinates,
  bbox,
  label,
  labelVisibility = "auto",
  clip = true,
  size = {},
  ...props
}: {
  coordinates: [number | string, number | string, number | string];
  bbox: BBox;
  label?: string;
  labelVisibility?: "auto" | "always";
  clip?: boolean;
  size?: { height?: number };
  color?: number | string;
  opacity?: number;
}) {
  const [getTerrainAltitude] = useAtom(getTerrainAltitudeAtom);

  const { origin, z } = useMemo(() => {
    const originLng = parseFloat(coordinates[0].toString()),
      originLat = parseFloat(coordinates[1].toString());
    const origin = util.coordToPlane(bbox, originLng, originLat);

    // const z = 0; // coordinates[0][2]; // TODO: z from GeoJSON?
    // TODO: Fix: terrain is [0,1023], origin.x/y is [-512,512]
    const z = getTerrainAltitude(origin.x + 1024 / 2, origin.y + 1024 / 2) || 0;

    return { origin, z };
  }, [coordinates]);

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
    return null;

  return z ? (
    <BeamAnchor
      position={[origin.x, origin.y, z]}
      label={label}
      labelVisibility={labelVisibility}
      height={size.height}
      radius={2}
      color={props.color}
    />
  ) : null;
}

export default function CSVLayer({
  url,
  clip = true,
  ...props
}: {
  url: string;
  clip?: boolean;
  keys: { lng: number; lat: number; label: string }; // TODO: Fix; maybe Record<string, ...>
  labelVisibility?: "auto" | "always";
  opacity?: number;
  color?: string | number;
  size?: { height?: number };
}) {
  const _model = useContext(ModelContext);
  const model = _model.model; // TODO: Fix
  const bbox = model.bbox;

  if (!bbox) return null;

  const [data, setData] = useState<Record<string, any>>();

  /* load JSON from URL */
  useEffect(() => {
    !!url &&
      (async () => {
        const _data = await axios.get(url).then((resp) => resp.data);
        // console.log(_data);
        const records: Record<string, any> = parseCSV(_data, {
          columns: true,
          skip_empty_lines: true,
        });
        // console.log(records);
        setData(records);
      })();
  }, [url]);

  return (
    // TODO: Fix
    <group>
      {data &&
        data.map((record: Record<string, any>, i: number) => {
          // console.log(record);
          return (
            <Anchor
              key={i} // TODO: Fix key
              clip={clip}
              coordinates={[record[props.keys.lng], record[props.keys.lat], 0]}
              bbox={bbox}
              label={record[props.keys.label]}
              labelVisibility={props.labelVisibility}
              color={props.color}
              size={props.size}
              opacity={props.opacity ? props.opacity : 0.5}
            />
          );
        })}
    </group>
  );
}
