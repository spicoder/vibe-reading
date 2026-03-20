import Link from "next/link";
import { Star } from "lucide-react";
import { useEffect, useState } from "react"; // <-- NEW: Import useEffect
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
  // NEW: Destructure awardChapterStars
  const { currentUser, awardChapterStars } = useMultiplayer();
  const [showFlyingStars, setShowFlyingStars] = useState(false);

  // Calculate stars based on engagement (moved outside return)
  const favPrefix = `chapter-${currentChapter}-`;
  const hasFavorites =
    currentUser?.favorites?.some((id: string) => id.startsWith(favPrefix)) ||
    false;

  const gemPrefix = `${bookTitle} ${currentChapter}:`;
  const hasGems =
    Object.keys(currentUser?.gems || {}).some((key: string) =>
      key.startsWith(gemPrefix),
    ) || false;

  let starsEarned = 1;
  if (hasFavorites) starsEarned++;
  if (hasGems) starsEarned++;

  // NEW: Auto-award stars when the story completes
  useEffect(() => {
    if (isStoryComplete && !showGrid && currentUser) {
      const uniqueChapterId = `${bookId}-${currentChapter}`;

      // Check if they haven't been rewarded yet
      const rewarded = currentUser.rewardedChapters || [];
      if (!rewarded.includes(uniqueChapterId)) {
        setShowFlyingStars(true); // Trigger the CSS animation

        // Wait 1 second (while stars are flying) before updating the database/wallet balance
        setTimeout(() => {
          awardChapterStars(uniqueChapterId, starsEarned);
        }, 1000);
      }
    }
  }, [isStoryComplete, showGrid, currentUser?.id]);

  if (!isStoryComplete || showGrid) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-2xl z-50 animate-in fade-in duration-500">
      {/* NEW: Render the flying stars based on how many they earned */}
      {showFlyingStars && (
        <>
          {Array.from({ length: starsEarned }).map((_, i) => (
            <Star
              key={`fly-${i}`}
              className="fly-star fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]"
              style={{ animationDelay: `${i * 500}ms` }} // Stagger them slightly
              size={56}
            />
          ))}
        </>
      )}
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
                star <= starsEarned ? "scale-110" : "scale-100 opacity-50"
              }`}
              style={{ transitionDelay: `${star * 150}ms` }}
            >
              <Star
                size={56}
                className={`${
                  star <= starsEarned
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
              {starsEarned === 3 && (
                <p className="text-amber-400 font-bold text-lg animate-in slide-in-from-bottom-2 fade-in duration-500 delay-500">
                  Outstanding! You earned 3 Stars! 🌟
                </p>
              )}
              {starsEarned === 2 && (
                <p className="text-amber-200 text-md animate-in slide-in-from-bottom-2 fade-in duration-500 delay-300">
                  You earned 2 Stars! Add gems (notes) to earn 3 next time! ✨
                </p>
              )}
              {starsEarned === 1 && (
                <p className="text-stone-400 text-md animate-in slide-in-from-bottom-2 fade-in duration-500 delay-150">
                  You earned 1 Star! Save favorites or add gems to earn more! ⭐
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
