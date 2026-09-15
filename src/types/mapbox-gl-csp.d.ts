declare module "mapbox-gl/dist/mapbox-gl-csp.js" {
  const mapboxglCsp: {
    accessToken: string;
    workerUrl: string;
    Map: typeof import("mapbox-gl").Map;
    Marker: typeof import("mapbox-gl").Marker;
    NavigationControl: typeof import("mapbox-gl").NavigationControl;
    AttributionControl: typeof import("mapbox-gl").AttributionControl;
  };
  export default mapboxglCsp;
}
