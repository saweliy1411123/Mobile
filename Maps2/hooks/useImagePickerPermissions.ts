import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

export function useImagePickerPermissions() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status !== 'granted') {
          Alert.alert('Извините, нам нужны разрешения для доступа к галерее, чтобы это работало!');
        }
      } else {
        setHasPermission(true);
      }
    })();
  }, []);

  return hasPermission;
}
