import { useEffect, useState } from "react";

import { useField } from "@owntwin/core";

import { GeoJSONLayer } from "./GeoJSONLayer";
import { geojson } from "flatgeobuf";

export function FlatGeobufLayer({
  url,
  ...props
}: {
  url: string;
  opacity?: number;
  colors?: any;
  extrude?: any;
}) {
  const field = useField();

  const [data, setData] = useState<any>();

  useEffect(() => {
    (async () => {
      // console.log({ field, url });
      if (!field.bbox) return;
      const {
        minlng: minX,
        minlat: minY,
        maxlng: maxX,
        maxlat: maxY,
      } = field.bbox;
      const iter = geojson.deserialize(url, { minX, minY, maxX, maxY });
      // console.log(iter);
      const fc: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: [],
      };
      // TODO: fix
      for await (let feature of iter) {
        // TODO: remove
        if (feature.properties?.attributes) {
          feature.properties.attributes = JSON.parse(
            feature.properties.attributes,
          );
        }
        fc.features.push(feature);
      }
      // console.log(fc);
      setData(fc);
    })();
  }, [field.bbox]);

  return data ? <GeoJSONLayer data={data} {...props} /> : null;
}
