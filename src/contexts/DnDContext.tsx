import React, { createContext, useContext, useState } from "react";

type DnDContextType = {
  type: string | null;
  pointerEvents: string;
  setType: React.Dispatch<React.SetStateAction<string | null>>;
  setPointerEvents: React.Dispatch<React.SetStateAction<string>>;
};

const DnDContext = createContext<DnDContextType>({
  type: null,
  pointerEvents: "auto",
  setType: () => {},
  setPointerEvents: () => {},
});

interface DnDProviderProps {
  children: React.ReactNode;
}

export const DnDProvider: React.FC<DnDProviderProps> = ({ children }) => {
  const [type, setType] = useState<string | null>(null);
  const [pointerEvents, setPointerEvents] = useState<string>("auto");

  return (
    <DnDContext.Provider
      value={{ type, setType, pointerEvents, setPointerEvents }}
    >
      {children}
    </DnDContext.Provider>
  );
};

export default DnDContext;

export const useDnD = () => {
  return useContext(DnDContext);
};
