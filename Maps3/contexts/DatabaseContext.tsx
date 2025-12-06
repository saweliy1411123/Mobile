import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';

import { initDatabase } from '../database/schema';
import * as DBOperations from '../database/operations';
import { MarkerType, ImageType } from '../types';

interface DatabaseContextType {
  markers: MarkerType[];
  isLoading: boolean;
  error: Error | null;
  addMarker: (latitude: number, longitude: number) => Promise<void>;
  deleteMarker: (id: number) => Promise<void>;
  getMarkers: () => Promise<void>;
  addImage: (markerId: number, uri: string) => Promise<void>;
  deleteImage: (id: number) => Promise<void>;
  getMarkerImages: (markerId: number) => Promise<ImageType[]>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function setup() {
      setIsLoading(true);
      try {
        const database = await initDatabase();
        setDb(database);
        const initialMarkers = await DBOperations.getMarkers(database);
        setMarkers(initialMarkers);
      } catch (e) {
        setError(e as Error);
      }
      finally {
        setIsLoading(false);
      }
    }
    setup();  
    return () => {
      db?.close();
    };
  }, []);

  const getMarkers = async () => {
    if (!db) return;
    setIsLoading(true);
    try {
      const allMarkers = await DBOperations.getMarkers(db);
      setMarkers(allMarkers);
    } catch (e) {
      setError(e as Error);
    }
    finally {
      setIsLoading(false);
    }
  };

  const addMarker = async (latitude: number, longitude: number) => {
    if (!db) return;
    try {
      await DBOperations.addMarker(db, latitude, longitude);
      await getMarkers();
    } catch (e) {
      setError(e as Error);
    }
  };

  const deleteMarker = async (id: number) => {
    if (!db) return;
    try {
      await DBOperations.deleteMarker(db, id);
      await getMarkers();
    } catch (e) {
      setError(e as Error);
    }
  };

  const addImage = async (markerId: number, uri: string) => {
    if (!db) return;
    try {
      await DBOperations.addImage(db, markerId, uri);
      await getMarkers();
    } catch (e) {
      setError(e as Error);
    }
  };

  const deleteImage = async (id: number) => {
    if (!db) return;
    try {
      await DBOperations.deleteImage(db, id);
      await getMarkers();
    } catch (e) {
      setError(e as Error);
    }
  };

  const getMarkerImages = async (markerId: number): Promise<ImageType[]> => {
    if (!db) return [];
    try {
      return await DBOperations.getMarkerImages(db, markerId);
    } catch (e) {
      setError(e as Error);
      return [];
    }
  };

  const value = {
    markers,
    isLoading,
    error,
    addMarker,
    deleteMarker,
    getMarkers,
    addImage,
    deleteImage,
    getMarkerImages,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase должен использоваться внутри DatabaseProvider');
  }
  return context;
}