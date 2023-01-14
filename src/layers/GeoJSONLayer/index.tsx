import { useContext, useEffect, useMemo, useState, useTransition } from "react";

import axios from "axios";

import * as THREE from "three";
import * as BufferGeometryUtils from "three-stdlib/utils/BufferGeometryUtils";
import { extend, Object3DNode } from "@react-three/fiber";

import * as util from "../../lib/util";
import { CANVAS } from "../../lib/constants";

import { useAtom } from "jotai";
import * as store from "../../lib/store";

import { ModelContext } from "../../ModelView";

import SelectableLayer from "./SelectableLayer";

import polygon from "./polygon";
import lineString from "./line-string";

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

type ObjectData = {
  geometry: THREE.BufferGeometry;
  id?: string;
};

function GeoJSONLayer({
  url,
  clip = true,
  extrude = true,
  edges = false,
  colors,
  opacity = 0.5,
  ...props
}: {
  url: string;
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

  const [terrain] = useAtom(store.terrainAtom);
  const [getTerrainAltitude] = useAtom(store.getTerrainAltitudeAtom);

  const { model } = useContext(ModelContext);
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection>();

  // Load JSON from URL
  useEffect(() => {
    if (!url) return;
    (async () => {
      const data: GeoJSON.FeatureCollection = await axios
        .get(url)
        .then((resp) => resp.data);
      // console.log(data);
      setGeojson(data);
    })();
  }, [url]);

  const geometries = useMemo(() => {
    if (!geojson || !geojson.features) return undefined;

    if (!terrain.ready) return undefined;

    if (!model.bbox) {
      // console.error(...);
      return undefined;
    }

    const bbox = model.bbox;
    const context = {
      bbox,
      getTerrainAltitude,
    };

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

      const origin = util.coordToPlane(bbox, originLng, originLat);
      if (
        clip &&
        (origin.x < -CANVAS.width / 2 ||
          CANVAS.width / 2 <= origin.x ||
          origin.y < -CANVAS.height / 2 ||
          CANVAS.height / 2 <= origin.y)
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
          context,
        );
      } else if (feature.geometry.type === "LineString") {
        geometry = lineString.createGeometry(
          feature as GeoJSON.Feature<GeoJSON.LineString>,
          extrude,
          context,
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
        const geometry = createGeometryFromFeature(feature);
        if (!geometry) return;
        geometries.push({ geometry, id: feature.properties?.id });
      }
    });
    return geometries;
  }, [geojson, model.bbox, terrain.ready, clip]);

  const mergedGeometries = useMemo(() => {
    if (!geometries || geometries.length === 0)
      return { basic: undefined, meshline: undefined };

    const basicGeometries = geometries
      .filter((v) => !(v.geometry instanceof MeshLineGeometry))
      .map((v) => v.geometry);
    const mergedBasicGeometry =
      basicGeometries.length > 0
        ? BufferGeometryUtils.mergeBufferGeometries(basicGeometries, false)
        : null;

    const meshlineGeometries = geometries
      .filter((v) => v.geometry instanceof MeshLineGeometry)
      .map((v) => v.geometry);
    const mergedMeshlineGeometry =
      meshlineGeometries.length > 0
        ? BufferGeometryUtils.mergeBufferGeometries(meshlineGeometries, false)
        : null;
    return { basic: mergedBasicGeometry, meshline: mergedMeshlineGeometry };
  }, [geometries]);

  return (
    <>
      {mergedGeometries.basic && (
        <mesh geometry={mergedGeometries.basic}>
          <meshBasicMaterial
            color={colors.default}
            transparent={true}
            opacity={opacity}
            polygonOffset={true}
            polygonOffsetUnits={1}
            polygonOffsetFactor={1}
          />
          {edges && (
            <lineSegments>
              <edgesGeometry
                attach="geometry"
                args={[mergedGeometries.basic, 45]}
              />
              <lineBasicMaterial color={colors.edges} attach="material" />
            </lineSegments>
          )}
        </mesh>
      )}
      {mergedGeometries.meshline && (
        <mesh geometry={mergedGeometries.meshline}>
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
      )}
      {geometries && <SelectableLayer geometries={geometries} />}
    </>
  );
}

export default GeoJSONLayer;
