import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMarkers } from '../context/MarkerContext';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

export default function MarkerDetail() {
  const { id } = useLocalSearchParams(); 
  const { markers, setMarkers } = useMarkers();
  const router = useRouter();

  const marker = markers.find((m) => m.id === id);

  const handleAddImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && marker) {
        const newImage = { uri: result.assets[0].uri };
        const newMarkers = markers.map((m) => {
          if (m.id === marker.id) {
            return { ...m, images: [...m.images, newImage] };
          }
          return m;
        });
        setMarkers(newMarkers);
      }
    } catch (error) {
      console.error('ImagePicker Error: ', error);
      Alert.alert(
        'Ошибка',
        'Не удалось выбрать изображение. Пожалуйста, проверьте разрешения.'
      );
    }
  };

  const handleDeleteImage = (imageUri: string) => {
    if (marker) {
      const newMarkers = markers.map((m) => {
        if (m.id === marker.id) {
          return { ...m, images: m.images.filter((img) => img.uri !== imageUri) };
        }
        return m;
      });
      setMarkers(newMarkers);
    }
  };

  const handleDeleteMarker = () => {
    if (marker) {
      const newMarkers = markers.filter((m) => m.id !== marker.id);
      setMarkers(newMarkers);
      router.back();
    }
  };

  if (!marker) {
    return (
      <View>
        <Text>Marker not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Координаты и изображение</Text>
      <Text>Широта: {marker.coordinate.latitude}</Text>
      <Text>Долгота: {marker.coordinate.longitude}</Text>

      <View style={styles.buttonWrapper}>
        <Button title="Добавить изображение" onPress={handleAddImage} />
      </View>

      <FlatList
        data={marker.images}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.uri }} style={styles.image} />
            <View style={styles.buttonWrapper}>
              <Button title="Delete" onPress={() => handleDeleteImage(item.uri)} />
            </View>
          </View>
        )}
      />

      <View style={styles.buttonWrapper}>
        <Button title="Удалить маркер" onPress={handleDeleteMarker} />
      </View>

      <View style={styles.buttonWrapper}>
        <Button title="Вернуться к карте" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  buttonWrapper: {
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});
