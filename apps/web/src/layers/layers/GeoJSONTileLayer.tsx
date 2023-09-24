import { useEffect, useState } from "react";

import { useField } from "@owntwin/core";

import { GeoJSONLayer } from "./GeoJSONLayer";

import axios from "axios";
// @ts-ignore
import SphericalMercator from "@mapbox/sphericalmercator";

const sm = new SphericalMercator();

export function GeoJSONTileLayer({
  url,
  zoom = 16,
  ...props
}: {
  url: string;
  zoom: number;
  opacity?: number;
  colors?: any;
  extrude?: any;
}) {
  const field = useField();

  const [data, setData] = useState<any>();

  useEffect(() => {
    if (!field.bbox) return;
    const tileBounds = sm.xyz(
      [
        field.bbox.minlng,
        field.bbox.minlat,
        field.bbox.maxlng,
        field.bbox.maxlat,
      ],
      zoom,
    );
    // console.log(tileBounds, url);
    const filledUrls: string[] = [];
    for (let x = tileBounds.minX; x <= tileBounds.maxX; x++) {
      for (let y = tileBounds.minY; y <= tileBounds.maxY; y++) {
        const filledUrl = url
          .replace("{x}", x)
          .replace("{y}", y)
          .replace("{z}", zoom.toString());
        // console.log(filledUrl);
        filledUrls.push(filledUrl);
      }
    }
    (async () => {
      const featureCollections: any[] = [];
      await Promise.all(
        filledUrls.map(async (url) => {
          try {
            const fc = await axios.get(url).then((resp) => resp.data);
            // console.log("fc", fc);
            if (fc.type === "FeatureCollection") {
              featureCollections.push(fc);
            }
            // console.log(_data);
          } catch (err) {
            // console.error(err);
          }
        }),
      );
      // console.log("featureCollections", featureCollections);
      const merged = featureCollections.reduce(
        (prev, curr) => ({
          ...prev,
          features: [...prev.features, ...curr.features],
        }),
        { type: "FeatureCollection", features: [] },
      );
      // console.log("merged", merged);
      setData(merged);
    })();
  }, [field.bbox]);

  return data ? <GeoJSONLayer data={data} {...props} /> : null;
}
