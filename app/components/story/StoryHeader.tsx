import { Map, LayoutGrid, X } from "lucide-react";
import Link from "next/link";
import { SpeakerTheme, StoryItem } from "@/app/types";

type VerseData = Extract<StoryItem, { type: "verse" }>["data"];

interface StoryHeaderProps {
  isPaused: boolean;
  showGrid: boolean;
  verseData: VerseData | null;
  currentTheme: SpeakerTheme;
  currentSegmentIndex: number;
  totalSegments: number;
  bookUrl: string;
  onShowGrid: () => void;
}

export function StoryHeader({
  isPaused,
  showGrid,
  verseData,
  currentTheme,
  currentSegmentIndex,
  totalSegments,
  bookUrl,
  onShowGrid,
}: StoryHeaderProps) {
  return (
    <div
      className={`absolute top-10 left-4 right-4 z-40 flex justify-between items-start transition-opacity duration-300 ${
        isPaused || showGrid ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-3">
        {verseData ? (
          <div
            className={`flex items-center gap-2 backdrop-blur-md px-3 py-1.5 rounded-full border ${currentTheme.badge}`}
          >
            <span className="font-bold text-sm tracking-wide">
              {verseData.speaker}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-500 text-black px-3 py-1.5 rounded-full shadow-lg">
            <Map size={14} />
            <span className="font-bold text-xs uppercase tracking-tighter">
              Part {currentSegmentIndex + 1} of {totalSegments}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onShowGrid}
          className="p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/20 pointer-events-auto"
        >
          <LayoutGrid size={24} />
        </button>
        <Link
          href={bookUrl}
          className="p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/20 pointer-events-auto"
        >
          <X size={24} />
        </Link>
      </div>
    </div>
  );
}
