"use client";

import confetti from "canvas-confetti";
import {
  useState,
  useCallback,
  useEffect,
  useRef,
  Suspense,
  useMemo,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ChapterData,
  Verse,
  StoryItem,
  StoryViewerProps,
  SpeakerTheme,
} from "@/app/types";
import { speakerThemes } from "../../lib/speakerThemes";
import { useMultiplayer } from "@/app/lib/MultiplayerContext";
import { StoryProgress } from "./StoryProgress";
import { StoryHeader } from "./StoryHeader";
import { StoryInteractions } from "./StoryInteractions";
import { StorySlide } from "./StorySlide";
import { StoryGrid } from "./StoryGrid";
import { StoryCompletion } from "./StoryCompletion";

const getSpeakerTheme = (speakerName: string): SpeakerTheme => {
  return speakerThemes[speakerName] || speakerThemes.default;
};

const getStoryItems = (chapter: ChapterData, bookId: string): StoryItem[] => {
  const items: StoryItem[] = [];
  const sortedVisuals = [...chapter.visuals].sort(
    (a, b) => a.startVerse - b.startVerse,
  );
  const sortedVerses = [...chapter.verses].sort((a, b) => a.verse - b.verse);

  let currentGroup: Verse[] = [];
  const addedVisuals = new Set<number>();
  const chapterNumber = chapter.chapter;

  const flushGroup = () => {
    if (currentGroup.length === 0) return;

    const firstVerse = currentGroup[0];
    const lastVerse = currentGroup[currentGroup.length - 1];

    const segmentIndex = sortedVisuals.findLastIndex(
      (v) => v.startVerse <= firstVerse.verse,
    );
    const visual = sortedVisuals[segmentIndex];

    if (
      visual &&
      firstVerse.verse === visual.startVerse &&
      !addedVisuals.has(visual.startVerse)
    ) {
      items.push({
        type: "visual",
        data: visual,
        id: `${bookId}-chapter-${chapterNumber}-visual-${firstVerse.verse}`,
        segmentIndex: Math.max(0, segmentIndex),
      });
      addedVisuals.add(visual.startVerse);
    }

    const isGrouped = currentGroup.length > 1;
    const verseDisplay = isGrouped
      ? `${firstVerse.verse}-${lastVerse.verse}`
      : `${firstVerse.verse}`;

    const combinedText = currentGroup.map((v) => v.text).join(" ");
    const speaker = firstVerse.speaker;
    const uniqueVerseId = `${bookId}-chapter-${chapterNumber}-verse-${firstVerse.verse}-${items.length}`;

    items.push({
      type: "verse",
      data: {
        verses: currentGroup,
        speaker,
        text: combinedText,
        verseDisplay,
      },
      id: uniqueVerseId,
      segmentIndex: Math.max(0, segmentIndex),
    });

    currentGroup = [];
  };

  for (let i = 0; i < sortedVerses.length; i++) {
    const verse = sortedVerses[i];
    if (currentGroup.length === 0) {
      currentGroup.push(verse);
    } else {
      const prevVerse = currentGroup[currentGroup.length - 1];
      if (verse.groupId && prevVerse.groupId === verse.groupId) {
        currentGroup.push(verse);
      } else {
        flushGroup();
        currentGroup.push(verse);
      }
    }
  }

  flushGroup();
  return items;
};

// Placeholder path — replace with the actual audio file when ready
const CHAPTER_COMPLETE_SOUND = "/assets/audio/chapter-complete.mp3";
const WORDS_PER_MINUTE = 360;
const MIN_READING_SECONDS = 12;

// Calculate total word count from all verses
const calculateWordCount = (chapter: ChapterData): number => {
  return chapter.verses.reduce((total, verse) => {
    const wordCount = verse.text
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    return total + wordCount;
  }, 0);
};

function StoryViewerContent({
  bookId,
  bookTitle,
  chapter,
  nextChapterId,
  bookUrl,
}: StoryViewerProps) {
  const currentChapter = chapter.chapter;
  const slides = useMemo(
    () => getStoryItems(chapter, bookId),
    [chapter, bookId],
  );
  const totalSegments = chapter.visuals.length;

  // Calculate reading time requirement (in seconds)
  const totalWordCount = useMemo(() => calculateWordCount(chapter), [chapter]);
  const readingTimeRequired = useMemo(
    () =>
      Math.max(
        MIN_READING_SECONDS,
        Math.ceil((totalWordCount / WORDS_PER_MINUTE) * 60),
      ),
    [totalWordCount],
  );

  const searchParams = useSearchParams();
  const requestedSlide = parseInt(searchParams.get("slide") || "0", 10);
  const initialSlide = Number.isFinite(requestedSlide)
    ? Math.min(Math.max(requestedSlide, 0), Math.max(slides.length - 1, 0))
    : 0;

  const [currentIndex, setCurrentIndex] = useState(initialSlide);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [progress, setProgress] = useState(0);

  // NEW: Introduce an explicit completion state instead of relying on isLastSlide
  const [isStoryComplete, setIsStoryComplete] = useState(false);
  const [isJustCompleted, setIsJustCompleted] = useState(false);

  // Anti-spam tracking
  const [timeSpentOnChapter, setTimeSpentOnChapter] = useState(0);
  const [hasEngaged, setHasEngaged] = useState(false);
  const [hasMetTimeRequirement, setHasMetTimeRequirement] = useState(false);
  const lastTimeRef = useRef<number>(Date.now());

  const { isFavorite, toggleFavorite, markAsCompleted, currentUser } =
    useMultiplayer();

  // Check if chapter was previously completed
  const uniqueChapterId = `${bookId}-${currentChapter}`;
  const isChapterPreviouslyCompleted =
    currentUser?.rewardedChapters?.includes(uniqueChapterId) ||
    Object.keys(currentUser?.chapterStars || {}).includes(uniqueChapterId);

  // Reset engagement metrics when chapter changes
  useEffect(() => {
    setTimeSpentOnChapter(0);
    setHasEngaged(false);
    setCurrentIndex(initialSlide);
    setIsJustCompleted(false); // Reset just completed flag

    // If chapter was previously completed, don't require timer
    if (isChapterPreviouslyCompleted) {
      setHasMetTimeRequirement(true);
      setIsStoryComplete(true);
    } else {
      setHasMetTimeRequirement(false);
      setIsStoryComplete(false);
    }

    lastTimeRef.current = Date.now();
  }, [chapter.chapter, initialSlide]); // Reset only when chapter number or target slide changes

  useEffect(() => {
    if (isJustCompleted) {
      // Play chapter completion sound only when just completed this session
      const audio = new Audio(CHAPTER_COMPLETE_SOUND);
      audio.volume = 0.7;
      audio.play().catch(() => {
        // Browser may block autoplay if there was no prior user interaction
      });
      markAsCompleted(`${bookId}-${currentChapter}`);

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#F59E0B", "#FDE68A", "#FFFFFF"],
      });
    }
  }, [isJustCompleted, currentChapter, bookId, markAsCompleted]);

  // Track time spent on chapter (excluding paused time)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        const now = Date.now();
        const elapsed = (now - lastTimeRef.current) / 1000;
        setTimeSpentOnChapter((prev) => prev + elapsed);

        // Check if time requirement met
        if (timeSpentOnChapter + elapsed >= readingTimeRequired) {
          setHasMetTimeRequirement(true);
        }
      }
      lastTimeRef.current = Date.now();
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, readingTimeRequired, timeSpentOnChapter]);

  const currentSlide = slides[currentIndex];
  const currentSegmentIndex = currentSlide.segmentIndex;
  const segmentSlides = slides.filter(
    (s) => s.segmentIndex === currentSegmentIndex,
  );
  const indexInSegment = segmentSlides.indexOf(currentSlide);

  // Track engagement - mark as engaged when verse is displayed
  useEffect(() => {
    const isVerse = currentSlide.type === "verse";

    if (isVerse && !hasEngaged) {
      // Mark as engaged immediately when verse slide is shown
      setHasEngaged(true);
    }
  }, [currentIndex, currentSlide, hasEngaged]);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      // Allow free navigation between slides within the chapter
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Only on the final slide - check timer before completing chapter
      if (!hasMetTimeRequirement) {
        return; // Don't complete chapter if time requirement not met
      }
      setIsStoryComplete(true);
      setIsJustCompleted(true); // Mark as just completed this session
    }
  }, [currentIndex, slides.length, hasMetTimeRequirement]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      setIsJustCompleted(false); // Hide completion overlay if going back
    }
  }, [currentIndex]);

  const handleSelectSlide = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
    setShowGrid(false);
    setIsJustCompleted(false);
  };

  // Navigate to the first slide of the next segment (outline)
  const handleNextSegment = useCallback(() => {
    const nextSegIdx = slides.findIndex(
      (s, i) => i > currentIndex && s.segmentIndex > currentSlide.segmentIndex,
    );
    if (nextSegIdx !== -1) {
      setDirection(1);
      setCurrentIndex(nextSegIdx);
      setProgress(0);
    } else {
      // Already on last segment — trigger completion only if requirements are met
      if (!hasMetTimeRequirement && !isChapterPreviouslyCompleted) {
        return;
      }
      setIsStoryComplete(true);
      if (!isChapterPreviouslyCompleted) {
        setIsJustCompleted(true);
      }
    }
  }, [
    currentIndex,
    currentSlide.segmentIndex,
    slides,
    hasMetTimeRequirement,
    isChapterPreviouslyCompleted,
  ]);

  // Navigate to the first slide of the previous segment (outline)
  const handlePrevSegment = useCallback(() => {
    const targetSegIndex = currentSlide.segmentIndex - 1;
    if (targetSegIndex >= 0) {
      const prevSegIdx = slides.findIndex(
        (s) => s.segmentIndex === targetSegIndex,
      );
      if (prevSegIdx !== -1) {
        setDirection(-1);
        setCurrentIndex(prevSegIdx);
        setProgress(0);
        setIsJustCompleted(false);
      }
    }
  }, [currentSlide.segmentIndex, slides]);

  // Swipe gesture tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const swipeHandledRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showGrid || isJustCompleted) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " ") setIsPaused((p) => !p);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, showGrid, isJustCompleted]);

  const verseData = currentSlide.type === "verse" ? currentSlide.data : null;
  const currentTheme = verseData
    ? getSpeakerTheme(verseData.speaker)
    : getSpeakerTheme("default");

  // Calculate remaining time for timer display
  const remainingTime = Math.max(0, readingTimeRequired - timeSpentOnChapter);

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none touch-none">
      <StoryProgress
        segmentSlides={segmentSlides}
        indexInSegment={indexInSegment}
        progress={progress}
        totalSegments={totalSegments}
        currentSegmentIndex={currentSegmentIndex}
      />

      <StoryHeader
        isPaused={isPaused}
        showGrid={showGrid}
        verseData={verseData}
        currentTheme={currentTheme}
        currentSegmentIndex={currentSegmentIndex}
        totalSegments={totalSegments}
        bookUrl={bookUrl}
        onShowGrid={() => setShowGrid(true)}
        isStoryComplete={isStoryComplete}
        isCompletionOverlayActive={isJustCompleted}
        hasMetTimeRequirement={hasMetTimeRequirement}
        remainingTime={remainingTime}
      />

      <StoryInteractions
        isPaused={isPaused}
        showGrid={showGrid}
        verseData={verseData}
        currentSlide={currentSlide}
        currentIndex={currentIndex}
        bookTitle={bookTitle}
        bookId={bookId}
        currentChapter={currentChapter}
        isFavorite={isFavorite}
        toggleFavorite={toggleFavorite}
        isCompletionOverlayActive={isJustCompleted}
      />

      {/* TAP & HOLD ZONES */}
      <div
        className={`absolute inset-0 z-30 flex ${showGrid || isJustCompleted ? "hidden" : ""}`}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={(e) => {
          setIsPaused(true);
          const touch = e.touches[0];
          touchStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
          };
          swipeHandledRef.current = false;
        }}
        onTouchEnd={(e) => {
          setIsPaused(false);
          if (swipeHandledRef.current) {
            // Swipe was already handled — prevent tap from firing
            e.preventDefault();
          }
          touchStartRef.current = null;
        }}
        onTouchMove={(e) => {
          if (!touchStartRef.current || swipeHandledRef.current) return;
          const touch = e.touches[0];
          const dx = touch.clientX - touchStartRef.current.x;
          const dy = touch.clientY - touchStartRef.current.y;
          const SWIPE_THRESHOLD = 50;
          // Only count horizontal swipes (ignore vertical scrolls)
          if (
            Math.abs(dx) > SWIPE_THRESHOLD &&
            Math.abs(dx) > Math.abs(dy) * 1.5
          ) {
            swipeHandledRef.current = true;
            if (dx < 0) {
              handleNextSegment();
            } else {
              handlePrevSegment();
            }
          }
        }}
      >
        <div
          className="w-[30%] h-full"
          onClick={(e) => {
            if (swipeHandledRef.current) return;
            e.stopPropagation();
            handlePrev();
          }}
        />
        <div
          className="w-[70%] h-full"
          onClick={(e) => {
            if (swipeHandledRef.current) return;
            e.stopPropagation();
            handleNext();
          }}
        />
      </div>

      <StorySlide
        currentSlide={currentSlide}
        direction={direction}
        currentTheme={currentTheme}
        currentChapter={currentChapter}
        bookTitle={bookTitle}
      />

      <StoryGrid
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        currentChapter={currentChapter}
        slides={slides}
        currentIndex={currentIndex}
        onSelectSlide={handleSelectSlide}
      />

      <StoryCompletion
        isStoryComplete={isJustCompleted} // Show modal only if just completed this session
        showGrid={showGrid}
        currentChapter={currentChapter}
        bookId={bookId}
        bookTitle={bookTitle} // Passed down for correct Gems lookup
        nextChapterId={nextChapterId}
        hasMetTimeRequirement={hasMetTimeRequirement}
        hasEngaged={hasEngaged}
      />
    </div>
  );
}

export default function StoryViewer(props: StoryViewerProps) {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <StoryViewerContent {...props} />
    </Suspense>
  );
}
