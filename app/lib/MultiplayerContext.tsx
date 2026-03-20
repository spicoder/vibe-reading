"use client";

import { createContext, useContext } from "react";
import { usePlayerLogic } from "./hooks/usePlayerLogic";
import { useMarketLogic } from "./hooks/useMarketLogic";
export * from "./multiplayerTypes"; // Re-exporting types for consumers

const MultiplayerContext = createContext<any>(null);

export const MultiplayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const playerLogic = usePlayerLogic();
  const marketLogic = useMarketLogic(playerLogic.currentUser);

  return (
    <MultiplayerContext.Provider value={{ ...playerLogic, ...marketLogic }}>
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => useContext(MultiplayerContext);
