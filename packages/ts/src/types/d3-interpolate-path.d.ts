declare module 'd3-interpolate-path' {
  export function interpolatePath(a: string, b: string, excludeSegment?: number): (t: number) => string;
}
