import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

import { SVGLoader } from "three-stdlib/loaders/SVGLoader.js"; // NOTE: needs .js to use the pached file
import * as BufferGeometryUtils from "three-stdlib/utils/BufferGeometryUtils";
import * as THREE from "three";

import * as util from "../lib/util";
import { useAtom } from "jotai";
import { getTerrainAltitudeAtom } from "../lib/store";

const width = util.canvas.width,
  height = util.canvas.height;
const segments = util.canvas.segments;

const loader = new SVGLoader();

async function loadSVG(url: string) {
  const load = () =>
    new Promise((resolve) => {
      loader.load(url, resolve);
    });

  return await load()
    .then((data) => {
      const widthSVG = data.xml.viewBox.baseVal.width;
      const heightSVG = data.xml.viewBox.baseVal.height;
      const paths = data.paths;
      let pathPoints: THREE.Vector2[][] = [];

      for (let i = 0; i < paths.length; i++) {
        let path = paths[i];

        const shapes: THREE.Shape[] = path.toShapes(true); // TODO: Why?

        shapes.forEach((shape) => {
          let points = shape.getPoints();

          points = points.map((p) => {
            let x = p.x;
            // TODO: Improve
            // if (x < 0) x = 0;
            // if (x >= widthSVG) x = widthSVG - 1;
            let y = heightSVG - p.y;
            // TODO: Improve
            // if (y < 0) y = 0;
            // if (y >= heightSVG) y = heightSVG - 1;
            p.x = x;
            p.y = y;
            return p;
          });

          pathPoints.push(points);
        });
      }

      return { pathPoints: pathPoints, width: widthSVG, height: heightSVG };
    })
    .catch((err) => {
      console.error(err);
    });
}

function SVGMeshLayer({
  url,
  color = 0xdadce0,
  ...props
}: {
  url: string;
  color?: string | number;
}) {
  const [lines, setLines] = useState<ReactNode[]>([]);
  const [visible, setVisible] = useState(false);

  const [getTerrainAltitude] = useAtom(getTerrainAltitudeAtom);

  useEffect(() => {
    (async () => {
      const svg = await loadSVG(url);

      if (!svg) return;

      let _lines: THREE.BufferGeometry[] = [];

      svg.pathPoints.forEach((points, i: number) => {
        let _points: THREE.Vector2[] = [];
        points.forEach((p, i: number) => {
          if (i > 0) {
            _points.push(points[i - 1]);
            _points.push(p);
          }
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(_points);
        geometry.scale(width / svg.width, height / svg.height, 1);
        _lines.push(geometry);
      });

      let merged = BufferGeometryUtils.mergeBufferGeometries(_lines);

      setLines([
        <lineSegments key={0} geometry={merged}>
          <meshBasicMaterial
            color={color}
            side={THREE.DoubleSide}
            depthWrite={false}
            // depthTest={false}
          />
        </lineSegments>,
      ]);
    })();
  }, [url, color]);

  const ref = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    if (!ref.current) return;

    // let bbox = new THREE.Box3().setFromObject(ref.current);
    // let size = bbox.getSize(new THREE.Vector3());
    let size = new THREE.Vector3(width, height, 0); // TODO: Improve
    ref.current.position.set(0, 0, 0);
    ref.current.translateX(-size.x / 2);
    ref.current.translateY(-size.y / 2);

    // terrain
    ref.current.children.forEach((line) => {
      if (!(line instanceof THREE.Line)) return;
      const positionAttributeArray = line.geometry.getAttribute("position")
        .array as number[];
      const position = Array.from(positionAttributeArray);
      const vertices = position.map((v, i) => {
        if (i % 3 === 2) {
          const z = getTerrainAltitude(position[i - 2], position[i - 1]);
          return z ? z + 2 : v; // TODO: Fix
        } else {
          return v;
        }
      });
      // console.log(vertices);
      line.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3),
      );
    });

    setVisible(true);
  }, [lines]);

  return (
    <group ref={ref} visible={visible}>
      {lines}
    </group>
  );
}

export default SVGMeshLayer;
