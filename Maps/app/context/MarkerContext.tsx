import { createContext, useContext, useState } from 'react';
import { MarkerType } from '../types';

type MarkerContextType = {
  markers: MarkerType[];
  setMarkers: React.Dispatch<React.SetStateAction<MarkerType[]>>;
};

const MarkerContext = createContext<MarkerContextType | undefined>(undefined);

export function MarkerProvider({ children }: { children: React.ReactNode }) {
  const [markers, setMarkers] = useState<MarkerType[]>([]);

  return (
    <MarkerContext.Provider value={{ markers, setMarkers }}> 
      {children}
    </MarkerContext.Provider>
  );
}

export function useMarkers() {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error('useMarkers must be used within a MarkerProvider');
  }
  return context;
}