import * as Location from 'expo-location';

export interface ImageType {
  id: number;
  uri: string;
}

export interface MarkerType {
  id: number;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  images: ImageType[];
}

export interface LocationConfig {
  accuracy: Location.LocationAccuracy;
  timeInterval: number;
  distanceInterval: number;
}

export interface LocationState {
  location: Location.LocationObject | null;
  errorMsg: string | null;
}

export interface ActiveNotification {
  markerId: number;
  notificationId: string;
  timestamp: number;
}
