"use client";

import confetti from "canvas-confetti";
import { useState, useCallback, useEffect, Suspense, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Map, Heart, MessageCircle, LayoutGrid } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChapterData,
  Verse,
  StoryItem,
  StoryViewerProps,
  SpeakerTheme,
} from "@/app/types";
import { speakerThemes } from "../lib/speakerThemes";
// 1. UPDATED IMPORT: Swapped useProgress for useMultiplayer
import { useMultiplayer } from "@/app/lib/MultiplayerContext";
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
  nextChapterUrl,
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

  const router = useRouter();
  const { isFavorite, toggleFavorite } = useMultiplayer();

  // 2. UPDATED HOOK: Using the Firebase multiplayer hook
  const { markAsCompleted } = useMultiplayer();

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
      // Fire confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#F59E0B", "#FDE68A", "#FFFFFF"],
      });
    }
  }, [isLastSlide, currentChapter, bookId, markAsCompleted]);

  // --- Navigation Logic ---
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

  // --- Timer / Progress Logic ---
  useEffect(() => {
    if (isPaused || isLastSlide || showGrid) return;

    const SLIDE_DURATION = 15000;
    const INTERVAL_MS = 50;
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
  }, [isPaused, handleNext, isLastSlide, showGrid]);

  // 3. UPDATED EFFECT: Triggers Firebase when you reach the last slide
  useEffect(() => {
    if (isLastSlide) {
      markAsCompleted(`${bookId}-${currentChapter}`);
    }
  }, [isLastSlide, currentChapter, bookId, markAsCompleted]);

  // Keyboard controls
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

  const verseData = currentSlide.type === "verse" ? currentSlide.data : null;
  const visualData = currentSlide.type === "visual" ? currentSlide.data : null;
  const currentTheme = verseData
    ? getSpeakerTheme(verseData.speaker)
    : getSpeakerTheme("default");

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none touch-none">
      {/* 1. SEGMENTED PROGRESS BARS */}
      <div className="absolute top-2 left-2 right-2 z-40 flex flex-col gap-2">
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
          {/* Toggle Grid View Button */}
          <button
            onClick={() => setShowGrid(true)}
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

      {/* 3. INTERACTIONS */}
      <div
        className={`absolute right-4 bottom-10 z-40 flex flex-col gap-6 items-center transition-opacity duration-300 ${
          isPaused || showGrid ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {verseData && (
          <>
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
          </>
        )}
      </div>

      {/* 4. TAP & HOLD ZONES */}
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

      {/* 6. GRID OVERLAY (Messenger Style) */}
      <AnimatePresence>
        {showGrid && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto overflow-x-hidden p-4 touch-auto select-auto"
          >
            <div className="flex justify-between items-center mb-6 sticky top-0 z-10 py-2 bg-black/40 backdrop-blur-sm -mx-4 px-4 rounded-b-xl">
              <h3 className="text-xl font-bold font-serif">
                Chapter {currentChapter}
              </h3>
              <button
                onClick={() => setShowGrid(false)}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-20">
              {slides.map((slide, idx) => {
                if (slide.type === "visual") {
                  const vData = slide.data;
                  return (
                    <div
                      key={slide.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setProgress(0);
                        setShowGrid(false);
                      }}
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                        currentIndex === idx
                          ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                          : "border-transparent hover:border-white/20"
                      }`}
                    >
                      <div className="w-full h-full bg-stone-900 relative">
                        {vData.imageSrc && vData.imageSrc.trim() !== "" && (
                          <Image
                            src={vData.imageSrc}
                            alt=""
                            fill
                            className="object-cover opacity-60"
                          />
                        )}
                        <div className="absolute inset-0 p-3 flex flex-col justify-center bg-gradient-to-t from-black via-black/40 to-transparent">
                          <span className="text-[10px] text-center font-bold text-amber-400 uppercase tracking-widest mb-1">
                            {vData.description}
                          </span>
                          <span className="text-sm text-center font-bold font-serif leading-tight">
                            {vData.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const vData = slide.data;
                  const theme = getSpeakerTheme(vData.speaker);
                  return (
                    <div
                      key={slide.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setProgress(0);
                        setShowGrid(false);
                      }}
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all flex flex-col p-4 ${theme.container} ${
                        currentIndex === idx
                          ? "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                          : "border-transparent hover:border-white/20"
                      }`}
                    >
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[length:16px_16px]"></div>
                      <div className="relative z-10 flex-1 flex flex-col">
                        <div className="mb-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${theme.badge}`}
                          >
                            {vData.speaker}
                          </span>
                        </div>
                        <p
                          className={`text-xs line-clamp-6 font-serif ${theme.text}`}
                        >
                          {vData.text}
                        </p>
                        <div className="mt-auto pt-2">
                          <span className="text-[10px] font-bold uppercase text-amber-500/80">
                            Verse {vData.verseDisplay}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish Overlay */}
      {isLastSlide && !showGrid && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-2xl z-50">
          <div className="text-center p-8">
            <h2 className="text-4xl font-serif font-bold mb-2">
              Chapter Complete! 🎉
            </h2>
            <p className="text-stone-400 mb-8 max-w-xs mx-auto">
              You've finished reading Chapter {currentChapter}.
            </p>
            <div className="flex flex-col gap-4 items-center">
              {nextChapterUrl && (
                <Link
                  href={nextChapterUrl}
                  className="bg-amber-500 text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest"
                >
                  Next Chapter
                </Link>
              )}
              <Link
                href="/"
                className="bg-white/10 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest"
              >
                Return to Library
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StoryViewer({
  bookId,
  bookTitle,
  chapter,
  nextChapterUrl,
  bookUrl,
}: StoryViewerProps) {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <StoryViewerContent
        bookId={bookId}
        bookTitle={bookTitle}
        bookUrl={bookUrl}
        chapter={chapter}
        nextChapterUrl={nextChapterUrl}
      />
    </Suspense>
  );
}
