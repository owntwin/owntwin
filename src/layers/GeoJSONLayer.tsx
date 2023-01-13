import { useContext, useEffect, useMemo, useState, useTransition } from "react";

import axios from "axios";

import * as THREE from "three";
import * as BufferGeometryUtils from "three-stdlib/utils/BufferGeometryUtils";
import { Html } from "@react-three/drei";
import ElevatedShapeGeometry from "../lib/components/ElevatedShapeGeometry";

import * as store from "../lib/store";
import * as util from "../lib/util";

import { ModelContext } from "../ModelView";

import { BBox, GeoJSON } from "../types";
import { useAtom } from "jotai";

type Coordinate = [number, number, number];

type ObjectData = {
  geometry: THREE.BufferGeometry;
  id?: string;
};

function computeShape({
  coordinates,
  bbox,
  ...props
}: {
  coordinates: Coordinate[][];
  bbox: BBox;
}) {
  // TODO: Support hole (coordinate[1])
  // TODO: Fix naming
  let _coordinates = coordinates[0];

  const originLng = _coordinates[0][0],
    originLat = _coordinates[0][1];

  const origin = util.coordToPlane(bbox, originLng, originLat);
  // const z = 0; // _coordinates[0][2]; // TODO: z from GeoJSON?
  // TODO: Fix: terrain is [0,1023], origin.x/y is [-512,512]
  // const z = getTerrainAltitude(origin.x + 1024 / 2, origin.y + 1024 / 2) || 0;

  const shape = new THREE.Shape();

  shape.moveTo(0, 0);
  _coordinates
    .slice()
    .reverse()
    .forEach((v) => {
      const p = util.coordToPlane(bbox, v[0], v[1]);
      shape.lineTo(p.x - origin.x, p.y - origin.y);
    });

  return shape;
}

function createElevatedShapeGeometry({
  coordinates,
  bbox,
  getTerrainAltitude,
  ...props
}: {
  coordinates: Coordinate[][];
  bbox: BBox;
  getTerrainAltitude: Function;
}) {
  // TODO: Support hole (coordinate[1])
  // TODO: Fix naming
  let _coordinates = coordinates[0];

  const originLng = _coordinates[0][0],
    originLat = _coordinates[0][1];

  const origin = util.coordToPlane(bbox, originLng, originLat);

  const shape = computeShape({ coordinates, bbox });

  const elevatation = _coordinates
    .slice()
    .sort(util.coordSorter)
    .map((v) => {
      const p = util.coordToPlane(bbox, v[0], v[1]);
      const z = getTerrainAltitude(p.x + 1024 / 2, p.y + 1024 / 2) || 0;
      return z;
      // TODO: return v[2];
    });

  //   const geom = new THREE.ShapeGeometry(shape, 1);
  const geom = new ElevatedShapeGeometry(shape, 1, elevatation);

  geom.translate(origin.x, origin.y, 1);

  return geom;
}

function extrudePolygonGeometry({
  coordinates,
  bbox,
  getTerrainAltitude,
  ...props
}: {
  coordinates: Coordinate[][];
  bbox: BBox;
  getTerrainAltitude: Function;
  height: number;
}) {
  const depth = props.height / 2;

  // TODO: Support hole (coordinate[1])
  // TODO: Fix naming
  let _coordinates = coordinates[0];

  const originLng = _coordinates[0][0],
    originLat = _coordinates[0][1];

  const origin = util.coordToPlane(bbox, originLng, originLat);
  // const z = 0; // _coordinates[0][2]; // TODO: z from GeoJSON?
  // TODO: Fix: terrain is [0,1023], origin.x/y is [-512,512]
  const z = getTerrainAltitude(origin.x + 1024 / 2, origin.y + 1024 / 2) || 0;

  const shape = computeShape({ coordinates, bbox });

  const extrudeSettings = {
    steps: 1,
    depth: depth || 10,
    bevelEnabled: false,
    curveSegments: 1,
  };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.translate(origin.x, origin.y, z);

  return geom;
}

function SelectableLayer({ geometries }: { geometries: ObjectData[] }) {
  const [entities, setEntities] = useState(
    geometries.map(({ id, geometry }) => ({
      id,
      geometry,
      visibility: "auto",
    })),
  );

  const [hoveredEntity, setHoveredEntity] = useAtom(store.hoveredEntityAtom);

  const [meshes, setMeshes] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  const [, setTimer] = useState<number>();
  const [showPopup, setShowPopup] = useState<boolean>(false);

  useEffect(() => {
    startTransition(() => {
      setMeshes(
        entities.map(({ id, geometry, visibility }, i) => (
          <mesh
            key={i}
            visible={false}
            geometry={geometry}
            onPointerMove={(ev) => {
              // NOTE: using onPointerMove (not onPointerOver) to handle moving between overlapping entities
              // NOTE: return if not the front object
              // TODO: check object type in future
              if (
                ev.intersections.length === 0 ||
                ev.intersections[0].object.uuid !== ev.object.uuid
              ) {
                if (ev.object.userData.visibility !== "always") {
                  ev.object.visible = false;
                }
                setHoveredEntity((entity) => {
                  // console.log(entity);
                  return entity.entity === ev.object
                    ? { entity: null }
                    : entity;
                });
                return;
              }
              if (hoveredEntity.id === id) return;
              ev.object.visible = true;
              setHoveredEntity({ id, entity: ev.object });
            }}
            onPointerOut={(ev) => {
              if (ev.object.userData.visibility !== "always") {
                ev.object.visible = false;
              }
              setHoveredEntity((entity) => {
                // console.log(entity);
                return entity.entity === ev.object ? { entity: null } : entity;
              });
            }}
          >
            <meshBasicMaterial
              color={0xf3f4f6}
              transparent={true}
              opacity={0.75}
            />
          </mesh>
        )),
      );
    });
  }, []);

  useEffect(() => {
    setTimer((currentTimer) => {
      if (!hoveredEntity || !hoveredEntity.id) {
        if (currentTimer) clearTimeout(currentTimer);
        setShowPopup(false);
        return undefined;
      }
      if (currentTimer) clearTimeout(currentTimer);
      setShowPopup(false);
      const timer = setTimeout(() => setShowPopup(true), 500);
      return timer;
    });
  }, [hoveredEntity]);

  return (
    <>
      {meshes}
      {hoveredEntity && hoveredEntity.id && showPopup && (
        <Html
          className="bg-gray-400 text-white rounded-full px-2 py-1"
          style={{
            pointerEvents: "none",
            userSelect: "none",
            transform: "translate3d(-50%,-100%,0)",
            width: "max-content",
            fontSize: "0.5rem",
          }}
          distanceFactor={1000}
          position={(() => {
            // TODO: Better performance
            hoveredEntity.entity.geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            hoveredEntity.entity.geometry.boundingBox?.getCenter(center);
            const { x, y, z } = center;
            return [x, y, z + 50];
          })()}
        >
          {hoveredEntity.id}
        </Html>
      )}
    </>
  );
}

function GeoJSONLayer({
  url,
  clip = true,
  extrude = true,
  colors,
  ...props
}: {
  url: string;
  clip?: boolean;
  extrude?: boolean;
  colors?: Record<string, any>;
  opacity?: 0.5;
}) {
  colors = Object.assign(
    {
      default: 0xd1d5db, // 0xe5e7eb, 0x9ca3af, 0xb0b0b0, 0xff00ff, 0xc0c0c0
      // default: 0xffffff, // 0xe5e7eb, 0x9ca3af, 0xb0b0b0, 0xff00ff, 0xc0c0c0
      hover: 0x666666,
    },
    colors,
  );

  const [terrain] = useAtom(store.terrainAtom);
  const [getTerrainAltitude] = useAtom(store.getTerrainAltitudeAtom);

  const { model } = useContext(ModelContext);
  const [geojson, setGeojson] = useState<GeoJSON>();

  /* load JSON from URL */
  useEffect(() => {
    !!url &&
      (async () => {
        const data = await axios.get(url).then((resp) => resp.data);
        // console.log(data);
        setGeojson(data);
      })();
  }, [url]);

  const geometries = useMemo(() => {
    if (!geojson || !geojson.features) return;

    if (!terrain.ready) return;

    if (!model.bbox) {
      // console.error(...);
      return;
    }

    const bbox = model.bbox;

    const geometries: ObjectData[] = [];

    const isFeatureCovered = (feature: any) => {
      const originLng = feature.geometry.coordinates[0][0][0],
        originLat = feature.geometry.coordinates[0][0][1];

      const origin = util.coordToPlane(bbox, originLng, originLat);
      if (
        clip &&
        (origin.x < -util.canvas.width / 2 ||
          util.canvas.width / 2 <= origin.x ||
          origin.y < -util.canvas.height / 2 ||
          util.canvas.height / 2 <= origin.y)
      )
        return false;
      else return true;
    };

    const parsePoly = (feature: any) => {
      let poly: any;

      if (extrude) {
        // NOTE: return null if cannot be extruded
        if (
          !feature.properties.attributes?.measuredHeight &&
          !feature.properties.attributes?.height
        ) {
          return null;
        }
        poly = extrudePolygonGeometry({
          coordinates: feature.geometry.coordinates,
          bbox: bbox,
          height: feature.properties.attributes.measuredHeight,
          getTerrainAltitude,
        });
      } else {
        poly = createElevatedShapeGeometry({
          coordinates: feature.geometry.coordinates,
          bbox: bbox,
          getTerrainAltitude,
        });
      }

      return poly;
    };

    geojson.features.forEach((feature) => {
      if (feature.geometry.type === "GeometryCollection") {
        feature.geometry.geometries.forEach((partialFeature: any) => {
          if (!isFeatureCovered(partialFeature)) return;
          const poly = parsePoly(partialFeature);
          if (!poly) return;
          geometries.push({ geometry: poly, id: feature.properties.id });
        });
      } else {
        if (!isFeatureCovered(feature)) return;
        const poly = parsePoly(feature);
        if (!poly) return;
        geometries.push({ geometry: poly, id: feature.properties.id });
      }
    });

    return geometries;
  }, [geojson, model.bbox, terrain.ready, clip]); // TODO: Fix: model causes x4 calls

  const mergedGeometry = useMemo(() => {
    if (!geometries || geometries.length === 0) return undefined;

    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
      geometries.map((v) => v.geometry),
      false,
    );
    // console.log(mergedGeometry);
    return mergedGeometry;
  }, [geometries]); // TODO: Fix: model causes x4 calls

  return (
    <>
      {mergedGeometry && (
        <mesh geometry={mergedGeometry}>
          <meshBasicMaterial
            color={colors.default}
            transparent={true}
            opacity={props.opacity}
            polygonOffset={true}
            polygonOffsetUnits={1}
            polygonOffsetFactor={1}
          />
          {extrude && (
            <lineSegments>
              <edgesGeometry attach="geometry" args={[mergedGeometry, 45]} />
              <lineBasicMaterial color={0xfefefe} attach="material" />
            </lineSegments>
          )}
        </mesh>
      )}
      {geometries && <SelectableLayer geometries={geometries} />}
    </>
  );
}

export default GeoJSONLayer;
