// Asset definitions for real artwork 3D pizza rendering
export interface PizzaToppingData {
  cx: number;
  cy: number;
  r: number;
  k: number;
  url: string;
}

export interface PizzaAssetPack {
  main: string;
  slice: string;
  sp: [number, number, number, number, string][];
}
