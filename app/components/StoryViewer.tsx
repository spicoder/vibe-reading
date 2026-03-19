"use client";

import confetti from "canvas-confetti";
import { useState, useCallback, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChapterData,
  Verse,
  StoryItem,
  StoryViewerProps,
  SpeakerTheme,
} from "@/app/types";
import { speakerThemes } from "../lib/speakerThemes";
import { useMultiplayer } from "@/app/lib/MultiplayerContext";
import { StoryProgress } from "./story/StoryProgress";
import { StoryHeader } from "./story/StoryHeader";
import { StoryInteractions } from "./story/StoryInteractions";
import { StorySlide } from "./story/StorySlide";
import { StoryGrid } from "./story/StoryGrid";
import { StoryCompletion } from "./story/StoryCompletion";

const getSpeakerTheme = (speakerName: string): SpeakerTheme => {
  return speakerThemes[speakerName] || speakerThemes.default;
};

const getStoryItems = (chapter: ChapterData): StoryItem[] => {
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
        id: `chapter-${chapterNumber}-visual-${firstVerse.verse}`,
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

    const uniqueVerseId = `chapter-${chapterNumber}-verse-${firstVerse.verse}-${items.length}`;

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

function StoryViewerContent({
  bookId,
  bookTitle,
  chapter,
  nextChapterId,
  bookUrl,
}: StoryViewerProps) {
  const currentChapter = chapter.chapter;
  const slides = useMemo(() => getStoryItems(chapter), [chapter]);
  const totalSegments = chapter.visuals.length;

  const searchParams = useSearchParams();
  const initialSlide = parseInt(searchParams.get("slide") || "0");

  const [currentIndex, setCurrentIndex] = useState(initialSlide);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [progress, setProgress] = useState(0);

  const { isFavorite, toggleFavorite, markAsCompleted } = useMultiplayer();

  const currentSlide = slides[currentIndex];
  const isLastSlide = currentIndex === slides.length - 1;
  const currentSegmentIndex = currentSlide.segmentIndex;
  const segmentSlides = slides.filter(
    (s) => s.segmentIndex === currentSegmentIndex,
  );
  const indexInSegment = segmentSlides.indexOf(currentSlide);

  useEffect(() => {
    if (isLastSlide) {
      markAsCompleted(`${bookId}-${currentChapter}`);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#F59E0B", "#FDE68A", "#FFFFFF"],
      });
    }
  }, [isLastSlide, currentChapter, bookId, markAsCompleted]);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    }
  }, [currentIndex, slides.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  const handleSelectSlide = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
    setShowGrid(false);
  };

  useEffect(() => {
    if (isPaused || isLastSlide || showGrid) return;
    const INTERVAL_MS = 50;
    const INCREMENT = (INTERVAL_MS / 15000) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + INCREMENT;
      });
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused, handleNext, isLastSlide, showGrid]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showGrid) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " ") setIsPaused((p) => !p);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, showGrid]);

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
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          className="w-[30%] h-full"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
        />
        <div
          className="w-[70%] h-full"
          onClick={(e) => {
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
        isLastSlide={isLastSlide}
        showGrid={showGrid}
        currentChapter={currentChapter}
        bookId={bookId} // <-- Passed down
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
