import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
};

export const getCurrentLocation = async (): Promise<Coordinates | null> => {
  const permissionGranted = await requestLocationPermission();
  if (!permissionGranted) {
    return null;
  }

  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  };
};
