import {
  useContext,
  useEffect,
  // useRef,
  useState,
  Suspense,
} from 'react';
import { useUpdate, useLoader } from 'react-three-fiber';

import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
import * as THREE from 'three';

import { TerrainContext } from './Terrain';

const width = 1024,
  height = 1024;
const segments = 100;

const loader = new SVGLoader();

async function loadSVG(url) {
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

        const shapes = path.toShapes(true);

        shapes.forEach((shape) => {
          let points = shape.getPoints();

          points = points.map((p) => {
            let x = p.x;
            if (x >= widthSVG) x = widthSVG - 1;
            let y = heightSVG - p.y;
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

function SVGMeshLayer({ url, ...props }) {
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
            color={0xdadce0}
            side={THREE.DoubleSide}
            depthWrite={false}
            // depthTest={false}
          />
        </lineSegments>,
      ]);
    })();
  }, [url]);

  const ref = useUpdate(
    (obj) => {
      let bbox = new THREE.Box3().setFromObject(obj);
      let size = bbox.getSize(new THREE.Vector3());
      obj.position.set(0, 0, 0);
      obj.translateX(-size.x / 2);
      obj.translateY(-size.y / 2);

      function getTerrainAltitude(x, y) {
        if (!terrain.vertices) return 0;
        let pos =
          Math.floor(x / (width / segments)) +
          segments * (segments - 1 - Math.floor(y / (height / segments)));
        if (pos < 0 || terrain.vertices.length <= pos) {
          // console.log(x, y, pos);
          return 0;
        }
        return terrain.vertices[pos].z;
      }

      // terrain
      obj.children.forEach((line) => {
        let position = line.geometry.getAttribute('position');
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
          'position',
          new THREE.BufferAttribute(new Float32Array(vertices), 3),
        );
      });

      setVisible(true);
    },
    [lines, terrain.vertices],
  );

  return (
    <group ref={ref} visible={visible}>
      {lines}
    </group>
  );
}

function PNGLayer({ url, ...props }) {
  const terrain = useContext(TerrainContext);

  const texture = useLoader(THREE.TextureLoader, url);

  return (
    <mesh geometry={terrain.geometry}>
      <meshBasicMaterial
        map={texture}
        transparent={true}
        color={0xffffff}
        opacity={props.opacity ? props.opacity : 0.5}
      />
    </mesh>
  );
}

function Layer({ def, basePath, ...props }) {
  if (basePath) {
    def.path = basePath ? (new URL(def.path, basePath)).toString() : def.path;
  }
  if (def.format === 'svg') {
    return <SVGMeshLayer url={def.path} />;
  } else if (def.format === 'png') {
    return (
      <Suspense fallback={null}>
        <PNGLayer url={def.path} opacity={0.5} />
      </Suspense>
    );
  }
}

export default Layer;
