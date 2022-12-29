import { useContext, useEffect, useMemo, useState } from "react";

import axios from "axios";

import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";

import * as util from "../lib/util";

import { TerrainContext } from "../Terrain";
import { ModelContext } from "../ModelView";

function extrudePolygonGeometry({ coordinates, bbox, terrain, ...props }) {
  const depth = props.height / 2;

  // TODO: Support hole (coordinate[1])
  coordinates = coordinates[0];

  const originLng = coordinates[0][0],
    originLat = coordinates[0][1];

  const origin = util.coordToPlane(bbox, originLng, originLat);
  // const z = 0; // coordinates[0][2]; // TODO: z from GeoJSON?
  // TODO: Fix: terrain is [0,1023], origin.x/y is [-512,512]
  const z =
    util.getTerrainAltitude(
      terrain,
      origin.x + 1024 / 2,
      origin.y + 1024 / 2,
    ) || 0;

  const shape = new THREE.Shape();

  shape.moveTo(0, 0);
  coordinates
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

function GeoJSONLayer({ url, clip = true, ...props }) {
  const terrain = useContext(TerrainContext);
  const { model } = useContext(ModelContext);
  const [geojson, setGeojson] = useState(null);

  /* load JSON from URL */
  useEffect(() => {
    !!url &&
      (async () => {
        const data = await axios.get(url).then((resp) => resp.data);
        // console.log(data);
        setGeojson(data);
      })();
  }, [url]);

  const geom = useMemo(() => {
    if (!geojson) return;

    const geometries = [];
    geojson.features.forEach((feature) => {
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
        terrain: terrain,
      });

      geometries.push(poly);
    });

    if (geometries.length === 0) return undefined;

    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
      geometries,
      false,
    );

    // console.log(mergedGeometry);

    return mergedGeometry;
  }, [geojson, model.bbox, terrain, clip]); // TODO: Fix: model causes x4 calls

  const color = {
    default: 0xd1d5db, // 0xe5e7eb, 0x9ca3af, 0xb0b0b0, 0xff00ff, 0xc0c0c0
    hover: 0x666666,
  };

  return (
    <>
      geom && (
      <mesh geometry={geom}>
        <meshBasicMaterial
          color={color.default}
          transparent={true}
          opacity={props.opacity || 0.5}
        />
        {/* <lineSegments>
          <edgesGeometry attach="geometry" args={[geom, 45]} />
          <lineBasicMaterial color={0xcccccc} attach="material" />
        </lineSegments> */}
      </mesh>
      )
    </>
  );
}

export default GeoJSONLayer;
