import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import MapView, { LongPressEvent, Marker, Region } from 'react-native-maps';
import { useDatabase } from '../contexts/DatabaseContext';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import { styles } from './MapScreen.styles';

export default function MapScreen() {
  const { isLoading, error, markers, addMarker } = useDatabase();
  const router = useRouter();

  const [region, setRegion] = useState<Region>({
    latitude: 58.01,
    longitude: 56.25,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const debouncedAddMarker = useDebouncedCallback(addMarker, 300); 

  const handleLongPress = useCallback((event: LongPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    debouncedAddMarker(latitude, longitude); 
  }, [debouncedAddMarker]);

  const handleMarkerPress = useCallback((markerId: number) => {
    router.push(`/marker/${markerId}`);
  }, [router]);

  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" /><Text style={styles.errorText}>Загрузка...</Text></View>;
  }

  if (error) {
    return <Text style={styles.errorText}>Ошибка: {error.message}</Text>;
  }

  return (
    <MapView
      style={styles.map}
      onLongPress={handleLongPress}
      region={region}
      onRegionChangeComplete={handleRegionChangeComplete}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          title={`Маркер ${marker.id}`}
          onPress={() => handleMarkerPress(marker.id)}
        >
          {marker.images.length > 0 ? (
            <Image
              source={{ uri: marker.images[0].uri }}
              style={styles.markerImage}
            />
          ) : null}
        </Marker>
      ))}
    </MapView>
  );
}