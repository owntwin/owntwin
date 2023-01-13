import { useContext, useEffect, useMemo, useState, useTransition } from "react";

import axios from "axios";

import * as THREE from "three";
import * as BufferGeometryUtils from "three-stdlib/utils/BufferGeometryUtils";
import { Html } from "@react-three/drei";

import * as util from "../../lib/util";
import { CANVAS } from "../../lib/constants";

import { useAtom } from "jotai";
import * as store from "../../lib/store";

import { ModelContext } from "../../ModelView";

import polygon from "./polygon";

type ObjectData = {
  geometry: THREE.BufferGeometry;
  id?: string;
};

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

  // TODO: use respective entity components here depending entity types, rather than <mesh>
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
            fontSize: "0.75rem",
          }}
          // distanceFactor={1000}
          position={(() => {
            // TODO: better performance
            hoveredEntity.entity.geometry.computeBoundingBox();
            // const center = new THREE.Vector3();
            // hoveredEntity.entity.geometry.boundingBox?.getCenter(center);
            const max = hoveredEntity.entity.geometry.boundingBox.max;
            const { x, y, z } = max;
            return [x, y, z];
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
          { bbox, getTerrainAltitude },
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

  const mergedGeometry = useMemo(() => {
    if (!geometries || geometries.length === 0) return undefined;

    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
      geometries.map((v) => v.geometry),
      false,
    );
    return mergedGeometry;
  }, [geometries]);

  return (
    <>
      {mergedGeometry && (
        <mesh geometry={mergedGeometry}>
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
              <edgesGeometry attach="geometry" args={[mergedGeometry, 45]} />
              <lineBasicMaterial color={colors.edges} attach="material" />
            </lineSegments>
          )}
        </mesh>
      )}
      {geometries && <SelectableLayer geometries={geometries} />}
    </>
  );
}

export default GeoJSONLayer;
