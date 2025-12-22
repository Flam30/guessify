"use client";

import React from 'react';

type Track = {
  track: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
  };
};

type TracksContextValue = {
  tracks: Track[];
  setTracks: (t: Track[]) => void;
};

const TracksContext = React.createContext<TracksContextValue | undefined>(undefined);

export function TracksProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = React.useState<Track[]>([]);
  return (
    <TracksContext.Provider value={{ tracks, setTracks }}>
      {children}
    </TracksContext.Provider>
  );
}

export function useTracks() {
  const ctx = React.useContext(TracksContext);
  if (!ctx) throw new Error('useTracks must be used inside TracksProvider');
  return ctx;
}

export type { Track };
