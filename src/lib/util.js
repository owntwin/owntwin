/*! Partly derived from https://gist.github.com/maptiler/fddb5ce33ba995d5523de9afdf8ef118 */

import SphericalMercator from '@mapbox/sphericalmercator';

const sm = new SphericalMercator();

const RES = 156543.03392804097;
const EXTENT_SHIFT = 20037508.342789244;

// TODO: Support variable size
const canvas = {
  width: 1024,
  height: 1024,
};

function planeToPixel(bbox, x, y) {
  const z = 18;

  let xyz = sm.xyz(
    [bbox.minlng, bbox.minlat, bbox.maxlng, bbox.maxlat],
    z,
    true,
  );

  let w = (xyz.maxX - xyz.minX + 1) * sm.size,
    h = (xyz.maxY - xyz.minY + 1) * sm.size;

  let px = (x + canvas.width / 2) * (w / canvas.width),
    py = (y + canvas.height / 2) * (h / canvas.height);
  // let px = (x + canvas.width / 2) * (w / canvas.width),
  //   py = (-y + canvas.height / 2) * (h / canvas.height);

  return [px, py];
}

function pixelToPlane(bbox, px, py) {
  const z = 18;

  let xyz = sm.xyz(
    [bbox.minlng, bbox.minlat, bbox.maxlng, bbox.maxlat],
    z,
    true,
  );

  let w = (xyz.maxX - xyz.minX + 1) * sm.size,
    h = (xyz.maxY - xyz.minY + 1) * sm.size;

  let x = (px * canvas.width) / w - canvas.width / 2,
    y = (py * canvas.height) / h - canvas.height / 2;
  // let x = px * (canvas.width / w) - canvas.width / 2,
  //   y = -(py * (canvas.height / h) - canvas.height / 2);

  return [x, y];
}

function coordToPixel(lng, lat, z) {
  let mx = (lng * EXTENT_SHIFT) / 180.0;
  let my =
    Math.log(Math.tan(((90 + lat) * Math.PI) / 360.0)) / (Math.PI / 180.0);
  my = (my * EXTENT_SHIFT) / 180.0;

  const res = RES / 2 ** z;
  const px = (mx + EXTENT_SHIFT) / res;
  const py = (my + EXTENT_SHIFT) / res;

  return [px, py];
}

function pixelToCoord(px, py, z) {
  const res = RES / 2 ** z;

  const mx = px * res - EXTENT_SHIFT;
  const my = py * res - EXTENT_SHIFT;

  let lng = (mx / EXTENT_SHIFT) * 180.0;
  let lat = (my / EXTENT_SHIFT) * 180.0;
  lat =
    (180 / Math.PI) *
    (2 * Math.atan(Math.exp((lat * Math.PI) / 180.0)) - Math.PI / 2.0);

  return [lng, lat];
}

function coordToPlane(bbox, lng, lat, planeWidth, planeHeight) {
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
}

function planeToCoord(bbox, x, y) {
  const z = 18;
  // let _x = x,
  //   _y = y;

  // console.log([x, y]);

  [x, y] = planeToPixel(bbox, x, y);
  let [minx, miny] = coordToPixel(bbox.minlng, bbox.minlat, z);
  // let [minx, miny] = sm.px([bbox.minlng, bbox.maxlat], z);
  let absx = minx + x,
    absy = miny + y;

  let [lng, lat] = pixelToCoord(absx, absy, z);
  // let [lng, lat] = sm.ll([absx, absy], z);

  return { lng, lat };
}

function scaleCoord(x) {
  return x * 10000; // 1000000;
}

function coordToLocalPlane(bbox, lng, lat, planeWidth, planeHeight) {
  planeWidth = planeWidth || canvas.width;
  planeHeight = planeHeight || canvas.height;
  let bboxW = scaleCoord(bbox.maxlng) - scaleCoord(bbox.minlng);
  let bboxH = scaleCoord(bbox.maxlat) - scaleCoord(bbox.minlat);
  let ratioW = planeWidth / bboxW;
  let ratioH = planeHeight / bboxH;
  let rellng = scaleCoord(lng) - scaleCoord(bbox.minlng);
  let rellat = scaleCoord(lat) - scaleCoord(bbox.minlat);
  let w = rellng * ratioW;
  let h = rellat * ratioH;
  // console.log(
  //   bboxW,
  //   bboxH,
  //   ratioW,
  //   ratioH,
  //   rellng,
  //   rellat,
  //   w,
  //   h,
  //   w - canvas.width / 2,
  //   h - canvas.height / 2,
  // );
  return {
    x: w - planeWidth / 2,
    y: h - planeHeight / 2,
  };
}

function localPlaneToCoord(bbox, x, y) {
  let bboxW = bbox.maxlng - bbox.minlng;
  let bboxH = bbox.maxlat - bbox.minlat;
  let ratioW = bboxW / canvas.width;
  let ratioH = bboxH / canvas.height;
  let lng = (x + canvas.width / 2) * ratioW;
  let lat = (y + canvas.height / 2) * ratioH;
  return {
    lng: bbox.minlng + lng,
    lat: bbox.minlat + lat,
  };
}

export { coordToPlane, planeToCoord, coordToLocalPlane, localPlaneToCoord };
