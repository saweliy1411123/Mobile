import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';

export interface LocationConfig {
  accuracy: Location.LocationAccuracy;
  timeInterval: number;
  distanceInterval: number;
}

export interface LocationState {
  location: LocationObject | null;
  errorMsg: string | null;
}

export const requestLocationPermissions = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
};
export const startLocationUpdates = async (
  onLocation: (location: LocationObject) => void,
  config: LocationConfig = {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 5000,
    distanceInterval: 5
  }
) => {
  const subscription = await Location.watchPositionAsync(
    config,
    onLocation
  );
  return subscription;
};

export const getCurrentLocation = async (): Promise<LocationObject | null> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });
    return location;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const checkProximity = (
  userLocation: LocationObject,
  markers: { id: number; coordinate: { latitude: number; longitude: number } }[],
  proximityThreshold: number = 50
) => {
  const nearbyMarkers: number[] = [];

  markers.forEach(marker => {
    const distance = calculateDistance(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      marker.coordinate.latitude,
      marker.coordinate.longitude
    );

    if (distance <= proximityThreshold) {
      nearbyMarkers.push(marker.id);
    }
  });

  return nearbyMarkers;
};