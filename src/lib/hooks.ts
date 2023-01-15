import { useAtom } from "jotai";

import * as store from "./store";
import { coordToPixel, pixelToPlane } from "./util";

export const useFieldState = () => {
  const [{ canvas, vertices, bbox }] = useAtom(store.fieldAtom);
  return {
    coordToPlane: (
      lng: number,
      lat: number,
      planeWidth?: number,
      planeHeight?: number,
    ) => {
      if (!bbox) return undefined;

      planeWidth = planeWidth || canvas.width;
      planeHeight = planeHeight || canvas.height;

      const z = 18;

      let [minx, miny] = coordToPixel(bbox.minlng, bbox.minlat, z);
      let [absx, absy] = coordToPixel(lng, lat, z);
      // let [minx, miny] = sm.px([bbox.minlng, bbox.maxlat], z);
      // let [absx, absy] = sm.px([lng, lat], z);
      let px = absx - minx,
        py = absy - miny;

      // console.log([lng, lat], [px, py]);

      let [x, y] = pixelToPlane(bbox, px, py);

      return { x, y };
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
