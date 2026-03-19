import { Heart, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { StoryItem } from "@/app/types";

// Extract the verse data shape
type VerseData = Extract<StoryItem, { type: "verse" }>["data"];

interface StoryInteractionsProps {
  isPaused: boolean;
  showGrid: boolean;
  verseData: VerseData | null;
  currentSlide: StoryItem;
  currentIndex: number;
  bookTitle: string;
  bookId: string;
  currentChapter: number;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

export function StoryInteractions({
  isPaused,
  showGrid,
  verseData,
  currentSlide,
  currentIndex,
  bookTitle,
  bookId,
  currentChapter,
  isFavorite,
  toggleFavorite,
}: StoryInteractionsProps) {
  const router = useRouter();

  if (!verseData) return null;

  return (
    <div
      className={`absolute right-4 bottom-10 z-40 flex flex-col gap-6 items-center transition-opacity duration-300 ${
        isPaused || showGrid ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(currentSlide.id);
        }}
        className="flex flex-col items-center gap-1 pointer-events-auto"
      >
        <div
          className={`p-3 rounded-full backdrop-blur-md ${
            isFavorite(currentSlide.id)
              ? "bg-red-500/20 text-red-500"
              : "bg-black/40 text-white"
          }`}
        >
          <Heart
            size={28}
            fill={isFavorite(currentSlide.id) ? "currentColor" : "none"}
          />
        </div>
        <span className="text-[10px] font-bold">Like</span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          const ref = encodeURIComponent(
            `${bookTitle} ${currentChapter}:${verseData.verseDisplay}`,
          );
          const returnTo = encodeURIComponent(
            `/book/${bookId}/${currentChapter}?slide=${currentIndex}`,
          );
          router.push(`/spiritual-gems?ref=${ref}&returnTo=${returnTo}`);
        }}
        className="flex flex-col items-center gap-1 pointer-events-auto"
      >
        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white">
          <MessageCircle size={28} />
        </div>
        <span className="text-[10px] font-bold">Reply</span>
      </button>
    </div>
  );
}
