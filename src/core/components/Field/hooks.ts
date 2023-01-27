import { useAtom } from "jotai";
import * as store from "./store";

// @ts-ignore
import SphericalMercator from "@mapbox/sphericalmercator";

const sm = new SphericalMercator();

export const useFieldState = () => {
  const [{ canvas, vertices, bbox }] = useAtom(store.fieldAtom);

  if (!bbox) {
    return {
      pixelPerMeter: 0.5, // TODO: Fix
      coordToPlane: (lng: number, lat: number) => undefined,
      getAltitude: (x: number, y: number) => undefined,
    };
  }

  const bboxXY = [
    ...sm.forward([bbox.minlng, bbox.minlat]),
    ...sm.forward([bbox.maxlng, bbox.maxlat]),
  ];
  const originXY = [bboxXY[0], bboxXY[1]];
  const sizeXY = {
    widthMeter: bboxXY[2] - bboxXY[0],
    heightMeter: bboxXY[3] - bboxXY[1],
  };
  const pxPerMeter = {
    horizontal: canvas.width / sizeXY.widthMeter,
    vertical: canvas.width / sizeXY.heightMeter,
  };

  return {
    pixelPerMeter: (pxPerMeter.horizontal + pxPerMeter.vertical) / 2, // Mean of the two; to be reconsidered
    coordToPlane: (lng: number, lat: number) => {
      const coordXY = sm.forward([lng, lat]);
      // console.log(bboxXY, originXY, sizeXY, pxPerMeter, coordXY);
      const coordLocal = {
        x:
          (coordXY[0] - originXY[0]) * pxPerMeter.horizontal - canvas.width / 2,
        y: (coordXY[1] - originXY[1]) * pxPerMeter.vertical - canvas.height / 2,
      };
      return coordLocal;
    },
    getAltitude: (x: number, y: number) => {
      // TODO: vertices should be given outside the function
      if (!vertices) return undefined;

      const pos =
        Math.floor(x / (canvas.width / canvas.segments)) +
        canvas.segments *
          (canvas.segments -
            1 -
            Math.floor(y / (canvas.height / canvas.segments)));
      if (pos < 0 || vertices.length <= pos) {
        // console.log(x, y, pos);
        return 0;
      }
      return vertices[pos * 3 + 2]; // pos.z
    },
  };
};
