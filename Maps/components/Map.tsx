import { StyleSheet, ActivityIndicator, View } from 'react-native';
import MapView, { LongPressEvent, Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { MarkerType } from '../types';
import { useMarkers } from '../app/context/MarkerContext';

export default function Map() {
  const { markers, setMarkers } = useMarkers();
  const router = useRouter();
  const [isMapReady, setIsMapReady] = useState(false);

  const handleLongPress = (event: LongPressEvent) => {
    const { coordinate } = event.nativeEvent;
    const newMarker: MarkerType = {
      id: Math.random().toString(36).substr(2, 9),
      coordinate,
      images: [],
    };
    setMarkers([...markers, newMarker]);
  };

  const handleMarkerPress = (marker: MarkerType) => {
    router.push(`/marker/${marker.id}`);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 58.0105,
          longitude: 56.2502,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onLongPress={handleLongPress}
        onMapReady={() => setIsMapReady(true)}
      >
        {markers.map((marker) => (
          <Marker key={marker.id} coordinate={marker.coordinate} onPress={() => handleMarkerPress(marker)}>
            {marker.images.length > 0 && <Image source={{ uri: marker.images[0].uri }} style={styles.markerImage} />}
          </Marker>
        ))}
      </MapView>
      {!isMapReady && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerImage: {
    width: 40,
    height: 40,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});