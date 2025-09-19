import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Current state
  currentLocation: string;
  language: string;
  musicEnabled: boolean;
  currentTrack: string;
  isPlaying: boolean;
  visitedLocations: string[];
  
  // UI state
  isMapOpen: boolean;
  isMenuOpen: boolean;
  isQuestOpen: boolean;
  selectedLocationForModal: string | null;
  
  // Settings
  volume: number;
  soundEffectsEnabled: boolean;
  autoPlayMusic: boolean;
  
  // Actions
  setCurrentLocation: (location: string) => void;
  setLanguage: (lang: string) => void;
  toggleMusic: () => void;
  setCurrentTrack: (track: string) => void;
  setIsPlaying: (playing: boolean) => void;
  addVisitedLocation: (location: string) => void;
  
  // UI actions
  setMapOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setQuestOpen: (open: boolean) => void;
  setSelectedLocationForModal: (location: string | null) => void;
  
  // Settings actions
  setVolume: (volume: number) => void;
  toggleSoundEffects: () => void;
  setAutoPlayMusic: (autoPlay: boolean) => void;
  
  // Utility actions
  reset: () => void;
}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLocation: 'tumski',
      language: 'ru',
      musicEnabled: true,
      currentTrack: 'town',
      isPlaying: false,
      visitedLocations: [],
      
      // UI state
      isMapOpen: false,
      isMenuOpen: false,
      isQuestOpen: false,
      selectedLocationForModal: null,
      
      // Settings
      volume: 0.7,
      soundEffectsEnabled: true,
      autoPlayMusic: true,
      
      // Actions
      setCurrentLocation: (location) => {
        set({ currentLocation: location });
        get().addVisitedLocation(location);
      },
      
      setLanguage: (lang) => set({ language: lang }),
      
      toggleMusic: () => {
        const { musicEnabled, isPlaying } = get();
        set({ 
          musicEnabled: !musicEnabled,
          isPlaying: musicEnabled ? false : isPlaying,
        });
      },
      
      setCurrentTrack: (track) => set({ currentTrack: track }),
      
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      
      addVisitedLocation: (location) => {
        const { visitedLocations } = get();
        if (!visitedLocations.includes(location)) {
          set({ visitedLocations: [...visitedLocations, location] });
        }
      },
      
      // UI actions
      setMapOpen: (open) => set({ isMapOpen: open }),
      setMenuOpen: (open) => set({ isMenuOpen: open }),
      setQuestOpen: (open) => set({ isQuestOpen: open }),
      setSelectedLocationForModal: (location) => set({ selectedLocationForModal: location }),
      
      // Settings actions
      setVolume: (volume) => set({ volume }),
      toggleSoundEffects: () => set({ soundEffectsEnabled: !get().soundEffectsEnabled }),
      setAutoPlayMusic: (autoPlay) => set({ autoPlayMusic: autoPlay }),
      
      // Utility actions
      reset: () => set({
        currentLocation: 'tumski',
        visitedLocations: [],
        isMapOpen: false,
        isMenuOpen: false,
        isQuestOpen: false,
        selectedLocationForModal: null,
      }),
    }),
    {
      name: 'tumski-island-tour',
      partialize: (state) => ({
        // Persist only certain parts of the state
        language: state.language,
        musicEnabled: state.musicEnabled,
        volume: state.volume,
        soundEffectsEnabled: state.soundEffectsEnabled,
        autoPlayMusic: state.autoPlayMusic,
        visitedLocations: state.visitedLocations,
        currentLocation: state.currentLocation,
      }),
    }
  )
);

export default useAppStore;