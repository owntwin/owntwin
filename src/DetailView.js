import {
  useEffect,
  useMemo,
  createContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
// import { CameraHelper } from 'three';

import { useAtom } from 'jotai';
import * as store from './lib/store';
import * as util from './lib/util';

export const ModelContext = createContext();

function DefaultCamera({ ...props }) {
  // const camera = useRef();
  // useHelper(camera, CameraHelper, 1, 'hotpink');

  return (
    <PerspectiveCamera
      makeDefault
      up={[0, 0, 1]}
      position={[0, -800 * 0.5, 400 * 0.5]}
      fov={60}
      aspect={window.innerWidth / window.innerHeight}
      near={1}
      far={2048}
      // ref={camera}
    />
  );
}

function BlankPlane({ width, height, color, ...props }) {
  return (
    <mesh>
      <planeBufferGeometry args={[width, height]} />
      <meshBasicMaterial
        color={color || 0xf1f3f5}
        polygonOffset={true}
        polygonOffsetFactor={1}
      />
    </mesh>
  );
}

function Building({ model, base, depth, floor, floors, ...props }) {
  const planeWidth = 250,
    planeHeight = 250;

  const [entity, setEntity] = useAtom(store.entityAtom);

  const originLng = base[0][0],
    originLat = base[0][1];

  const origin = util.coordToLocalPlane(
    model.bbox,
    originLng,
    originLat,
    planeWidth,
    planeHeight,
  );

  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);

    base.forEach((v) => {
      const p = util.coordToLocalPlane(
        model.bbox,
        v[0],
        v[1],
        planeWidth,
        planeHeight,
      );
      shape.lineTo(p.x - origin.x, p.y - origin.y);
    });

    return shape;
  }, [base, model, origin.x, origin.y]);

  const geom = useMemo(() => {
    const extrudeSettings = {
      steps: 1,
      depth: (depth || 50) * 0.2, // TODO: Fix
      bevelEnabled: false,
    };
    return new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
  }, [shape, depth]);

  /* Floors */
  let floorN = floor || 1;
  let floorHeight = ((depth || 50) * 0.2) / floorN;
  let floorsMetadata = floors ? floors : {};

  const floorGeom = useMemo(() => new THREE.ShapeBufferGeometry(shape), [
    shape,
  ]);

  let floorGroup = [];
  const [activeFloor, setActiveFloor] = useState(null);
  const [hover, setHover] = useState(null);
  const [anchorHover, setAnchorHover] = useState(null);
  const [anchorActive, setAnchorActive] = useState(null);

  useEffect(() => {
    if (!!entity && entity.id !== anchorActive) {
      setAnchorActive(null);
    }
  }, [entity, anchorActive]);

  useEffect(() => {
    document.body.style.cursor = hover || anchorHover ? 'pointer' : 'auto';
  }, [hover, anchorHover]);

  for (let i = 0; i < floorN; i++) {
    let floorMetadata = floorsMetadata[`${i + 1}`] || {
      texture: null,
      anchors: [],
    };
    floorMetadata['n'] = `${i + 1}`;

    const anchorGroup = floorMetadata.anchors.map((v, j) => {
      // console.log(v);

      let p = util.coordToLocalPlane(
        model.bbox,
        v.position.lng,
        v.position.lat,
        planeWidth,
        planeHeight,
      );

      return (
        <mesh
          key={j}
          position={[p.x - origin.x, p.y - origin.y, floorHeight / 2]}
          userData={{ data: v }}
          visible={activeFloor === null || activeFloor === i + 1}
        >
          <sphereBufferGeometry args={[0.1, 20, 20]} />
          <meshBasicMaterial color={0x2196f3} />
          <mesh
            name="hitbox"
            visible={activeFloor === null || activeFloor === i + 1}
            onPointerOver={(ev) => {
              ev.stopPropagation();
              activeFloor === i + 1 && setAnchorHover(v.id);
            }}
            onPointerOut={(ev) => {
              ev.stopPropagation();
              anchorHover === v.id && setAnchorHover(null);
            }}
            onPointerDown={(ev) => {
              if (activeFloor !== i + 1 || !anchorHover === v.id) return;
              ev.stopPropagation();
              // TODO: Switch on click
              // setLocalEntity(v);
              setEntity(v);
              setAnchorActive(v.id);
            }}
          >
            <sphereBufferGeometry args={[1, 20, 20]} />
            <meshBasicMaterial
              visible={anchorHover === v.id || anchorActive === v.id}
              color={0x2196f3}
              opacity={0.5}
              transparent={true}
            />
          </mesh>
          <Html style={{ pointerEvents: 'none' }}>
            <div
              style={{
                display:
                  activeFloor === null || activeFloor === i + 1
                    ? 'block'
                    : 'none',
                fontSize: '0.75rem',
                fontWeight:
                  anchorHover === v.id || anchorActive === v.id ? 'bold' : null,
                width: '10rem',
              }}
            >
              {v.name}
            </div>
          </Html>
        </mesh>
      );
    });

    let floor = (
      <mesh
        key={i}
        position-z={floorHeight * i}
        geometry={floorGeom}
        userData={{ metadata: floorMetadata }}
        onPointerDown={(ev) => {
          if (!!anchorHover) return;
          if (activeFloor === i + 1) {
            ev.stopPropagation();
            setActiveFloor(null);
          } else if (activeFloor === null) {
            ev.stopPropagation();
            setActiveFloor(i + 1);
          }
        }}
        onPointerOver={(ev) => {
          if (activeFloor === null || activeFloor === i + 1) {
            ev.stopPropagation();
            setHover(i + 1);
          }
        }}
        onPointerOut={(ev) => {
          if (activeFloor === null || activeFloor === i + 1) {
            ev.stopPropagation();
            setHover(null);
          }
        }}
        visible={activeFloor === null || activeFloor === i + 1}
      >
        <meshBasicMaterial
          color={hover === i + 1 ? 0xaaaaaa : 0xf1f3f4}
          side={THREE.DoubleSide}
          visible={activeFloor === null || activeFloor === i + 1}
        />
        <lineSegments>
          <edgesGeometry attach="geometry" args={[floorGeom]} />
          <lineBasicMaterial color={0xcccccc} attach="material" />
        </lineSegments>
        <group name="anchors">{anchorGroup}</group>
      </mesh>
    );

    floorGroup.push(floor);
  }

  const ref = useRef();
  useLayoutEffect(() => {
    const bbox = new THREE.Box3().setFromObject(ref.current);
    const size = bbox.getSize(new THREE.Vector3());

    const ratio = Math.min(
      (planeWidth - 32) / size.x,
      (planeHeight - 32) / size.y,
    );

    ref.current.scale.set(ratio, ratio, ratio);

    const center = bbox.getCenter(new THREE.Vector3());
    ref.current.translateX(-center.x * ratio);
    ref.current.translateY(-center.y * ratio);
  }, []);

  // const ref = useUpdate((obj) => {
  //   const bbox = new THREE.Box3().setFromObject(obj);
  //   const size = bbox.getSize(new THREE.Vector3());

  //   const ratio = Math.min(
  //     (planeWidth - 32) / size.x,
  //     (planeHeight - 32) / size.y,
  //   );

  //   obj.scale.set(ratio, ratio, ratio);

  //   const center = bbox.getCenter(new THREE.Vector3());
  //   obj.translateX(-center.x * ratio);
  //   obj.translateY(-center.y * ratio);
  // }, []);

  return (
    <mesh ref={ref} position={[0, 0, 0]} geometry={geom}>
      <meshLambertMaterial wireframe={true} visible={false} />
      <lineSegments>
        <edgesGeometry attach="geometry" args={[geom, 45]} />
        <lineBasicMaterial color={0xcccccc} attach="material" />
      </lineSegments>
      <group name="floors">{floorGroup}</group>
    </mesh>
  );
}

function DetailView({ model, type, entity, ...props }) {
  let entityComponent;

  if (entityComponent) entityComponent = null;

  if (!!entity && type === 'building') {
    entityComponent = (
      <Building
        key={entity.id}
        model={model}
        base={entity.base}
        depth={entity.depth}
        floor={entity.floor}
        floors={entity.floors}
      />
    );
  }

  return (
    <Canvas
      id="detail-view-canvas"
      linear={true}
      dpr={Math.min(2, window.devicePixelRatio)}
      gl={{ powerPreference: 'default', antialias: false }}
    >
      <DefaultCamera />
      <ambientLight args={[0xffffff, 1]} />
      <pointLight position={[10, 10, 10]} />
      <BlankPlane width={250} height={250} />
      {entityComponent}
      <OrbitControls
        target={[0, 0, 0]}
        minDistance={100}
        maxDistance={500}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
    </Canvas>
  );
}

export default DetailView;
