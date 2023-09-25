export type Line = {
  points: { x: number; y: number; z: number }[] | THREE.Vector3[];
  lineWidth?: number;
  color?: number | string;
  opacity?: number;
  uuid: string;
};

export type Drawing = Line;
