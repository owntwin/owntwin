import { useEffect, useState, useTransition } from "react";

import { Html } from "@react-three/drei";

import { useAtom } from "jotai";
import * as store from "../../lib/store";

type ObjectData = {
  geometry: THREE.BufferGeometry;
  id?: string;
};

export default function SelectableLayer({ geometries }: { geometries: ObjectData[] }) {
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
