import { useCallback, useEffect, useState, useTransition } from "react";

import { Html } from "@react-three/drei";

import { useAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import * as store from "../../lib/store";
import { entityStoreAtom } from "./store";

import * as types from "./types";

export default function SelectableLayer({
  geometries,
}: {
  geometries: types.ObjectData[];
}) {
  const [entities, setEntities] = useState(
    geometries.map(({ id, geometry, visibility }) => {
      return {
        id,
        geometry,
        visibility: visibility || "auto",
      };
    }),
  );

  const [entityStore] = useAtom(entityStoreAtom);
  const [hoveredEntity, setHoveredEntity] = useAtom(store.hoveredEntityAtom);

  const [meshes, setMeshes] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  const [, setTimer] = useState<number>();
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const handleClick = useAtomCallback(
    useCallback((get, _set, { ev, id }: { ev: any; id?: string }) => {
    }, []),
  );

  const handlePointerMove = useAtomCallback(
    useCallback((get, _set, { ev, id }: { ev: any; id?: string }) => {
      // NOTE: using onPointerMove (not onPointerOver) to handle moving between overlapping entities
      // NOTE: return if not the front object
      // TODO: check object type in future
      if (
        ev.intersections.length === 0 ||
        ev.intersections[0].object.uuid !== ev.object.uuid
      ) {
        // if (ev.object.userData.visibility !== "always") {
        ev.object.visible = false;
        // setHoveredEntity((entity) => {
        //   // return entity.entity === ev.object
        //   return entity.id === id ? { id: null, entity: null } : entity;
        // });
        // }
        return;
      }
      const hoveredEntity = get(store.hoveredEntityAtom);
      if (hoveredEntity.id === id) return;
      ev.object.visible = true;
      // return { id, entity: ev.object };
      setHoveredEntity((entity) => {
        // console.log(entity);
        return { id: id ? id : null, entity: ev.object };
      });
    }, []),
  );

  // TODO: use respective entity components here depending entity types, rather than <mesh>
  useEffect(() => {
    startTransition(() => {
      setMeshes(
        entities.map(({ id, geometry, visibility }, i) => {
          // console.log("visibility", visibility);
          return (
            <mesh
              key={i}
              // visible={visibility === "always" ? true : false}
              visible={false}
              userData={{ visibility }}
              geometry={geometry}
              onClick={(ev) => handleClick({ ev, id })}
              onPointerMove={(ev) => handlePointerMove({ ev, id })}
              // onPointerMove={(ev) => {
              //   // NOTE: using onPointerMove (not onPointerOver) to handle moving between overlapping entities
              //   // NOTE: return if not the front object
              //   // TODO: check object type in future
              //   if (
              //     ev.intersections.length === 0 ||
              //     ev.intersections[0].object.uuid !== ev.object.uuid
              //   ) {
              //     if (ev.object.userData.visibility !== "always") {
              //       ev.object.visible = false;
              //     }
              //     // setHoveredEntity((entity) => {
              //     //   console.log(entity);
              //     //   // return entity.entity === ev.object
              //     //   return entity.id === id ? { entity: null } : entity;
              //     // });
              //     return;
              //   }
              //   console.log(hoveredEntity);
              //   if (hoveredEntity.id === id) return;
              //   ev.object.visible = true;
              //   setHoveredEntity(Object.assign({}, { id, entity: ev.object }));
              // }}
              onPointerOut={(ev) => {
                // if (ev.object.userData.visibility !== "always") {
                ev.object.visible = false;
                // }
                setHoveredEntity((entity) => {
                  // console.log(entity);
                  return entity.entity === ev.object
                    ? { id: null, entity: null }
                    : entity;
                });
              }}
            >
              <meshBasicMaterial
                color={0xf3f4f6}
                transparent={true}
                opacity={0.75}
              />
            </mesh>
          );
        }),
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
          {entityStore[hoveredEntity.id]?.name
            ? entityStore[hoveredEntity.id]?.name
            : hoveredEntity.id}
        </Html>
      )}
      {entities.map(({ id, geometry, visibility }) => {
        if (!id || visibility !== "always") return null;
        return (
          <Html
            key={id}
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
              geometry.computeBoundingBox();
              // const center = new THREE.Vector3();
              // hoveredEntity.entity.geometry.boundingBox?.getCenter(center);
              const max = geometry.boundingBox.max;
              const { x, y, z } = max;
              return [x, y, z];
            })()}
          >
            {entityStore[id]?.name ? entityStore[id]?.name : id}
          </Html>
        );
      })}
    </>
  );
}
