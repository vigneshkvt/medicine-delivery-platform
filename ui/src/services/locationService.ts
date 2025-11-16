import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

const FALLBACK_COORDINATES: Coordinates = {
  latitude: 13.0827,
  longitude: 80.2707
};

export const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
};

export const getCurrentLocation = async (): Promise<Coordinates | null> => {
  const permissionGranted = await requestLocationPermission();
  if (!permissionGranted) {
    return null;
  }

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      maximumAge: 60000,
      timeout: 5000
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Location lookup failed, using fallback coordinates', error);
    return FALLBACK_COORDINATES;
  }
};
