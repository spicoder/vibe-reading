"use client";

import { useState, useCallback, useEffect, Suspense, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Map, Heart, MessageCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChapterData,
  Verse,
  StoryItem,
  StoryViewerProps,
  SpeakerTheme,
} from "@/app/types";
import { speakerThemes } from "../lib/speakerThemes";
import { useFavorites, useProgress } from "@/app/lib/hooks";
import Link from "next/link";
import Image from "next/image";

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

  // Create a Set to track which visuals have already been added
  const addedVisuals = new Set<number>();

  const flushGroup = () => {
    if (currentGroup.length === 0) return;

    const firstVerse = currentGroup[0];
    const lastVerse = currentGroup[currentGroup.length - 1];

    // Find the current segment based on the first verse of the thought
    const segmentIndex = sortedVisuals.findLastIndex(
      (v) => v.startVerse <= firstVerse.verse,
    );
    const visual = sortedVisuals[segmentIndex];

    // Add visual if it exactly matches the start of this verse group AND hasn't been added yet
    if (
      visual &&
      firstVerse.verse === visual.startVerse &&
      !addedVisuals.has(visual.startVerse)
    ) {
      items.push({
        type: "visual",
        data: visual,
        id: `visual-${firstVerse.verse}`,
        segmentIndex: Math.max(0, segmentIndex),
      });
      // Mark this visual as added
      addedVisuals.add(visual.startVerse);
    }

    // Format display string
    const isGrouped = currentGroup.length > 1;
    const verseDisplay = isGrouped
      ? `${firstVerse.verse}-${lastVerse.verse}`
      : `${firstVerse.verse}`;

    // Combine texts
    const combinedText = currentGroup.map((v) => v.text).join(" ");
    const speaker = firstVerse.speaker; // Take the speaker from the first verse

    // Create a unique ID to prevent React duplicate key errors when a verse is split
    const uniqueVerseId = `verse-${firstVerse.verse}-${items.length}`;

    items.push({
      type: "verse",
      data: {
        verses: currentGroup,
        speaker,
        text: combinedText,
        verseDisplay,
      },
      id: uniqueVerseId, // Use the unique ID here
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
      // If the verse has a groupId and it matches the previous verse, add it to the group
      if (verse.groupId && prevVerse.groupId === verse.groupId) {
        currentGroup.push(verse);
      } else {
        // Otherwise, flush the current group and start a new one
        flushGroup();
        currentGroup.push(verse);
      }
    }
  }

  // Flush any remaining verses
  flushGroup();

  return items;
};

function StoryViewerContent({
  chapter,
  nextChapterId,
}: {
  chapter: ChapterData;
  nextChapterId: string | null;
}) {
  const currentChapter = chapter.chapter;
  const slides = useMemo(() => getStoryItems(chapter), [chapter]);
  const totalSegments = chapter.visuals.length;

  const searchParams = useSearchParams();
  const initialSlide = parseInt(searchParams.get("slide") || "0");

  const [currentIndex, setCurrentIndex] = useState(initialSlide);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0); // Manual progress state (0-100)

  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { markAsCompleted } = useProgress();

  const currentSlide = slides[currentIndex];
  const isLastSlide = currentIndex === slides.length - 1;

  const currentSegmentIndex = currentSlide.segmentIndex;
  const segmentSlides = slides.filter(
    (s) => s.segmentIndex === currentSegmentIndex,
  );
  const indexInSegment = segmentSlides.indexOf(currentSlide);

  // --- Navigation Logic ---
  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setProgress(0); // Reset timer for new slide
    }
  }, [currentIndex, slides.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setProgress(0); // Reset timer for new slide
    }
  }, [currentIndex]);

  // --- Timer / Progress Logic (Facebook Style) ---
  useEffect(() => {
    if (isPaused || isLastSlide) return;

    const SLIDE_DURATION = 15000; // 15 seconds per slide
    const INTERVAL_MS = 50; // Update every 50ms
    const INCREMENT = (INTERVAL_MS / SLIDE_DURATION) * 100;

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
  }, [isPaused, handleNext, isLastSlide]);

  useEffect(() => {
    if (isLastSlide) {
      markAsCompleted(String(currentChapter));
    }
  }, [isLastSlide, currentChapter, markAsCompleted]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " ") setIsPaused((p) => !p);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  const variants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "circOut" },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: { duration: 0.4, ease: "circIn" },
    }),
  };

  const isVerse = currentSlide.type === "verse";
  const verseData = currentSlide.type === "verse" ? currentSlide.data : null;
  const visualData = currentSlide.type === "visual" ? currentSlide.data : null;
  const currentTheme = verseData
    ? getSpeakerTheme(verseData.speaker)
    : getSpeakerTheme("default");

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none touch-none">
      {/* 1. SEGMENTED PROGRESS BARS */}
      <div className="absolute top-2 left-2 right-2 z-50 flex flex-col gap-2">
        <div className="flex gap-1 h-1">
          {segmentSlides.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-full rounded-full bg-white/20 overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-[50ms] linear"
                style={{
                  width:
                    idx < indexInSegment
                      ? "100%"
                      : idx === indexInSegment
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-1.5">
          {Array.from({ length: totalSegments }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentSegmentIndex
                  ? "w-4 bg-amber-500"
                  : "w-1 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. HEADER */}
      <div
        className={`absolute top-10 left-4 right-4 z-40 flex justify-between items-start transition-opacity duration-300 ${
          isPaused ? "opacity-0" : "opacity-100"
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
        <Link
          href="/"
          className="p-2 bg-black/20 backdrop-blur-md rounded-full hover:bg-white/20"
        >
          <X size={24} />
        </Link>
      </div>

      {/* 3. INTERACTIONS (Hidden when paused) */}
      <div
        className={`absolute right-4 bottom-10 z-50 flex flex-col gap-6 items-center transition-opacity duration-300 ${
          isPaused ? "opacity-0" : "opacity-100"
        }`}
      >
        {verseData && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(currentSlide.id);
              }}
              className="flex flex-col items-center gap-1"
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
              <span className="text-[10px] font-bold">Save</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const ref = encodeURIComponent(
                  `Isaias ${currentChapter}:${verseData.verseDisplay}`,
                );
                const returnTo = encodeURIComponent(
                  `/Isaias/${currentChapter}?slide=${currentIndex}`,
                );
                router.push(`/spiritual-gems?ref=${ref}&returnTo=${returnTo}`);
              }}
              className="flex flex-col items-center gap-1"
            >
              <div className="p-3 rounded-full bg-black/40 backdrop-blur-md text-white">
                <MessageCircle size={28} />
              </div>
              <span className="text-[10px] font-bold">Reply</span>
            </button>
          </>
        )}
      </div>

      {/* 4. TAP & HOLD ZONES (Facebook/Instagram Style) */}
      <div
        className="absolute inset-0 z-30 flex"
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

      {/* 5. MAIN CONTENT */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentSlide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 flex flex-col justify-center items-center"
        >
          {visualData ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center relative bg-black">
              <div className="absolute inset-0">
                {visualData.imageSrc && visualData.imageSrc.trim() !== "" ? (
                  <Image
                    src={visualData.imageSrc}
                    alt={visualData.alt || ""}
                    fill
                    className="object-contain transition-transform duration-700"
                    priority
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60"></div>
              </div>
              <motion.div className="relative z-10 p-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 shadow-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                    {visualData.description}
                  </span>
                </div>
                <h2 className="text-4xl md:text-7xl font-black font-serif text-white mb-6 leading-tight tracking-tighter drop-shadow-2xl">
                  {visualData.title}
                </h2>
              </motion.div>
            </div>
          ) : verseData ? (
            <div
              className={`w-full h-full flex flex-col relative justify-center transition-colors duration-700 ${currentTheme.container}`}
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:16px_16px]"></div>
              <div className="relative z-10 max-w-xl mx-auto w-full px-8">
                <p
                  className={`font-serif leading-relaxed mb-6 transition-transform duration-300 ${currentTheme.text}`}
                >
                  {verseData.text}
                </p>
              </div>
              <div className="absolute bottom-12 left-8 z-20">
                <p className="font-bold uppercase tracking-widest text-amber-500/80 text-xs">
                  Isaias {currentChapter}:{verseData.verseDisplay}
                </p>
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Finish Overlay */}
      {isLastSlide && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-2xl z-50">
          <div className="text-center p-8">
            <h2 className="text-4xl font-serif font-bold mb-2">
              Chapter Complete
            </h2>
            <p className="text-stone-400 mb-8 max-w-xs mx-auto">
              You've finished reading Chapter {currentChapter}.
            </p>
            <div className="flex flex-col gap-4 items-center">
              {nextChapterId && (
                <Link
                  href={`/isaiah/${nextChapterId}`}
                  className="bg-amber-500 text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest"
                >
                  Next Chapter
                </Link>
              )}
              <Link
                href="/"
                className="bg-white/10 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest"
              >
                Library
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoryViewer({
  chapter,
  nextChapterId,
}: StoryViewerProps) {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <StoryViewerContent chapter={chapter} nextChapterId={nextChapterId} />
    </Suspense>
  );
}
