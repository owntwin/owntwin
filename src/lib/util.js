/*! Partly derived from https://gist.github.com/maptiler/fddb5ce33ba995d5523de9afdf8ef118 */

import SphericalMercator from '@mapbox/sphericalmercator';

const sm = new SphericalMercator();

const RES = 156543.03392804097;
const SHIFT = 20037508.342789244;

function planeToPixel(model, x, y) {
  const z = 18;

  let xyz = sm.xyz(
    [
      model.bbox.minlng,
      model.bbox.minlat,
      model.bbox.maxlng,
      model.bbox.maxlat,
    ],
    z,
    true,
  );

  let w = (xyz.maxX - xyz.minX + 1) * sm.size,
    h = (xyz.maxY - xyz.minY + 1) * sm.size;

  let px = (x + model.canvas.width / 2) * (w / model.canvas.width),
    py = (y + model.canvas.height / 2) * (h / model.canvas.height);
  // let px = (x + model.canvas.width / 2) * (w / model.canvas.width),
  //   py = (-y + model.canvas.height / 2) * (h / model.canvas.height);

  return [px, py];
}

function pixelToPlane(model, px, py) {
  const z = 18;

  let xyz = sm.xyz(
    [
      model.bbox.minlng,
      model.bbox.minlat,
      model.bbox.maxlng,
      model.bbox.maxlat,
    ],
    z,
    true,
  );

  let w = (xyz.maxX - xyz.minX + 1) * sm.size,
    h = (xyz.maxY - xyz.minY + 1) * sm.size;

  let x = px * model.canvas.width / w - model.canvas.width / 2,
    y = py * model.canvas.height / h - model.canvas.height / 2;
  // let x = px * (model.canvas.width / w) - model.canvas.width / 2,
  //   y = -(py * (model.canvas.height / h) - model.canvas.height / 2);

  return [x, y];
}

function coordToPixel(lng, lat, z) {
  let mx = (lng * SHIFT) / 180.0;
  let my =
    Math.log(Math.tan(((90 + lat) * Math.PI) / 360.0)) / (Math.PI / 180.0);
  my = (my * SHIFT) / 180.0;

  const res = RES / 2 ** z;
  const px = (mx + SHIFT) / res;
  const py = (my + SHIFT) / res;

  return [px, py];
}

function pixelToCoord(px, py, z) {
  const res = RES / 2 ** z;

  const mx = px * res - SHIFT;
  const my = py * res - SHIFT;

  let lng = (mx / SHIFT) * 180.0;
  let lat = (my / SHIFT) * 180.0;
  lat =
    (180 / Math.PI) *
    (2 * Math.atan(Math.exp((lat * Math.PI) / 180.0)) - Math.PI / 2.0);

  return [lng, lat];
}

function coordToPlane(model, lng, lat, planeWidth, planeHeight) {
  planeWidth = planeWidth || model.canvas.width;
  planeHeight = planeHeight || model.canvas.height;

  const z = 18;

  let [minx, miny] = coordToPixel(model.bbox.minlng, model.bbox.minlat, z);
  let [absx, absy] = coordToPixel(lng, lat, z);
  // let [minx, miny] = sm.px([model.bbox.minlng, model.bbox.maxlat], z);
  // let [absx, absy] = sm.px([lng, lat], z);
  let px = absx - minx,
    py = absy - miny;

  // console.log([lng, lat], [px, py]);

  let [x, y] = pixelToPlane(model, px, py);

  return { x, y };
}

function planeToCoord(model, x, y) {
  const z = 18;
  // let _x = x,
  //   _y = y;

  console.log([x, y]);

  [x, y] = planeToPixel(model, x, y);
  let [minx, miny] = coordToPixel(model.bbox.minlng, model.bbox.minlat, z);
  // let [minx, miny] = sm.px([model.bbox.minlng, model.bbox.maxlat], z);
  let absx = minx + x,
    absy = miny + y;

  let [lng, lat] = pixelToCoord(absx, absy, z);
  // let [lng, lat] = sm.ll([absx, absy], z);

  return { lng, lat };
}

function scaleCoord(x) {
  return x * 10000; // 1000000;
}

function coordToLocalPlane(model, lng, lat, planeWidth, planeHeight) {
  planeWidth = planeWidth || model.canvas.width;
  planeHeight = planeHeight || model.canvas.height;
  let bboxW = scaleCoord(model.bbox.maxlng) - scaleCoord(model.bbox.minlng);
  let bboxH = scaleCoord(model.bbox.maxlat) - scaleCoord(model.bbox.minlat);
  let ratioW = planeWidth / bboxW;
  let ratioH = planeHeight / bboxH;
  let rellng = scaleCoord(lng) - scaleCoord(model.bbox.minlng);
  let rellat = scaleCoord(lat) - scaleCoord(model.bbox.minlat);
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
  //   w - model.canvas.width / 2,
  //   h - model.canvas.height / 2,
  // );
  return {
    x: w - planeWidth / 2,
    y: h - planeHeight / 2,
  };
}

function localPlaneToCoord(model, x, y) {
  let bboxW = model.bbox.maxlng - model.bbox.minlng;
  let bboxH = model.bbox.maxlat - model.bbox.minlat;
  let ratioW = bboxW / model.canvas.width;
  let ratioH = bboxH / model.canvas.height;
  let lng = (x + model.canvas.width / 2) * ratioW;
  let lat = (y + model.canvas.height / 2) * ratioH;
  return {
    lng: model.bbox.minlng + lng,
    lat: model.bbox.minlat + lat,
  };
}

export { coordToPlane, planeToCoord, coordToLocalPlane, localPlaneToCoord };
