import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useImagePickerPermissions } from '../../hooks/useImagePickerPermissions';

export default function MarkerDetail() {
  const { id } = useLocalSearchParams();
  const { markers, deleteMarker, addImage, deleteImage } = useDatabase();
  const router = useRouter();
  const hasMediaLibraryPermission = useImagePickerPermissions(); 

  const numericId = Number(id);
  const marker = markers.find((m) => m.id === numericId);

  const handleAddImage = async () => {
    if (!marker) return;

    if (hasMediaLibraryPermission === false) { 
      return;
    }
    if (hasMediaLibraryPermission === null) { 
        return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        await addImage(numericId, result.assets[0].uri);
      }
    } catch (error) {
      console.error('ImagePicker Error: ', error);
      Alert.alert(
        'Ошибка',
        'Не удалось выбрать изображение. Пожалуйста, проверьте разрешения.'
      );
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!marker) return;
    Alert.alert(
      'Удалить изображение',
      'Вы уверены, что хотите удалить это изображение?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => deleteImage(imageId) },
      ]
    );
  };

  const handleDeleteMarker = async () => {
    if (!marker) return;
    Alert.alert(
      'Удалить маркер',
      'Вы уверены, что хотите удалить этот маркер и все связанные с ним изображения?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: async () => {
            await deleteMarker(numericId);
            router.back();
          }
        },
      ]
    );
  };

  if (!marker) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Маркер не найден.</Text>
        <View style={styles.buttonWrapper}>
          <Button title="Вернуться к карте" color="#007AFF" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Детали маркера</Text>
      <Text style={styles.detailText}>Широта: {marker.coordinate.latitude.toFixed(4)}</Text>
      <Text style={styles.detailText}>Долгота: {marker.coordinate.longitude.toFixed(4)}</Text>

      <View style={styles.separator} />

      <View style={styles.buttonWrapper}>
        <Button title="Добавить изображение" color="#007AFF" onPress={handleAddImage} />
      </View>

      <FlatList
        data={marker.images}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        ListEmptyComponent={<Text style={styles.emptyText}>Изображений пока нет.</Text>}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.uri }} style={styles.image} />
            <View style={styles.deleteButton}>
              <Button title="X" color="red" onPress={() => handleDeleteImage(item.id)} />
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.buttonWrapper}>
          <Button title="Удалить маркер" color="red" onPress={handleDeleteMarker} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Вернуться к карте" color="#007AFF" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff', 
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333', 
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '100%',
    backgroundColor: '#eee',
  },
  buttonWrapper: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden', 
  },
  imageContainer: {
    margin: 5,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: 100,
    height: 100,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'column',
    gap: 10,
    paddingTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
});