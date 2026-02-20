import { SpeakerTheme } from "../types";

export const speakerThemes: Record<string, SpeakerTheme> = {
  Jehova: {
    container: "bg-gradient-to-b from-yellow-500/80 to-black",
    text: "text-2xl md:text-4xl text-amber-50",
    badge: "bg-white/20 text-white border-white/10",
  },
  Isaias: {
    container: "bg-amber-800/80", // Dark brown/beige vibe
    text: "text-2xl md:text-3xl text-amber-100",
    badge: "bg-white/20 text-white border-white/10",
  },
  // Add new characters here in the future:
  // "Hari ng Asirya": {
  //   container: "bg-red-950",
  //   text: "text-2xl md:text-3xl text-red-100",
  //   badge: "bg-red-500/20 text-red-300 border-red-500/30",
  // },
  // The fallback theme for Narrator or any unmapped character
  default: {
    container: "bg-black",
    text: "text-2xl md:text-3xl text-stone-200",
    badge: "bg-white/20 text-white border-white/10",
  },
};
