import { useEffect, useMemo, useState } from "react";

import axios from "axios";
import { groupBy } from "@owntwin/core/lib/utils";
import { bboxClip } from "@turf/turf";
import sift from "sift";
// import jsonata from "jsonata"; // TODO: use Jsonata for updates using values

import * as THREE from "three";
import * as BufferGeometryUtils from "three-stdlib/utils/BufferGeometryUtils";
import { extend, Object3DNode } from "@react-three/fiber";

// TODO: fix
import { useFieldState } from "@owntwin/core/components/Field/hooks";
import { useField } from "@owntwin/core";

import SelectableLayer from "./SelectableLayer";

import polygon from "./polygon";
import multiPolygon from "./multi-polygon";
import lineString from "./line-string";
import multiLineString from "./multi-line-string";

import type { ObjectData } from "./types";

import { useAtom } from "jotai";
import { entityStoreAtom } from "@owntwin/core/components/ModelView/store";

import {
  MeshLineGeometry,
  MeshLineMaterial,
  //  MeshLineRaycast
} from "meshline";

extend({ MeshLineGeometry, MeshLineMaterial });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      meshLineGeometry: Object3DNode<MeshLineGeometry, typeof MeshLineGeometry>;
      meshLineMaterial: Object3DNode<MeshLineMaterial, typeof MeshLineMaterial>;
    }
  }
}

// Update GeoJSON
const updateFeatureCollection = (
  featureCollection: GeoJSON.FeatureCollection,
  query: Record<string, any>,
  appendProperties: Record<string, any>,
) => {
  featureCollection.features = featureCollection.features.map((v) => {
    if (sift(query)(v)) {
      v.properties = v.properties || {};
      v.properties = { ...v.properties, ...appendProperties };
      return v;
    } else {
      return v;
    }
  });
  return featureCollection;
};

export function GeoJSONLayer({
  url,
  data,
  clip = true,
  extrude = true,
  edges = false,
  colors,
  properties = [],
  opacity = 0.5,
  selectable = true,
  ...props
}: {
  url?: string;
  data?: any;
  clip?: boolean;
  extrude?: boolean;
  edges?: boolean;
  colors?: Record<string, any>;
  properties?: [Record<string, any>, Record<string, any>][];
  opacity?: number;
  selectable?: boolean;
  // TODO: add "style" prop
}) {
  colors = Object.assign(
    {
      default: 0xd1d5db, // 0xe5e7eb, 0x9ca3af, 0xb0b0b0, 0xff00ff, 0xc0c0c0
      // default: 0xffffff, // 0xe5e7eb, 0x9ca3af, 0xb0b0b0, 0xff00ff, 0xc0c0c0
      hover: 0x666666,
      edges: 0xfefefe,
    },
    colors,
  );
  // NOTE: for backward compatibility; to fix
  edges = extrude;

  const field = useField();
  const fieldState = useFieldState();

  const [entityStore, updateEntityStore] = useAtom(entityStoreAtom);
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection>();

  // useEffect(() => {
  //   if (!geojson) return;
  //   if (style.length > 0) {
  //     console.log(
  //       style[0],
  //       geojson.features,
  //       (geojson.features = geojson.features.map((v) => {
  //         if (sift(style[0])(v)) {
  //           return { ...v, ...style[1] };
  //         } else {
  //           return v;
  //         }
  //       })),
  //     );
  //   }
  // }, [style, geojson]);

  // Load JSON from URL
  useEffect(() => {
    // Prioritizing data
    if (data) {
      properties.map(([query, record]) => {
        data = updateFeatureCollection(data, query, record);
      });
      setGeojson(data);
    } else if (url) {
      (async () => {
        const data: GeoJSON.FeatureCollection = await axios
          .get(url)
          .then((resp) => resp.data);
        // console.log(data);
        setGeojson(data);
      })();
    }
  }, [url, data]);

  const geometries = useMemo(() => {
    if (!geojson || !geojson.features) return undefined;

    if (!field.ready) return undefined;
    if (!field.bbox) {
      // console.error(...);
      return undefined;
    }

    // console.log("geojson", geojson);

    const geometries: ObjectData[] = [];

    const isGeometryCovered = (geometry: GeoJSON.Geometry) => {
      let originLng: number, originLat: number;
      // TODO: fix
      if (geometry.type === "Polygon") {
        // originLng = geometry.coordinates[0][0][0];
        // originLat = geometry.coordinates[0][0][1];
        return true;
      } else if (geometry.type === "MultiPolygon") {
        // originLng = geometry.coordinates[0][0][0][0];
        // originLat = geometry.coordinates[0][0][0][1];
        return true;
      } else if (geometry.type === "LineString") {
        // originLng = geometry.coordinates[0][0];
        // originLat = geometry.coordinates[0][1];
        return true;
      } else if (geometry.type === "MultiLineString") {
        // originLng = geometry.coordinates[0][0][0];
        // originLat = geometry.coordinates[0][0][1];
        return true;
      } else {
        console.error("Not implemented");
        return undefined;
      }

      const origin = fieldState.coordToPlane(originLng, originLat);

      if (!origin) return false;

      if (
        clip &&
        (origin.x < -fieldState.canvas.width / 2 ||
          fieldState.canvas.width / 2 <= origin.x ||
          origin.y < -fieldState.canvas.height / 2 ||
          fieldState.canvas.height / 2 <= origin.y)
      )
        return false;
      else return true;
    };

    const createGeometryFromFeature = (feature: GeoJSON.Feature) => {
      let geometry: THREE.BufferGeometry | null;

      if (feature.geometry.type === "Polygon") {
        geometry = polygon.createGeometry(
          feature as GeoJSON.Feature<GeoJSON.Polygon>,
          extrude,
          fieldState,
        );
      } else if (feature.geometry.type === "MultiPolygon") {
        geometry = multiPolygon.createGeometry(
          feature as GeoJSON.Feature<GeoJSON.MultiPolygon>,
          extrude,
          fieldState,
        );
      } else if (feature.geometry.type === "LineString") {
        geometry = lineString.createGeometry(
          feature as GeoJSON.Feature<GeoJSON.LineString>,
          fieldState,
        );
      } else if (feature.geometry.type === "MultiLineString") {
        geometry = multiLineString.createGeometry(
          feature as GeoJSON.Feature<GeoJSON.MultiLineString>,
          fieldState,
        );
      } else {
        console.error(`Not implemented: "${feature.geometry.type}"`);
        return undefined;
      }

      return geometry;
    };

    geojson.features.forEach((feature) => {
      if (feature.geometry.type === "GeometryCollection") {
        // feature.geometry.geometries.forEach((geometry) => {
        //   if (!isGeometryCovered(geometry)) return;
        //   // TODO: geometry cannot have properties and hence height values;
        //   // Possibly, we may have an array of height values to map onto geometries
        //   const threeGeometry = createGeometryFromFeature(geometry);
        //   if (!threeGeometry) return;
        //   geometries.push({
        //     geometry: threeGeometry,
        //     id: feature.properties?.id,
        //   });
        // });
      } else {
        if (!isGeometryCovered(feature.geometry)) return;

        // Clip line-like geometries
        // TODO: fix
        if (
          field.bbox &&
          ["LineString", "MultiLineString"].includes(feature.geometry.type)
        ) {
          try {
            feature = bboxClip(
              feature as GeoJSON.Feature<
                | GeoJSON.LineString
                | GeoJSON.MultiLineString
                | GeoJSON.Polygon
                | GeoJSON.MultiPolygon
              >,
              [
                field.bbox.minlng,
                field.bbox.minlat,
                field.bbox.maxlng,
                field.bbox.maxlat,
              ],
            );
          } catch (err) {
            console.error(err);
          }
        }

        const { id } = feature.properties || {};
        const {
          name,
          visibility,
          ...restProperties
        }: { name: string; visibility: string } = {
          ...(entityStore[id] || {}),
          // TODO: fix
          ...(feature.properties || {}),
          ...(feature.properties?.attributes || {}),
        };

        // Skip hidden features
        if (visibility === "hidden") return;

        const geometry = createGeometryFromFeature(feature);
        if (!geometry) return;

        // if (id && name) {
        //   updateEntityStore((store) => {
        //     const entry = {
        //       ...(store[id] || {}),
        //       name,
        //     };
        //     const updatedStore = { ...store, [id]: entry };
        //     return updatedStore;
        //   });
        // }

        geometries.push({
          geometry,
          id,
          visibility: visibility,
          properties: restProperties || {},
        });
      }
    });
    return geometries;
  }, [geojson, fieldState.getAltitude, clip]);

  const mergedGeometries = useMemo(() => {
    // TODO: fix
    const result: { basic: any[]; meshline: any[] } = {
      basic: [],
      meshline: [],
    };

    if (!geometries || geometries.length === 0) return result;

    const colorGroups = groupBy(
      geometries,
      (x) => x.properties.colors || colors,
    );
    // console.log("colorGroups", colorGroups);

    colorGroups.map(([colors, mergingGeometries]) => {
      // TODO: fix filter condition
      const basicGeometries = mergingGeometries
        .filter((v) => !(v.geometry.type === "MeshLineGeometry"))
        .map((v) => v.geometry);
      const mergedBasicGeometry =
        basicGeometries.length > 0
          ? BufferGeometryUtils.mergeBufferGeometries(basicGeometries, false)
          : null;

      if (mergedBasicGeometry)
        result.basic.push({
          colors: colors,
          geometry: mergedBasicGeometry,
        });

      // TODO: fix filter condition
      const meshlineGeometries = mergingGeometries
        .filter((v) => v.geometry.type === "MeshLineGeometry")
        .map((v) => v.geometry);
      const mergedMeshlineGeometry =
        meshlineGeometries.length > 0
          ? BufferGeometryUtils.mergeBufferGeometries(meshlineGeometries, false)
          : null;

      if (mergedMeshlineGeometry)
        result.meshline.push({
          colors: colors,
          geometry: mergedMeshlineGeometry,
        });
    });
    return result;
  }, [geometries]);

  return (
    <>
      {mergedGeometries.basic.map(
        ({ colors, geometry: mergedGeometry }, i) =>
          mergedGeometry &&
          colors && (
            <mesh key={i} geometry={mergedGeometry}>
              <meshBasicMaterial
                color={colors.default}
                transparent={true}
                opacity={opacity}
                side={extrude ? undefined : THREE.DoubleSide}
                depthTest={extrude ? true : false} // TODO: recheck
                depthWrite={false}
                polygonOffset={true}
                polygonOffsetUnits={1}
                polygonOffsetFactor={extrude ? 1 : -36} // TODO: Set appropriate value
              />
              {edges && (
                <lineSegments>
                  <edgesGeometry
                    attach="geometry"
                    args={[mergedGeometry, 45]}
                  />
                  <lineBasicMaterial
                    color={colors.edges}
                    attach="material"
                    depthWrite={true}
                  />
                </lineSegments>
              )}
            </mesh>
          ),
      )}
      {mergedGeometries.meshline.map(
        ({ colors, geometry: mergedGeometry }, i) =>
          mergedGeometry &&
          colors && (
            <mesh key={i} geometry={mergedGeometry}>
              <meshLineMaterial
                lineWidth={1}
                color={colors.default}
                // transparent={true}
                // opacity={opacity}
                // transparent
                depthTest={false}
                // depthWrite={false}
                // polygonOffset={true}
                polygonOffsetUnits={1}
                polygonOffsetFactor={-64}
              />
            </mesh>
          ),
      )}
      {selectable && geometries && <SelectableLayer geometries={geometries} />}
    </>
  );
}
