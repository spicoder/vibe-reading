import Link from "next/link";
import { Star } from "lucide-react";
import { useMultiplayer } from "@/app/lib/MultiplayerContext";

interface StoryCompletionProps {
  isStoryComplete: boolean;
  showGrid: boolean;
  currentChapter: number;
  bookId: string;
  bookTitle: string;
  nextChapterId?: string | null;
}

export function StoryCompletion({
  isStoryComplete,
  showGrid,
  currentChapter,
  bookId,
  bookTitle,
  nextChapterId,
}: StoryCompletionProps) {
  const { currentUser } = useMultiplayer();

  if (!isStoryComplete || showGrid) return null;

  // Favorites use IDs like: `chapter-1-verse-12`
  const favPrefix = `chapter-${currentChapter}-`;
  const hasFavorites =
    currentUser?.favorites?.some((id: string) => id.startsWith(favPrefix)) ||
    false;

  // Gems use references like: `Isaiah 1:1-2`
  const gemPrefix = `${bookTitle} ${currentChapter}:`;
  const hasGems =
    Object.keys(currentUser?.gems || {}).some((key: string) =>
      key.startsWith(gemPrefix),
    ) || false;

  // Calculate stars based on engagement
  let stars = 1;
  if (hasFavorites) stars++;
  if (hasGems) stars++;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-2xl z-50 animate-in fade-in duration-500">
      <div className="text-center p-8">
        <h2 className="text-4xl font-serif font-bold mb-8">
          {!nextChapterId ? "Book Complete! 🏆" : "Chapter Complete! 🎉"}
        </h2>

        {/* Star Rating Display */}
        <div className="flex justify-center gap-4 mb-6">
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              className={`transform transition-all duration-700 ${
                star <= stars ? "scale-110" : "scale-100 opacity-50"
              }`}
              style={{ transitionDelay: `${star * 150}ms` }}
            >
              <Star
                size={56}
                className={`${
                  star <= stars
                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                    : "fill-stone-800 text-stone-700"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Dynamic Praise Message */}
        <div className="mb-10 max-w-sm mx-auto h-16 flex items-center justify-center">
          {!nextChapterId ? (
            <p className="text-amber-400 font-bold text-lg animate-in slide-in-from-bottom-2 fade-in duration-500 delay-150">
              Amazing! You have finished the entire book! 🏆✨
            </p>
          ) : (
            <>
              {stars === 3 && (
                <p className="text-amber-400 font-bold text-lg animate-in slide-in-from-bottom-2 fade-in duration-500 delay-500">
                  Outstanding! You're a true scholar! 🌟
                </p>
              )}
              {stars === 2 && (
                <p className="text-amber-200 text-md animate-in slide-in-from-bottom-2 fade-in duration-500 delay-300">
                  Great job! Add some spiritual gems (notes) to earn 3 stars! ✨
                </p>
              )}
              {stars === 1 && (
                <p className="text-stone-400 text-md animate-in slide-in-from-bottom-2 fade-in duration-500 delay-150">
                  Good start! Save some favorites or add gems to earn more
                  stars! ⭐
                </p>
              )}
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-4 items-center">
          {nextChapterId ? (
            <Link
              href={`/book/${bookId}?animateTo=${nextChapterId}&animateFrom=${currentChapter}`}
              className="bg-amber-500 text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-amber-400 transition transform hover:scale-105"
            >
              Next Chapter
            </Link>
          ) : (
            <Link
              href={`/book/${bookId}?animateTo=treasure&animateFrom=${currentChapter}`}
              className="bg-amber-500 text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-amber-400 transition transform hover:scale-105"
            >
              Claim Treasure
            </Link>
          )}
          <Link
            href={`/book/${bookId}`}
            className="bg-white/10 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/20 transition"
          >
            Return to Map
          </Link>
        </div>
      </div>
    </div>
  );
}
