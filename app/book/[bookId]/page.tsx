"use client";

import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Sparkles, Play, ChevronLeft, CheckCircle2 } from "lucide-react";
import { bibleBooks } from "@/app/lib/data";
import { useProgress } from "@/app/lib/hooks";

export default function BookPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const book = bibleBooks[bookId];

  if (!book) notFound();

  const chapters = Object.entries(book.chapters);
  const { completedChapters, isLoaded } = useProgress();

  // Split the chapters into chunks of 10
  const CHAPTERS_PER_ROW = 10;
  const chunkedChapters = [];
  for (let i = 0; i < chapters.length; i += CHAPTERS_PER_ROW) {
    chunkedChapters.push(chapters.slice(i, i + CHAPTERS_PER_ROW));
  }

  // Track progress using a combined bookId-chapterId format to avoid collisions
  const nextChapterId =
    chapters.find(
      ([id]) => !completedChapters.includes(`${bookId}-${id}`),
    )?.[0] || "1";
  const nextChapter = book.chapters[nextChapterId];

  // Helper boolean for button state
  const isChapterDone =
    isLoaded && completedChapters.includes(`${bookId}-${nextChapterId}`);

  return (
    <main className="min-h-screen bg-[#FDFBF7] pb-24">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <Link
          href="/"
          className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-stone-200"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black font-serif text-stone-900 tracking-tight uppercase">
          {book.title}
        </h1>
      </header>

      {/* Hero Section */}
      <section className="px-4 mb-12">
        <div className="bg-stone-900 rounded-4xl p-8 text-white relative overflow-hidden min-h-[350px] flex flex-col justify-end shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>

          {nextChapter?.visuals[0]?.imageSrc && (
            <div className="absolute inset-0 z-0">
              <Image
                src={nextChapter.visuals[0].imageSrc}
                alt="Background"
                fill
                className="object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent"></div>
            </div>
          )}

          <div className="relative z-10">
            {/* Restored Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/10">
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {isChapterDone ? "Review Chapter" : "Next Reading"}
              </span>
            </div>

            <h2 className="text-4xl font-serif font-bold mb-4">
              Chapter {nextChapter.chapter}
            </h2>

            {/* Restored Bullet Points for Visuals */}
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
              href={`/book/${bookId}/${nextChapterId}`}
              className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs inline-flex items-center gap-2 hover:scale-105 transition-transform w-fit"
            >
              <Play size={14} fill="currentColor" />
              {isChapterDone ? "Continue Reading" : "Start Reading"}
            </Link>
          </div>
        </div>
      </section>

      {/* Carousels */}
      <section className="space-y-12 ml-4">
        {chunkedChapters.map((chunk, index) => (
          <div key={index} className="flex flex-col gap-4">
            <div className="px-6 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">
                Chapters {index * 10 + 1} —{" "}
                {Math.min((index + 1) * 10, chapters.length)}
              </h3>
            </div>
            <div className="flex overflow-x-auto gap-4 px-6 pb-4 snap-x snap-mandatory no-scrollbar">
              {chunk.map(([id, chapter]) => {
                const isDone = completedChapters.includes(`${bookId}-${id}`);
                const thumbnail = chapter.visuals[0]?.imageSrc;
                return (
                  <Link
                    key={id}
                    href={`/book/${bookId}/${id}`}
                    className="group flex-none w-[160px] md:w-[200px] snap-start"
                  >
                    <div className="aspect-3/4 bg-stone-800 rounded-3xl border-2 border-stone-100 relative overflow-hidden transition-all duration-300 hover:border-amber-400 hover:shadow-lg">
                      {thumbnail && (
                        <div className="absolute inset-0 z-0">
                          <Image
                            src={thumbnail}
                            alt=""
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
              <div className="flex-none w-2" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
