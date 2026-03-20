"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useMultiplayer } from "@/app/lib/MultiplayerContext";

export function StarWallet() {
  const { currentUser, isLoaded } = useMultiplayer();
  const [animate, setAnimate] = useState(false);
  const [prevStars, setPrevStars] = useState(0);

  // Trigger a "bump" animation when the star balance increases
  useEffect(() => {
    const currentStars = currentUser?.stars || 0;
    if (currentStars > prevStars) {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 500); // Remove animation class after 500ms
    }
    setPrevStars(currentStars);
  }, [currentUser?.stars, prevStars]);

  if (!isLoaded || !currentUser) return null;

  return (
    <div
      className={`z-100 flex items-center gap-2 bg-white backdrop-blur-md border border-amber-500/30 px-4 py-1 rounded-full shadow-lg transition-transform duration-300 ease-out ${
        animate ? "scale-125" : "scale-100"
      }`}
    >
      <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
      <span className="text-amber-400 font-bold font-mono text-base">
        {currentUser.stars || 0}
      </span>
    </div>
  );
}
