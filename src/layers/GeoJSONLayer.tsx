import { useContext, useEffect, useMemo, useState, useTransition } from "react";

import axios from "axios";

import * as THREE from "three";
import * as BufferGeometryUtils from "three-stdlib/utils/BufferGeometryUtils";

import * as store from "../lib/store";
import * as util from "../lib/util";

import { Terrain, TerrainContext } from "../Terrain";
import { ModelContext } from "../ModelView";

import { BBox, GeoJSON } from "../types";
import { useAtom } from "jotai";

type Coordinate = [number, number, number];

function extrudePolygonGeometry({
  coordinates,
  bbox,
  terrain,
  ...props
}: {
  coordinates: Coordinate[][];
  bbox: BBox;
  terrain: Terrain;
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
  const z =
    util.getTerrainAltitude(
      terrain,
      origin.x + 1024 / 2,
      origin.y + 1024 / 2,
    ) || 0;

  const shape = new THREE.Shape();

  shape.moveTo(0, 0);
  _coordinates
    .slice()
    .reverse()
    .forEach((v) => {
      const p = util.coordToPlane(bbox, v[0], v[1]);
      shape.lineTo(p.x - origin.x, p.y - origin.y);
    });

  const extrudeSettings = {
    steps: 1,
    depth: depth || 10,
    bevelEnabled: false,
  };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.translate(origin.x, origin.y, z);

  return geom;
}

function SelectableLayer({
  geometries,
}: {
  geometries: THREE.BufferGeometry[];
}) {
  const [entities, setEntities] = useState(
    geometries.map((geom) => ({
      geometry: geom,
      visibility: "auto",
    })),
  );

  const [, setHoveredEntity] = useAtom(store.hoveredEntityAtom);

  const [meshes, setMeshes] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      setMeshes(
        entities.map(({ geometry, visibility }, i) => (
          <mesh
            key={i}
            visible={false}
            geometry={geometry}
            onPointerOver={(ev) => {
              ev.object.visible = true;
              setHoveredEntity({ entity: ev.object });
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
            <meshBasicMaterial color={0xf3f4f6} />
          </mesh>
        )),
      );
    });
  }, []);

  return <>{meshes}</>;
}

function GeoJSONLayer({
  url,
  clip = true,
  ...props
}: {
  url: string;
  clip?: boolean;
  opacity?: 0.5;
}) {
  const terrain = useContext(TerrainContext);
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

  // const raycaster = useMemo(() => new THREE.Raycaster(), []);
  // const intersecting = useRef<THREE.Object3D | null>(null);

  // useFrame((state) => {
  //   raycaster.setFromCamera(state.pointer, state.camera);
  //   const intersects = raycaster.intersectObjects(internalObjects, false);
  //   if (intersects.length > 0) {
  //     // console.log(intersects);
  //     if (intersects.length > 0) {
  //       const closest = intersects[0].object;
  //       if (intersecting.current != closest) {
  //         if (intersecting.current) intersecting.current.visible = false;
  //         intersecting.current = closest;
  //         intersecting.current.visible = true;
  //       }
  //     }
  //   } else {
  //     if (intersecting.current) intersecting.current.visible = false;
  //     intersecting.current = null;
  //   }
  // });

  const geometries = useMemo(() => {
    if (!geojson || !geojson.features) return;

    const geometries: THREE.BufferGeometry[] = [];
    geojson.features.forEach((feature) => {
      if (!model.bbox || !terrain || !terrain.geometry) {
        // console.error(...);
        return;
      }

      const originLng = feature.geometry.coordinates[0][0][0],
        originLat = feature.geometry.coordinates[0][0][1];

      const origin = util.coordToPlane(model.bbox, originLng, originLat);
      if (
        clip &&
        (origin.x < -util.canvas.width / 2 ||
          util.canvas.width / 2 <= origin.x ||
          origin.y < -util.canvas.height / 2 ||
          util.canvas.height / 2 <= origin.y)
      )
        return;

      const poly = extrudePolygonGeometry({
        coordinates: feature.geometry.coordinates,
        bbox: model.bbox,
        height: feature.properties.attributes.measuredHeight,
        terrain: terrain as Terrain, // TODO: Refactoring
      });

      geometries.push(poly);
    });
    // geometries.forEach((obj, i) => { i === 0 && console.log(obj); });
    return geometries;
  }, [geojson, model.bbox, terrain, clip]); // TODO: Fix: model causes x4 calls

  const geom = useMemo(() => {
    if (!geometries || geometries.length === 0) return undefined;

    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
      geometries,
      false,
    );
    // console.log(mergedGeometry);
    return mergedGeometry;
  }, [geometries]); // TODO: Fix: model causes x4 calls

  const color = {
    default: 0xd1d5db, // 0xe5e7eb, 0x9ca3af, 0xb0b0b0, 0xff00ff, 0xc0c0c0
    // default: 0xffffff, // 0xe5e7eb, 0x9ca3af, 0xb0b0b0, 0xff00ff, 0xc0c0c0
    hover: 0x666666,
  };

  return (
    <>
      {geom && (
        <mesh geometry={geom}>
          <meshBasicMaterial
            color={color.default}
            transparent={true}
            opacity={props.opacity}
            polygonOffset={true}
            polygonOffsetUnits={1}
            polygonOffsetFactor={1}
          />
          <lineSegments>
            <edgesGeometry attach="geometry" args={[geom, 45]} />
            <lineBasicMaterial color={0xfefefe} attach="material" />
          </lineSegments>
        </mesh>
      )}
      {geometries && <SelectableLayer geometries={geometries} />}
    </>
  );
}

export default GeoJSONLayer;
