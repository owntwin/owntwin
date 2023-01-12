import * as THREE from "three";
import split from "just-split";

import { coordSorter } from "../util";

export default class ElevatedShapeGeometry extends THREE.ShapeGeometry {
  constructor(
    shape: THREE.Shape,
    curveSegments: number,
    elevatation: number[],
  ) {
    super(shape, curveSegments);

    this.type = "ElevatedShapeGeometry";
    // this.parameters = {
    // 	shapes: shapes,
    // 	curveSegments: curveSegments
    // };

    // console.log(this.getAttribute("position").array);

    // console.log("old", this.getAttribute("position"));

    const positionAttributeArray = this.getAttribute("position").array;

    // console.log(positionAttributeArray);

    const splittedPositionAttributeArray = split(
      Array.from(positionAttributeArray),
      3,
    );

    const indexedSplittedAttributeArray = splittedPositionAttributeArray.map(
      (point, index) => ({ index: index, point }),
    );
    indexedSplittedAttributeArray.sort(({ point: a }, { point: b }) =>
      coordSorter(a, b),
    );

    const reorderedPositionAttributeArray = indexedSplittedAttributeArray
      .map(({ point }) => point)
      .flat();
    // console.log(indexedSplittedAttributeArray);
    const indexMapArray = indexedSplittedAttributeArray.map((v, i) => [
      v.index,
      i,
    ]);

    const indexMap = Object.fromEntries(indexMapArray);
    // console.log(indexMap);
    // console.log(this.getIndex());
    const index = this.getIndex();
    if (!index) throw Error();
    const reorderedIndex = Array.from(index.array).map(
      (current) => indexMap[current],
    );
    // console.log("index", Array.from(index.array));
    // console.log("rndex", reorderedIndex);
    // console.log(positionAttributeArray.length, positionAttributeArray.length / 3, _coordinates.length);
    // this.setIndex(reorderedIndex);

    // TODO: elevatation.length === ...
    elevatation.map((z, i) => {
      // TODO: Fix
      if (i * 3 + 2 > reorderedPositionAttributeArray.length) return;
      reorderedPositionAttributeArray[i * 3 + 2] = z;
    });
    // console.log("pre", Array.from(positionAttributeArray));
    // console.log(
    //   "evalated",
    //   reorderedPositionAttributeArray.length,
    //   reorderedPositionAttributeArray,
    // );

    this.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(reorderedPositionAttributeArray, 3),
    );
    this.setIndex(reorderedIndex);

    if (Array.from(this.getAttribute("position").array).includes(NaN))
      console.log("new", this.getAttribute("position"));
    // console.log(this.getAttribute("position").array, this.getIndex());
    // console.log("");
  }
}
