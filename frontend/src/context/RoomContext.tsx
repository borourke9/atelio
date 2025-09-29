import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { RoomDesign, PlacedFurniture, CatalogItem, DetectionResult } from '../types';

interface RoomState {
  design: RoomDesign;
  detectedObjects: DetectionResult[];
  catalog: CatalogItem[];
  selectedItem: CatalogItem | null;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
}

type RoomAction =
  | { type: 'SET_BACKGROUND_PHOTO'; payload: string }
  | { type: 'SET_DETECTED_OBJECTS'; payload: DetectionResult[] }
  | { type: 'SET_CATALOG'; payload: CatalogItem[] }
  | { type: 'SET_SELECTED_ITEM'; payload: CatalogItem | null }
  | { type: 'ADD_FURNITURE'; payload: PlacedFurniture }
  | { type: 'UPDATE_FURNITURE'; payload: { id: string; updates: Partial<PlacedFurniture> } }
  | { type: 'REMOVE_FURNITURE'; payload: string }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_DESIGN'; payload: RoomDesign }
  | { type: 'RESET_DESIGN' };

const initialState: RoomState = {
  design: {
    backgroundPhoto: '',
    placedFurniture: [],
  },
  detectedObjects: [],
  catalog: [],
  selectedItem: null,
  currentStep: 1,
  isLoading: false,
  error: null,
};

function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case 'SET_BACKGROUND_PHOTO':
      return {
        ...state,
        design: {
          ...state.design,
          backgroundPhoto: action.payload,
        },
        currentStep: 2,
      };
    case 'SET_DETECTED_OBJECTS':
      return {
        ...state,
        detectedObjects: action.payload,
        currentStep: 3,
      };
    case 'SET_CATALOG':
      return {
        ...state,
        catalog: action.payload,
      };
    case 'SET_SELECTED_ITEM':
      return {
        ...state,
        selectedItem: action.payload,
      };
    case 'ADD_FURNITURE':
      return {
        ...state,
        design: {
          ...state.design,
          placedFurniture: [...state.design.placedFurniture, action.payload],
        },
        currentStep: 4,
      };
    case 'UPDATE_FURNITURE':
      return {
        ...state,
        design: {
          ...state.design,
          placedFurniture: state.design.placedFurniture.map(furniture =>
            furniture.id === action.payload.id
              ? { ...furniture, ...action.payload.updates }
              : furniture
          ),
        },
      };
    case 'REMOVE_FURNITURE':
      return {
        ...state,
        design: {
          ...state.design,
          placedFurniture: state.design.placedFurniture.filter(
            furniture => furniture.id !== action.payload
          ),
        },
      };
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'LOAD_DESIGN':
      return {
        ...state,
        design: action.payload,
        currentStep: 4,
      };
    case 'RESET_DESIGN':
      return initialState;
    default:
      return state;
  }
}

interface RoomContextType {
  state: RoomState;
  dispatch: React.Dispatch<RoomAction>;
  saveDesign: () => void;
  loadDesign: () => void;
  saveSession: () => void;
  reset: () => void;
  hasPhoto: boolean;
  room: RoomDesign;
  setSelectedItem: (item: CatalogItem | null) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(roomReducer, initialState);

  const saveDesign = () => {
    try {
      localStorage.setItem('furniture-swap-design', JSON.stringify(state.design));
      console.log('Design saved to localStorage');
    } catch (error) {
      console.error('Failed to save design:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save design' });
    }
  };

  const loadDesign = () => {
    try {
      const saved = localStorage.getItem('furniture-swap-design');
      if (saved) {
        const design = JSON.parse(saved);
        dispatch({ type: 'LOAD_DESIGN', payload: design });
      }
    } catch (error) {
      console.error('Failed to load design:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load design' });
    }
  };

  const saveSession = () => {
    try {
      localStorage.setItem('furniture-swap.session:v1', JSON.stringify(state.design));
      console.log('Session saved to localStorage');
    } catch (error) {
      console.error('Failed to save session:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save session' });
    }
  };

  const reset = () => {
    dispatch({ type: 'RESET_DESIGN' });
    localStorage.removeItem('furniture-swap.session:v1');
    console.log('Room reset');
  };

  const hasPhoto = !!state.design.backgroundPhoto;
  const room = state.design;

  const setSelectedItem = (item: CatalogItem | null) => {
    dispatch({ type: 'SET_SELECTED_ITEM', payload: item });
  };

  return (
    <RoomContext.Provider value={{ 
      state, 
      dispatch, 
      saveDesign, 
      loadDesign, 
      saveSession, 
      reset, 
      hasPhoto, 
      room,
      setSelectedItem
    }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
