import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { SVGLoader } from "three-stdlib/loaders/SVGLoader.js"; // NOTE: needs .js to use the pached file
import * as BufferGeometryUtils from "three-stdlib/utils/BufferGeometryUtils";
import * as THREE from "three";

import { TerrainContext } from "../Terrain";
import * as util from "../lib/util";

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
      let pathPoints = [];

      for (let i = 0; i < paths.length; i++) {
        let path = paths[i];

        const shapes = path.toShapes(true); // TODO: Why?

        shapes.forEach((shape) => {
          let points = shape.getPoints();

          points = points.map((p) => {
            let x = p.x;
            // TODO: Improve
            if (x < 0) x = 0;
            if (x >= widthSVG) x = widthSVG - 1;
            let y = heightSVG - p.y;
            // TODO: Improve
            if (y < 0) y = 0;
            if (y >= heightSVG) y = heightSVG - 1;
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

function SVGMeshLayer({ url, color, ...props }) {
  const [lines, setLines] = useState([]);
  const [visible, setVisible] = useState(false);

  const terrain = useContext(TerrainContext);

  useEffect(() => {
    (async () => {
      const svg = await loadSVG(url);

      let _lines = [];

      svg.pathPoints.forEach((points, i) => {
        let _points = [];
        points.forEach((p, i) => {
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
            color={color || 0xdadce0}
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

    function getTerrainAltitude(x, y) {
      if (!terrain.vertices) return 0;
      let pos =
        Math.floor(x / (width / segments)) +
        segments * (segments - 1 - Math.floor(y / (height / segments)));
      if (pos < 0 || terrain.vertices.length <= pos) {
        // console.log(x, y, pos);
        return 0;
      }
      return terrain.vertices[pos * 3 + 2]; // pos.z
    }

    // terrain
    ref.current.children.forEach((line) => {
      let position = line.geometry.getAttribute("position");
      let vertices = [];
      vertices = position.array.map((v, i) => {
        if (i % 3 === 2) {
          let z =
            getTerrainAltitude(position.array[i - 2], position.array[i - 1]) +
            2;
          return z;
        } else {
          return v;
        }
      });
      line.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(vertices), 3),
      );
    });

    setVisible(true);
  }, [lines, terrain.vertices]);

  return (
    <group ref={ref} visible={visible}>
      {lines}
    </group>
  );
}

export default SVGMeshLayer;
