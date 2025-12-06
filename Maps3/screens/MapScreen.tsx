import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import MapView, { LongPressEvent, Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { useDatabase } from '../contexts/DatabaseContext';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';
import {
  checkProximity,
  getCurrentLocation,
  requestLocationPermissions,
  startLocationUpdates
} from '../services/location';
import { NotificationManager } from '../services/notifications';
import { styles } from './MapScreen.styles';


export default function MapScreen() {
  const databaseContext = useDatabase();
  const { isLoading, error, markers, addMarker } = databaseContext;
  const markersRef = useRef(markers);
  const router = useRouter();

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  const [region, setRegion] = useState<Region>({
    latitude: 58.01,
    longitude: 56.25,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [notificationManager] = useState(() => new NotificationManager());
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);

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


  useEffect(() => {
    let isMounted = true;

    const setupLocationAndNotifications = async () => {
      try {
        const locationPermissionGranted = await requestLocationPermissions();
        if (!locationPermissionGranted) {
          setLocationErrorMsg('Доступ к местоположению не разрешён');
          Alert.alert('Ошибка', 'Доступ к местоположению не разрешён. Пожалуйста, включите разрешения в настройках приложения.');
          return;
        }

        const notificationPermissionGranted = await notificationManager.requestNotificationPermissions();
        if (!notificationPermissionGranted) {
          Alert.alert('Ошибка', 'Разрешение на уведомления не предоставлено. Пожалуйста, включите разрешения в настройках приложения.');
        }

        const currentLocation = await getCurrentLocation();
        if (currentLocation && isMounted) {
          setLocation(currentLocation);

          setRegion({
            ...region,
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        }

        const subscription = await startLocationUpdates(
          (location) => {
            if (isMounted) {
              setLocation(location);

              const currentMarkers = markersRef.current;

              const nearbyMarkerIds = checkProximity(
                location,
                currentMarkers,
                50
              );

              const nearbyMarkers = currentMarkers
                .filter(marker => nearbyMarkerIds.includes(marker.id))
                .map(marker => ({
                  id: marker.id,
                  coordinate: marker.coordinate
                }));

              console.log('Проверка приближения, nearbyMarkerIds:', nearbyMarkerIds, 'markers length:', currentMarkers.length);

              notificationManager.updateNotifications(
                nearbyMarkers,
                currentMarkers
              );

              if (nearbyMarkerIds.length > 0) {
                const nearbyMarkerId = nearbyMarkerIds[0];
                const marker = currentMarkers.find(m => m.id === nearbyMarkerId);
                console.log('Найден ближайший маркер:', marker);

                if (marker) {
                  console.log('Уведомление о приближении к маркеру отправлено');
                }
              } else {
                console.log('Нет ближайших маркеров');
              }
            }
          },
          {
            accuracy: Location.LocationAccuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 5
          }
        );
        setLocationSubscription(subscription);
      } catch (error) {
        console.error('Error setting up location and notifications:', error);
        if (isMounted) {
          setLocationErrorMsg('Ошибка при настройке геолокации');
        }
      }
    };

    setupLocationAndNotifications();

    return () => {
      isMounted = false;
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);


  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" /><Text style={styles.errorText}>Загрузка...</Text></View>;
  }

  if (error) {
    return <Text style={styles.errorText}>Ошибка: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        onLongPress={handleLongPress}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={true}
        provider={PROVIDER_DEFAULT}
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
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Ваше местоположение"
            pinColor="blue"
          />
        )}
      </MapView>
    </View>
  );
}
