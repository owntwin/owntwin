export type Layer = {
  enabled: boolean;
  id: string;
  name: string;
  path: string;
  type?: string;
  format: "png" | "svg" | "geojson" | string;
  provider?: string;
  license?: string;
} & Record<string, any>;

export type Action = {
  id: string;
  type: string;
  text: string;
  fields: string[];
} & Record<string, any>;

export type Model = {
  id: string;
  displayName?: string;
  type?: string;
  homepage?: string;
  description?: string;
  license?: string;
  community?: string;
  bbox?: [number, number, number, number];
  field?: { path: string };
  entities?: Record<string, any>;
  properties?: Record<string, any>;
  actions?: Action[];
  layers?: Layer[];
};

// NOTE: internal
export type BBox = {
  minlng: number;
  minlat: number;
  maxlng: number;
  maxlat: number;
};

// NOTE: internal
export type FieldData = {
  geometry: THREE.PlaneGeometry;
  vertices: number[];
};

// NOTE: internal
export type InternalModel = Omit<Model, "bbox"> & {
  bbox?: BBox;
};

// NOTE: internal
export type FieldState = {
  pixelPerMeter: number;
  coordToPlane: Function;
  getAltitude: Function;
};

// NOTE: internal
export type ElevationMap = [number, number, number][];
