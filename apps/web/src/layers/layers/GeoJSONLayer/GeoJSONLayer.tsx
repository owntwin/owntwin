import { useEffect, useMemo, useState } from "react";

import axios from "axios";
import { groupBy } from "@owntwin/core/lib/utils";

import * as THREE from "three";
import * as BufferGeometryUtils from "three-stdlib/utils/BufferGeometryUtils";
import { extend, Object3DNode } from "@react-three/fiber";

// TODO: fix
import { useFieldState } from "@owntwin/core/components/Field/hooks";
import { useField } from "@owntwin/core";

import SelectableLayer from "./SelectableLayer";

import polygon from "./polygon";
import lineString from "./line-string";

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

export function GeoJSONLayer({
  url,
  data,
  clip = true,
  extrude = true,
  edges = false,
  colors,
  opacity = 0.5,
  ...props
}: {
  url?: string;
  data?: any;
  clip?: boolean;
  extrude?: boolean;
  edges?: boolean;
  colors?: Record<string, any>;
  opacity?: number;
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

  useEffect(() => {
    console.log(field);
  }, [field]);

  const [entityStore, updateEntityStore] = useAtom(entityStoreAtom);
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection>();

  // Load JSON from URL
  useEffect(() => {
    if (url) {
      (async () => {
        const data: GeoJSON.FeatureCollection = await axios
          .get(url)
          .then((resp) => resp.data);
        // console.log(data);
        setGeojson(data);
      })();
    } else if (data) {
      setGeojson(data);
    }
  }, [url]);

  const geometries = useMemo(() => {
    if (!geojson || !geojson.features) return undefined;

    if (!field.ready) return undefined;
    if (!field.bbox) {
      // console.error(...);
      return undefined;
    }

    const geometries: ObjectData[] = [];

    const isGeometryCovered = (geometry: GeoJSON.Geometry) => {
      let originLng: number, originLat: number;
      if (geometry.type === "Polygon") {
        originLng = geometry.coordinates[0][0][0];
        originLat = geometry.coordinates[0][0][1];
      } else if (geometry.type === "LineString") {
        originLng = geometry.coordinates[0][0];
        originLat = geometry.coordinates[0][1];
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
      } else if (feature.geometry.type === "LineString") {
        geometry = lineString.createGeometry(
          feature as GeoJSON.Feature<GeoJSON.LineString>,
          fieldState,
        );
      } else {
        console.error("Not implemented");
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

        const { id } = feature.properties || {};
        const {
          name,
          visibility,
          ...restProperties
        }: { name: string; visibility: string } = {
          ...(entityStore[id] || {}),
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
  }, [geojson, field.bbox, field.ready, clip]);

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
      const basicGeometries = mergingGeometries
        .filter((v) => !(v.geometry instanceof MeshLineGeometry))
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

      const meshlineGeometries = mergingGeometries
        .filter((v) => v.geometry instanceof MeshLineGeometry)
        .map((v) => v.geometry);
      const mergedMeshlineGeometry =
        meshlineGeometries.length > 0
          ? BufferGeometryUtils.mergeBufferGeometries(meshlineGeometries, false)
          : null;

      if (mergedMeshlineGeometry)
        result.basic.push({
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
                transparent
                depthTest={false}
                // depthWrite={false}
                // polygonOffset={true}
                polygonOffsetUnits={1}
                polygonOffsetFactor={-64}
              />
            </mesh>
          ),
      )}
      {geometries && <SelectableLayer geometries={geometries} />}
    </>
  );
}
