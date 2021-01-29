import { useContext, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import tw from 'twin.macro';

import * as util from './lib/util';

import { ModelContext } from './ModelView';

function Popup({ item, ...props }) {
  return (
    <div
      css={[tw`bg-white border rounded py-2 px-3`]}
      style={{ minWidth: '200px' }}
    >
      <div css={[tw`text-xs`]}>{item.type}</div>
      <div>{item.name}</div>
      <div css={[tw`mt-3 text-xs text-gray-600`]}>クリックで拡大</div>
    </div>
  );
}

function Building({ base, z, depth, onPointerDown, ...props }) {
  const { model } = useContext(ModelContext);

  const shape = useMemo(() => new THREE.Shape(), []);

  let originLng = base[0][0],
    originLat = base[0][1];

  let origin = util.coordToPlane(model, originLng, originLat);
  shape.moveTo(0, 0);

  base.slice().reverse().forEach((v) => {
    let p = util.coordToPlane(model, v[0], v[1]);
    shape.lineTo(p.x - origin.x, p.y - origin.y);
  });

  const geom = useMemo(() => {
    let extrudeSettings = {
      steps: 1,
      depth: depth || 50,
      bevelEnabled: false,
    };
    return new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
  }, [shape, depth]);

  const [hover, setHover] = useState(false);

  const color = {
    default: 0xf1f3f4,
    hover: 0x666666,
  };

  useEffect(() => {
    document.body.style.cursor = hover ? 'pointer' : 'auto';
  }, [hover]);

  return (
    <mesh
      position={[origin.x, origin.y, z]}
      geometry={geom}
      onClick={props.onClick}
      onPointerDown={onPointerDown}
      onPointerOver={(ev) => {
        ev.stopPropagation();
        setHover(true);
      }}
      onPointerOut={(ev) => setHover(false)}
    >
      <meshLambertMaterial color={hover ? color.hover : color.default} />
      <lineSegments>
        <edgesGeometry attach="geometry" args={[geom, 45]} />
        <lineBasicMaterial color={0xcccccc} attach="material" />
      </lineSegments>
      <Html style={{ pointerEvents: 'none' }}>
        {hover && <Popup item={{ name: props.name, type: props.type }} />}
      </Html>
    </mesh>
  );
}

export default Building;
