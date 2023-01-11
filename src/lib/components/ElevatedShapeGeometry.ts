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

    const positionAttributeArray = new Float32Array(
      this.getAttribute("position").array,
    );

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
    elevatation.map((z, i) => {
      reorderedPositionAttributeArray[i * 3 + 2] = z;
    });
    // console.log("pre", Array.from(positionAttributeArray));
    // console.log("new", reorderedPositionAttributeArray);
    this.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array(reorderedPositionAttributeArray),
        3,
      ),
    );
    this.setIndex(reorderedIndex);
    // console.log(this.getAttribute("position").array, this.getIndex());
    // console.log("");
  }
}
