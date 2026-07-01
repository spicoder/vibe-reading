import { useEffect, useState } from "react";
import { useMultiplayer } from "@/app/lib/MultiplayerContext";
import FlyingStars from "./completion/FlyingStars";
import CompletionStars from "./completion/CompletionStars";
import CompletionMessage from "./completion/CompletionMessage";
import CompletionNav from "./completion/CompletionNav";

interface StoryCompletionProps {
  isStoryComplete: boolean;
  showGrid: boolean;
  currentChapter: number;
  bookId: string;
  bookTitle: string;
  nextChapterId?: string | null;
  hasMetTimeRequirement: boolean;
  hasEngaged: boolean;
}

export function StoryCompletion({
  isStoryComplete,
  showGrid,
  currentChapter,
  bookId,
  bookTitle,
  nextChapterId,
  hasMetTimeRequirement,
  hasEngaged,
}: StoryCompletionProps) {
  const { currentUser, awardChapterStars } = useMultiplayer();
  const [showFlyingStars, setShowFlyingStars] = useState(false);

  // Check if user met engagement requirements
  const metRequirements = hasMetTimeRequirement && hasEngaged;

  // Calculate stars based on engagement
  const favPrefix = `${bookId}-chapter-${currentChapter}-`;
  const hasFavorites =
    currentUser?.favorites?.some((id: string) => id.startsWith(favPrefix)) ||
    false;

  const gemPrefix = `${bookTitle} ${currentChapter}:`;
  const hasGems =
    Object.keys(currentUser?.gems || {}).some((key: string) =>
      key.startsWith(gemPrefix),
    ) || false;

  // Updated star calculation:
  // - 0 stars if didn't meet time/engagement requirements
  // - 3 stars for gems (if met requirements)
  // - 2 for favs (if met requirements)
  // - 1 for just completing (if met requirements)
  let starsEarned = 0;
  if (metRequirements) {
    if (hasGems) {
      starsEarned = 3;
    } else if (hasFavorites) {
      starsEarned = 2;
    } else {
      starsEarned = 1;
    }
  }

  // Calculate delta stars (new - previously awarded)
  const uniqueChapterId = `${bookId}-${currentChapter}`;
  const chapterStarsMap = currentUser?.chapterStars || {};
  const rewarded = currentUser?.rewardedChapters || [];
  const previousStars =
    chapterStarsMap[uniqueChapterId] ??
    (rewarded.includes(uniqueChapterId) ? 1 : 0);
  const deltaStars = starsEarned - previousStars;

  // Auto-award stars when the story completes
  useEffect(() => {
    if (isStoryComplete && !showGrid && currentUser) {
      if (deltaStars > 0) {
        setShowFlyingStars(true); // Trigger the CSS animation

        // Wait 1 second (while stars are flying) before updating the database/wallet balance
        const timer = setTimeout(() => {
          awardChapterStars(uniqueChapterId, starsEarned);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [
    isStoryComplete,
    showGrid,
    currentUser?.id,
    uniqueChapterId,
    starsEarned,
    deltaStars,
    awardChapterStars,
  ]);

  if (!isStoryComplete || showGrid) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-2xl z-50 animate-in fade-in duration-500">
      {/* 1. Render the flying stars based on how many NEW stars they earned */}
      {showFlyingStars && <FlyingStars count={deltaStars} />}

      <div className="text-center p-8">
        <h2 className="text-4xl font-serif font-bold mb-8">
          {!nextChapterId ? "Book Complete! 🏆" : "Chapter Complete! 🎉"}
        </h2>

        {/* 2. Extracted Star Rating Display */}
        <CompletionStars starsEarned={starsEarned} />

        {/* 3. Extracted Dynamic Praise Message */}
        <div className="mb-10 max-w-sm mx-auto h-16 flex items-center justify-center">
          <CompletionMessage
            starsEarned={starsEarned}
            nextChapterId={nextChapterId}
          />
        </div>

        {/* 4. Extracted Navigation Buttons */}
        <CompletionNav
          bookId={bookId}
          currentChapter={currentChapter}
          nextChapterId={nextChapterId}
        />
      </div>
    </div>
  );
}
