import { useEffect, useMemo, useState } from "react";

import axios from "axios";

import { CANVAS } from "../lib/constants";

import {
  // SphereAnchor,
  BeamAnchor,
} from "../Anchor";

import { parse as parseCSV } from "csv-parse/browser/esm/sync";

import { useFieldState } from "../lib/hooks";

function Anchor({
  coordinates,
  label,
  labelVisibility = "auto",
  clip = true,
  size = {},
  ...props
}: {
  coordinates: [number | string, number | string, number | string];
  label?: string;
  labelVisibility?: "auto" | "always";
  clip?: boolean;
  size?: { height?: number };
  color?: number | string;
  opacity?: number;
}) {
  const fieldState = useFieldState();

  const { origin, z } = useMemo(() => {
    const originLng = parseFloat(coordinates[0].toString()),
      originLat = parseFloat(coordinates[1].toString());
    const origin = fieldState.coordToPlane(originLng, originLat);

    if (!origin)
      return { origin: { x: undefined, y: undefined }, z: undefined };

    // const z = 0; // coordinates[0][2]; // TODO: z from GeoJSON?
    // TODO: Fix: terrain is [0,1023], origin.x/y is [-512,512]
    const z =
      fieldState.getAltitude(origin.x + 1024 / 2, origin.y + 1024 / 2) || 0;

    return { origin, z };
  }, [coordinates]);

  // const geom = new THREE.SphereBufferGeometry(1, 20, 20);
  // geom.translate(origin.x, origin.y, z);

  // console.log(coordinates, origin, [origin.x, origin.y, z]);

  if (!origin.x || !origin.y) return null;

  // NOTE: Clip off-terrain anchors
  // TODO: Fix
  if (
    clip &&
    (origin.x < -CANVAS.width / 2 ||
      CANVAS.width / 2 <= origin.x ||
      origin.y < -CANVAS.height / 2 ||
      CANVAS.height / 2 <= origin.y)
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
