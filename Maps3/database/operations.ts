import { type SQLiteDatabase } from 'expo-sqlite';
import { ImageType, MarkerType } from '../types';

type MarkerFromDB = {
  id: number;
  latitude: number;
  longitude: number;
};

type ImageFromDB = {
  id: number;
  uri: string;
  marker_id: number;
};

export async function getMarkers(db: SQLiteDatabase): Promise<MarkerType[]> { 
  console.log('Fetching all markers and images...');
  const [markerRows, imageRows] = await Promise.all([
    db.getAllAsync<MarkerFromDB>('SELECT * FROM markers ORDER BY created_at DESC'),
    db.getAllAsync<ImageFromDB>('SELECT * FROM marker_images ORDER BY created_at DESC'),
  ]);

  const imagesByMarkerId = new Map<number, ImageType[]>();
  for (const image of imageRows) {
    if (!imagesByMarkerId.has(image.marker_id)) {
      imagesByMarkerId.set(image.marker_id, []);
    }
    imagesByMarkerId.get(image.marker_id)!.push({ id: image.id, uri: image.uri });
  }

  const markers: MarkerType[] = markerRows.map(row => ({
    id: row.id,
    coordinate: { latitude: row.latitude, longitude: row.longitude },
    images: imagesByMarkerId.get(row.id) || [],
  }));

  console.log(`Fetched ${markers.length} markers and ${imageRows.length} total images.`);
  return markers;
}

export async function addMarker(db: SQLiteDatabase, latitude: number, longitude: number): Promise<number> { 
  const result = await db.runAsync('INSERT INTO markers (latitude, longitude) VALUES (?, ?)', latitude, longitude);
  console.log(`Marker added with ID: ${result.lastInsertRowId}`);
  return result.lastInsertRowId;
}

export async function deleteMarker(db: SQLiteDatabase, id: number): Promise<void> { 
  await db.runAsync('DELETE FROM markers WHERE id = ?', id);
  console.log(`Marker with ID: ${id} deleted.`);
}

export async function addImage(db: SQLiteDatabase, markerId: number, uri: string): Promise<number> { 
  const result = await db.runAsync('INSERT INTO marker_images (marker_id, uri) VALUES (?, ?)', markerId, uri);
  console.log(`Image added for Marker ID: ${markerId} with ID: ${result.lastInsertRowId}`);
  return result.lastInsertRowId;
}

export async function deleteImage(db: SQLiteDatabase, id: number): Promise<void> { 
  await db.runAsync('DELETE FROM marker_images WHERE id = ?', id);
  console.log(`Image with ID: ${id} deleted.`);
}

export async function getMarkerImages(db: SQLiteDatabase, markerId: number): Promise<ImageType[]> { 
  const imageRows = await db.getAllAsync<ImageFromDB>('SELECT * FROM marker_images WHERE marker_id = ? ORDER BY created_at DESC', markerId);
  return imageRows.map(row => ({ id: row.id, uri: row.uri }));
}
