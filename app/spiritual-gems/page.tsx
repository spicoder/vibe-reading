"use client";
import React, { Suspense, useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  Check,
  Search,
  Trash2,
  Edit3,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useGems } from "@/app/lib/hooks";
import { bibleBooks } from "@/app/lib/data";
import { ChapterData, Verse } from "@/app/types";

// --- HELPER FUNCTIONS ---
function parseReference(ref: string) {
  // Matches "BookName Chapter:Verses" e.g., "Isaiah 1:18-20"
  const match = ref.match(/(.+?)\s+(\d+):([\d-]+)/);
  if (!match) return null;
  return {
    bookTitle: match[1],
    chapterStr: match[2],
    versesStr: match[3],
  };
}

function getVerseTextForRef(ref: string) {
  const parsed = parseReference(ref);
  if (!parsed) return null;

  const bookKey = parsed.bookTitle.toLowerCase();
  const book = bibleBooks[bookKey];
  if (!book) return null;

  const chapterData = book.chapters[parsed.chapterStr];
  if (!chapterData) return null;

  const [startStr, endStr] = parsed.versesStr.split("-");
  const start = parseInt(startStr, 10);
  const end = endStr ? parseInt(endStr, 10) : start;

  const verses = chapterData.verses.filter(
    (v) => v.verse >= start && v.verse <= end,
  );

  if (verses.length === 0) return null;
  return verses.map((v) => v.text).join(" ");
}

// Mimics the logic in StoryViewer to accurately index the slide
function getSlideIndexForVerse(
  chapter: ChapterData,
  targetVerse: number,
): number {
  let slideIndex = 0;
  const sortedVisuals = [...chapter.visuals].sort(
    (a, b) => a.startVerse - b.startVerse,
  );
  const sortedVerses = [...chapter.verses].sort((a, b) => a.verse - b.verse);

  let currentGroup: Verse[] = [];
  const addedVisuals = new Set<number>();

  const flushGroup = () => {
    if (currentGroup.length === 0) return null;
    const firstVerse = currentGroup[0];
    const segmentIndex = sortedVisuals.findLastIndex(
      (v) => v.startVerse <= firstVerse.verse,
    );
    const visual = sortedVisuals[segmentIndex];

    if (
      visual &&
      firstVerse.verse === visual.startVerse &&
      !addedVisuals.has(visual.startVerse)
    ) {
      addedVisuals.add(visual.startVerse);
      slideIndex++;
    }

    const found = currentGroup.some((v) => v.verse === targetVerse);
    const currentIndex = slideIndex;
    slideIndex++;
    currentGroup = [];
    return found ? currentIndex : null;
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
        const foundIdx = flushGroup();
        if (foundIdx !== null) return foundIdx;
        currentGroup.push(verse);
      }
    }
  }

  const foundIdx = flushGroup();
  if (foundIdx !== null) return foundIdx;

  return 0;
}

function getStoryLink(ref: string) {
  const parsed = parseReference(ref);
  if (!parsed) return "/";

  const bookKey = parsed.bookTitle.toLowerCase();
  const book = bibleBooks[bookKey];
  if (!book) return `/book/${bookKey}/${parsed.chapterStr}`;

  const chapterData = book.chapters[parsed.chapterStr];
  if (!chapterData) return `/book/${bookKey}/${parsed.chapterStr}`;

  const [startStr] = parsed.versesStr.split("-");
  const startVerse = parseInt(startStr, 10);

  const slideIndex = getSlideIndexForVerse(chapterData, startVerse);

  return `/book/${bookKey}/${parsed.chapterStr}?slide=${slideIndex}`;
}

// --- COMPONENTS ---
function GemsEditor({ initialRef }: { initialRef: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const { getGem, saveGem, isLoaded } = useGems();
  const [note, setNote] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded && !hasLoaded) {
      setNote(getGem(initialRef));
      setHasLoaded(true);
    }
  }, [isLoaded, hasLoaded, getGem, initialRef]);

  const handleSave = () => {
    saveGem(initialRef, note);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      <header className="flex items-center gap-4 p-6 sticky top-0 z-10 bg-[#FDFBF7]/90 backdrop-blur-md">
        <button
          onClick={() => {
            if (returnTo) {
              router.push(decodeURIComponent(returnTo));
            } else {
              router.push("/spiritual-gems");
            }
          }}
          className="p-2 bg-white border border-stone-200 rounded-full text-stone-600 hover:bg-stone-100 transition-colors shadow-sm"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="font-serif text-xl font-bold text-stone-900">
            Edit Note
          </h1>
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">
            Personal Reflection
          </p>
        </div>
      </header>

      <div className="flex-1 p-6 max-w-lg mx-auto w-full">
        <div className="bg-white border-l-4 border-amber-500 p-5 mb-8 rounded-r-xl shadow-sm">
          <p className="text-xs font-bold uppercase text-amber-600 mb-1 tracking-widest">
            Reference
          </p>
          <div className="flex items-center justify-between mb-3">
            <p className="font-serif text-2xl text-stone-900 font-bold">
              {initialRef}
            </p>
            <Link
              href={getStoryLink(initialRef)}
              className="p-2 bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100 transition-colors"
              title="Read Chapter"
            >
              <BookOpen size={18} />
            </Link>
          </div>
          {(() => {
            const verseText = getVerseTextForRef(initialRef);
            if (verseText) {
              return (
                <p className="text-stone-600 font-serif italic text-sm leading-relaxed border-t border-stone-100 pt-3 mt-1">
                  "{verseText}"
                </p>
              );
            }
            return null;
          })()}
        </div>

        <div className="space-y-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your spiritual gems here..."
            className="w-full h-[50vh] p-6 rounded-2xl bg-white border-2 border-stone-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 text-lg text-black placeholder:text-stone-300 outline-none transition-all resize-none shadow-sm leading-relaxed"
            autoFocus
          ></textarea>

          <button
            onClick={handleSave}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg active:scale-95 ${
              isSaved
                ? "bg-green-600 text-white"
                : "bg-stone-900 text-white hover:bg-black"
            }`}
          >
            {isSaved ? (
              <>
                <Check size={20} /> Saved
              </>
            ) : (
              <>
                <Save size={20} /> Save Note
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function GemsList() {
  const { allGems, deleteGem, isLoaded } = useGems();
  const [searchTerm, setSearchTerm] = useState("");
  const [gemToDelete, setGemToDelete] = useState<string | null>(null);

  if (!isLoaded)
    return (
      <div className="p-10 text-center text-stone-400">Loading gems...</div>
    );

  const gemsArray = Object.entries(allGems).map(([ref, content]) => ({
    ref,
    content,
  }));
  const filteredGems = gemsArray.filter(
    (g) =>
      g.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7] relative">
      <header className="p-6 sticky top-0 z-10 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-100">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/"
            className="p-2 bg-white border border-stone-200 rounded-full text-stone-600 hover:bg-stone-100 transition-colors shadow-sm"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              Spiritual Gems
            </h1>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">
              {gemsArray.length} Notes Saved
            </p>
          </div>
        </div>
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search your notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-stone-800 placeholder:text-stone-300 transition-all"
          />
        </div>
      </header>

      <div className="flex-1 p-6">
        {gemsArray.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-300">
              <MessageCircle size={40} />
            </div>
            <p className="font-serif text-xl text-stone-600 mb-2 font-bold">
              No gems yet
            </p>
            <p className="text-sm text-stone-400 max-w-xs mx-auto">
              Start reading and tap "Reply" on a verse to add your first note.
            </p>
            <Link
              href="/isaiah/1"
              className="mt-8 px-6 py-3 bg-stone-900 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-black transition-colors"
            >
              Go to Reading
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 max-w-2xl mx-auto pb-20">
            {filteredGems.length === 0 && (
              <p className="text-center text-stone-400 mt-10">
                No matches found.
              </p>
            )}
            {filteredGems.map((gem) => (
              <div
                key={gem.ref}
                className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 relative hover:border-amber-300 transition-colors group"
              >
                <div className="flex justify-between items-start mb-3">
                  <Link
                    href={getStoryLink(gem.ref)}
                    className="flex-1 flex items-center gap-2 group/ref w-fit"
                    title="Jump to Story"
                  >
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-widest group-hover/ref:bg-amber-200 transition-colors shadow-sm">
                      {gem.ref}
                      <BookOpen
                        size={14}
                        className="opacity-70 group-hover/ref:opacity-100"
                      />
                    </span>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setGemToDelete(gem.ref);
                    }}
                    className="p-2 -mt-2 -mr-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>

                {(() => {
                  const verseText = getVerseTextForRef(gem.ref);
                  if (verseText) {
                    return (
                      <Link href={getStoryLink(gem.ref)} className="block mb-4">
                        <blockquote className="pl-4 border-l-4 border-amber-200 text-stone-500 font-serif italic text-base line-clamp-3 hover:text-stone-700 transition-colors">
                          "{verseText}"
                        </blockquote>
                      </Link>
                    );
                  }
                  return null;
                })()}

                <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                  <p className="text-stone-800 font-serif text-lg leading-relaxed whitespace-pre-wrap">
                    {gem.content || (
                      <span className="italic text-stone-400">
                        Empty note...
                      </span>
                    )}
                  </p>
                </div>

                {/* Explicit Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={getStoryLink(gem.ref)}
                    className="flex-1 py-2.5 bg-stone-900 text-white rounded-lg flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider hover:bg-stone-800 transition-colors"
                  >
                    <BookOpen size={16} /> Read in Story
                  </Link>
                  <Link
                    href={`/spiritual-gems?ref=${encodeURIComponent(gem.ref)}`}
                    className="flex-1 py-2.5 bg-amber-100 text-amber-900 rounded-lg flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider hover:bg-amber-200 transition-colors"
                  >
                    <Edit3 size={16} /> Edit Note
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {gemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold font-serif mb-2 text-stone-900">
              Delete Note?
            </h3>
            <p className="text-stone-500 mb-8 leading-relaxed">
              Are you sure you want to delete this spiritual gem? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setGemToDelete(null)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteGem(gemToDelete);
                  setGemToDelete(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GemsPageRouter() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  if (ref) return <GemsEditor initialRef={decodeURIComponent(ref)} />;
  return <GemsList />;
}

export default function SpiritualGemsPage() {
  return (
    <main>
      <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7]" />}>
        <GemsPageRouter />
      </Suspense>
    </main>
  );
}
