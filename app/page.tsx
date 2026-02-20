// app/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles, Play, Heart, Bookmark, CheckCircle2 } from "lucide-react";
import { isaiahChapters } from "@/app/lib/data";
import { ChapterData } from "./types";
import { useProgress } from "@/app/lib/hooks";

export default function Home() {
  const chapters = Object.entries(isaiahChapters);
  const { completedChapters, isLoaded } = useProgress();

  // --- Carousel Grouping Logic ---
  // Split the chapters into chunks of 10
  const CHAPTERS_PER_ROW = 10;
  const chunkedChapters: [string, ChapterData][][] = [];

  for (let i = 0; i < chapters.length; i += CHAPTERS_PER_ROW) {
    chunkedChapters.push(chapters.slice(i, i + CHAPTERS_PER_ROW));
  }
  // -------------------------

  const nextChapterId =
    chapters.find(([id]) => !completedChapters.includes(id))?.[0] || "1";

  const nextChapter = isaiahChapters[nextChapterId];

  return (
    <main className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Top Bar */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <h1 className="text-2xl font-black font-serif text-stone-900 tracking-tight">
          ISAIAH
        </h1>
        <div className="flex gap-4">
          <Link
            href="/favorites"
            className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-amber-100 hover:text-amber-600 transition-colors"
          >
            <Heart size={20} />
          </Link>
          <Link
            href="/spiritual-gems"
            className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-amber-100 hover:text-amber-600 transition-colors"
          >
            <Bookmark size={20} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 mb-12">
        <div className="bg-stone-900 rounded-4xl p-8 text-white relative overflow-hidden min-h-[350px] flex flex-col justify-end shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>

          {nextChapter?.visuals[0] && (
            <div className="absolute inset-0 z-0">
              {nextChapter.visuals[0].imageSrc &&
              nextChapter.visuals[0].imageSrc.trim() !== "" ? (
                <Image
                  src={nextChapter.visuals[0].imageSrc}
                  alt="Background"
                  fill
                  className="object-cover opacity-40"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent"></div>
            </div>
          )}

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/10">
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {isLoaded && completedChapters.includes(nextChapterId)
                  ? "Review Chapter"
                  : "Next Reading"}
              </span>
            </div>

            <h2 className="text-4xl font-serif font-bold mb-4">
              Chapter {nextChapter.chapter}
            </h2>

            <div className="flex flex-col gap-2 mb-8 max-w-md">
              {nextChapter?.visuals.map((visual, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="w-1 h-1 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <p className="text-stone-300 text-sm leading-tight font-medium">
                    {visual.title}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href={`/isaiah/${nextChapterId}`}
              className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs inline-flex items-center gap-2 hover:scale-105 transition-transform w-fit"
            >
              <Play size={14} fill="currentColor" />
              {isLoaded && completedChapters.includes(nextChapterId)
                ? "Continue Reading"
                : "Start Reading"}
            </Link>
          </div>
        </div>
      </section>

      {/* Chapters Feed as Carousels */}
      <section className="space-y-12 ml-4">
        {chunkedChapters.map((chunk, index) => (
          <div key={index} className="flex flex-col gap-4">
            <div className="px-6 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">
                Chapters {index * 10 + 1} —{" "}
                {Math.min((index + 1) * 10, chapters.length)}
              </h3>
            </div>

            {/* Horizontal Scroll Container (Carousel) */}
            <div className="flex overflow-x-auto gap-4 px-6 pb-4 snap-x snap-mandatory no-scrollbar">
              {chunk.map(([id, chapter]) => {
                const isDone = completedChapters.includes(id);
                const thumbnail = chapter.visuals[0]?.imageSrc;

                return (
                  <Link
                    key={id}
                    href={`/isaiah/${id}`}
                    className="group flex-none w-[160px] md:w-[200px] snap-start"
                  >
                    <div className="aspect-3/4 bg-stone-800 rounded-3xl border-2 border-stone-100 relative overflow-hidden transition-all duration-300 hover:border-amber-400 hover:shadow-lg">
                      {thumbnail && (
                        <div className="absolute inset-0 z-0">
                          <Image
                            src={thumbnail}
                            alt={`Chapter ${chapter.chapter}`}
                            fill
                            className="object-cover opacity-70 group-hover:opacity-60 transition-opacity"
                          />
                        </div>
                      )}

                      <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                        <div className="flex justify-end">
                          {isDone && (
                            <CheckCircle2
                              size={24}
                              strokeWidth={3}
                              className="text-green-500 drop-shadow-md"
                            />
                          )}
                        </div>
                        <h4 className="font-serif text-lg font-bold text-white leading-tight group-hover:text-amber-400 transition-colors drop-shadow-lg">
                          Chapter {chapter.chapter}
                        </h4>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {/* Spacer for the end of the scroll */}
              <div className="flex-none w-2" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
