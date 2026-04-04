import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { Pattern } from '../types/api';

interface PatternContextValue {
  patterns: Pattern[] | null;
  setPatterns: Dispatch<SetStateAction<Pattern[] | null>>;
  selectedPattern: Pattern | null;
  setSelectedPattern: Dispatch<SetStateAction<Pattern | null>>;
  selectedPatternId: string | undefined;
  setSelectedPatternId: Dispatch<SetStateAction<string | undefined>>;
}

const PatternContext = createContext<PatternContextValue | undefined>(
  undefined
);

interface PatternContextProviderProps {
  children: ReactNode;
}

export const PatternContextProvider: React.FC<PatternContextProviderProps> = ({
  children,
}) => {
  const [patterns, setPatterns] = useState<Pattern[] | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [selectedPatternId, setSelectedPatternId] = useState<
    string | undefined
  >(undefined);

  const value = useMemo(
    () => ({
      patterns,
      setPatterns,
      selectedPattern,
      setSelectedPattern,
      selectedPatternId,
      setSelectedPatternId,
    }),
    [patterns, selectedPattern, selectedPatternId]
  );

  return (
    <PatternContext.Provider value={value}>{children}</PatternContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePatternContext = (): PatternContextValue => {
  const context = useContext(PatternContext);

  if (!context) {
    throw new Error(
      'usePatternContext must be used within a PatternContextProvider'
    );
  }

  return context;
};
