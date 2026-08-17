const { getDistanceInMeters } = require('../utils/geo');

describe('Geospatial Distance Calculation Utility (Haversine)', () => {
  test('should return 0 meters for identical coordinates', () => {
    const coord = [79.8711, 12.1697];
    const distance = getDistanceInMeters(coord, coord);
    expect(distance).toBe(0);
  });

  test('should accurately calculate distance between two distinct points', () => {
    const pointA = [79.8711, 12.1697];
    const pointB = [79.8800, 12.1750];
    const distance = getDistanceInMeters(pointA, pointB);
    expect(distance).toBeGreaterThan(500);
    expect(distance).toBeLessThan(2000);
  });

  test('should return 0 when coordinates are missing or null', () => {
    expect(getDistanceInMeters(null, [79.8711, 12.1697])).toBe(0);
    expect(getDistanceInMeters([79.8711, 12.1697], undefined)).toBe(0);
  });
});
