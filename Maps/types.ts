export type MarkerType = {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  images: ImageType[];
};

export type ImageType = {
  uri: string;
};
