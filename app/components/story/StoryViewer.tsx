"use client";

import confetti from "canvas-confetti";
import { useState, useCallback, useEffect, useRef, Suspense, useMemo } from "react";
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

function StoryViewerContent({
  bookId,
  bookTitle,
  chapter,
  nextChapterId,
  bookUrl,
}: StoryViewerProps) {
  const currentChapter = chapter.chapter;
  const slides = useMemo(() => getStoryItems(chapter, bookId), [chapter, bookId]);
  const totalSegments = chapter.visuals.length;

  const searchParams = useSearchParams();
  const initialSlide = parseInt(searchParams.get("slide") || "0");

  const [currentIndex, setCurrentIndex] = useState(initialSlide);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [progress, setProgress] = useState(0);

  // NEW: Introduce an explicit completion state instead of relying on isLastSlide
  const [isStoryComplete, setIsStoryComplete] = useState(false);

  const { isFavorite, toggleFavorite, markAsCompleted } = useMultiplayer();

  const currentSlide = slides[currentIndex];
  const currentSegmentIndex = currentSlide.segmentIndex;
  const segmentSlides = slides.filter(
    (s) => s.segmentIndex === currentSegmentIndex,
  );
  const indexInSegment = segmentSlides.indexOf(currentSlide);

  useEffect(() => {
    if (isStoryComplete) {
      // Play chapter completion sound
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
  }, [isStoryComplete, currentChapter, bookId, markAsCompleted]);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Trigger completion only when moving past the final slide
      setIsStoryComplete(true);
    }
  }, [currentIndex, slides.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      setIsStoryComplete(false); // Make sure to hide completion if going back
    }
  }, [currentIndex]);

  const handleSelectSlide = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
    setShowGrid(false);
    setIsStoryComplete(false);
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
      // Already on last segment — trigger completion
      setIsStoryComplete(true);
    }
  }, [currentIndex, currentSlide.segmentIndex, slides]);

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
        setIsStoryComplete(false);
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
      if (showGrid || isStoryComplete) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " ") setIsPaused((p) => !p);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, showGrid, isStoryComplete]);

  const verseData = currentSlide.type === "verse" ? currentSlide.data : null;
  const currentTheme = verseData
    ? getSpeakerTheme(verseData.speaker)
    : getSpeakerTheme("default");

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
      />

      {/* TAP & HOLD ZONES */}
      <div
        className={`absolute inset-0 z-30 flex ${showGrid ? "hidden" : ""}`}
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
        isStoryComplete={isStoryComplete} // Updated Prop
        showGrid={showGrid}
        currentChapter={currentChapter}
        bookId={bookId}
        bookTitle={bookTitle} // Passed down for correct Gems lookup
        nextChapterId={nextChapterId}
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
