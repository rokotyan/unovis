import { min, max } from 'd3-array'

// Types
import { NumericAccessor } from 'types/accessor'

// Utils
import { getNumber } from 'utils/data'

export function getDataLatLngBounds<D> (
  data: D[],
  pointLatitude: NumericAccessor<D>,
  pointLongitude: NumericAccessor<D>,
  paddingDegrees = 1
): [[number, number], [number, number]] {
  const northWest = {
    lat: max(data ?? [], d => getNumber(d, pointLatitude)) ?? 0,
    lng: min(data ?? [], d => getNumber(d, pointLongitude)) ?? 0,
  }

  const southEast = {
    lat: min(data ?? [], d => getNumber(d, pointLatitude)) ?? 0,
    lng: max(data ?? [], d => getNumber(d, pointLongitude)) ?? 0,
  }

  return [
    [northWest.lat + paddingDegrees || 90, northWest.lng - paddingDegrees || -180],
    [southEast.lat - paddingDegrees || -70, southEast.lng + paddingDegrees || 180],
  ]
}
