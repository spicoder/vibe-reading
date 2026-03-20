"use client";

import { useMultiplayer } from "@/app/lib/MultiplayerContext";
import AuthView from "./components/AuthView";
import LibraryView from "./components/library/LibraryView";

export default function Home() {
  const { currentUser, isLoaded } = useMultiplayer();

  if (!isLoaded || (currentUser && currentUser.avatar === "⏳")) {
    return <div className="min-h-screen bg-[#FDFBF7]" />;
  }

  if (!currentUser) {
    return <AuthView />;
  }

  return <LibraryView />;
}
