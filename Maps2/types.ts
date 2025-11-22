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
