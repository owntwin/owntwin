import type { GeoJSON as GeoJSONType } from "geojson";

export type Layer = {
  id: string;
  name: string;
  path: string;
  format: "png" | "svg" | "geojson" | string;
} & Record<string, any>;

export type Building = {
  id: string;
  name: string;
  path: string;
  base: [number, number][];
  z: number;
  depth: number;
  type: string;
  data?: any;
};

export type Action = {
  id: string;
  type: string;
  text: string;
  fields: string[];
} & Record<string, any>;

export type ModuleDefinition = {
  name: string;
  description: string;
  license: string;
  actions: Action[];
  layers: Layer[];
};

export type BBox = {
  minlng: number;
  minlat: number;
  maxlng: number;
  maxlat: number;
};

export type Definition = {
  "@id": string;
  "@type": string;
  name: string;
  description: string;
  license: string;
  community: string;
  bbox: [number, number, number, number];
  terrain: { path: string };
  properties: Record<string, any>;
  // layers: Layer[];
  modules: ModuleDefinition[];
  building?: Building;
};

export type Model = Omit<Definition, "bbox" | "terrain"> & {
  bbox: BBox;
  terrain: { path?: string; data: [number, number, number][] };
};

export type FieldState = {
  pixelPerMeter: number;
  coordToPlane: Function;
  getAltitude: Function;
};

export type GeoJSON = GeoJSONType;
