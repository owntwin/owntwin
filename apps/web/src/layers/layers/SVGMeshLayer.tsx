import { ReactNode, useCallback, useEffect, useState } from "react";

import { SVGLoader } from "three-stdlib/loaders/SVGLoader"; // NOTE: needs .js to use the pached file
import * as BufferGeometryUtils from "three-stdlib/utils/BufferGeometryUtils";
import * as THREE from "three";

import { useFieldState, useField } from "@owntwin/core/components/Field/hooks";

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
      const pathPoints: THREE.Vector2[][] = [];

      paths.forEach((path: any) => {
        const shapes: THREE.Shape[] = path.toShapes(true); // TODO: Why?

        shapes.forEach((shape) => {
          let points = shape.getPoints();

          points = points.map((p) => {
            let x = p.x;
            let y = heightSVG - p.y;
            p.x = x;
            p.y = y;
            return p;
          });

          pathPoints.push(points);
        });
      });

      return { pathPoints: pathPoints, width: widthSVG, height: heightSVG };
    })
    .catch((err) => {
      console.error(err);
    });
}

export function SVGMeshLayer({
  url,
  color = 0xdadce0,
  ...props
}: {
  url: string;
  color?: string | number;
}) {
  const field = useField();
  const fieldState = useFieldState();

  const [lines, setLines] = useState<ReactNode[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const svg = await loadSVG(url);

      if (!svg) return;

      const _lines: THREE.BufferGeometry[] = [];

      svg.pathPoints.forEach((points, i: number) => {
        const _points: THREE.Vector2[] = [];
        points.forEach((p, i: number) => {
          if (i > 0) {
            _points.push(points[i - 1]);
            _points.push(p);
          }
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(_points);
        geometry.scale(
          fieldState.canvas.width / svg.width,
          fieldState.canvas.height / svg.height,
          1,
        );
        _lines.push(geometry);
      });

      const merged = BufferGeometryUtils.mergeBufferGeometries(_lines);

      merged &&
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

  const ref = useCallback(
    (obj: THREE.Group) => {
      if (!obj) return;

      // let bbox = new THREE.Box3().setFromObject(obj);
      // let size = bbox.getSize(new THREE.Vector3());
      const size = new THREE.Vector3(
        fieldState.canvas.width,
        fieldState.canvas.height,
        0,
      ); // TODO: Improve

      obj.position.set(-size.x / 2, -size.y / 2, 0);
      // obj.translateX(-size.x / 2);
      // obj.translateY(-size.y / 2);

      // Elevation
      obj.children.forEach((line) => {
        if (!(line instanceof THREE.Line)) return;
        const positionAttributeArray = line.geometry.getAttribute("position")
          .array as number[];
        const position = Array.from(positionAttributeArray);
        const vertices = position.map((v, i) => {
          if (i % 3 === 2) {
            const z = fieldState.getAltitude(position[i - 2], position[i - 1]);
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
    },
    [lines, field.vertices],
  );

  return (
    <group ref={ref} visible={visible}>
      {lines}
    </group>
  );
}
