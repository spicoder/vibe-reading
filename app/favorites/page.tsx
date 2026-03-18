"use client";
import React, { useState } from "react";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMultiplayer } from "@/app/lib/MultiplayerContext";
import { bibleBooks } from "@/app/lib/data";
import { ChapterData, Verse } from "@/app/types";

const getSlideIndex = (chapter: ChapterData, targetId: string): number => {
  const items: { id: string }[] = [];
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

    const segmentIndex = sortedVisuals.findLastIndex(
      (v) => v.startVerse <= firstVerse.verse,
    );
    const visual = sortedVisuals[segmentIndex];

    if (
      visual &&
      firstVerse.verse === visual.startVerse &&
      !addedVisuals.has(visual.startVerse)
    ) {
      items.push({ id: `chapter-${chapterNumber}-visual-${firstVerse.verse}` });
      addedVisuals.add(visual.startVerse);
    }

    const uniqueVerseId = `chapter-${chapterNumber}-verse-${firstVerse.verse}-${items.length}`;
    items.push({ id: uniqueVerseId });
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

  return items.findIndex((item) => item.id === targetId);
};

export default function FavoritesPage() {
  const { favorites, toggleFavorite, isLoaded } = useMultiplayer();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const getVerseContent = (id: string) => {
    let bookId = "isaiah"; // Fallback for older favorites
    let chapterNum = "1";
    let type = "";
    let verseNum = 0;

    // Supports optional bookId prefix (e.g., genesis-chapter-1-verse-1-0)
    const newFormatMatch = id.match(
      /^(?:([a-zA-Z0-9]+)-)?chapter-(\d+)-(verse|visual)-(\d+)/,
    );

    if (newFormatMatch) {
      bookId = newFormatMatch[1] || "isaiah";
      chapterNum = newFormatMatch[2];
      type = newFormatMatch[3];
      verseNum = parseInt(newFormatMatch[4], 10);
    } else if (id.startsWith("verse-")) {
      type = "verse";
      const parts = id.replace("verse-", "").split("-");
      verseNum = parseInt(parts[0], 10);
    } else if (id.startsWith("visual-")) {
      type = "visual";
      verseNum = parseInt(id.replace("visual-", ""), 10);
    } else {
      return null;
    }

    const book = bibleBooks[bookId];
    if (!book) return null;

    const chapterData = book.chapters[chapterNum];
    if (!chapterData) return null;

    const slideIndex = getSlideIndex(chapterData, id);
    const linkHref =
      slideIndex >= 0
        ? `/book/${bookId}/${chapterNum}?slide=${slideIndex}`
        : `/book/${bookId}/${chapterNum}`;

    if (type === "verse") {
      const verse = chapterData.verses.find((v) => v.verse === verseNum);
      return verse
        ? {
            title: `${book.title} ${chapterNum}:${verse.verse}`,
            text: verse.text,
            isVisual: false,
            linkHref,
          }
        : null;
    }

    if (type === "visual") {
      const visual = chapterData.visuals.find((v) => v.startVerse === verseNum);
      return visual
        ? {
            title: visual.title,
            text: visual.description,
            isVisual: true,
            linkHref,
          }
        : null;
    }

    return null;
  };

  if (!isLoaded)
    return (
      <div className="min-h-screen bg-[#FDFBF7] p-6 text-center text-stone-400">
        Loading...
      </div>
    );

  return (
    <main className="min-h-screen bg-[#FDFBF7] p-6 relative">
      <header className="flex items-center justify-between mb-8 sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-sm z-10 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 bg-white border border-stone-200 rounded-full text-stone-600 hover:bg-stone-100 transition-colors shadow-sm"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Favorites
          </h1>
        </div>
      </header>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-50 text-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-300">
            <Heart size={40} />
          </div>
          <p className="font-serif text-2xl text-stone-600 mb-2 font-bold">
            No favorites yet
          </p>
          <p className="text-sm text-stone-400">
            Tap the heart icon while reading.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 max-w-2xl mx-auto pb-20">
          {favorites.map((id) => {
            const content = getVerseContent(id);
            if (!content) return null;

            return (
              <Link href={content.linkHref} key={id} className="block group">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden transition-all hover:border-amber-500 hover:shadow-md cursor-pointer">
                  <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${content.isVisual ? "bg-amber-500" : "bg-stone-800"}`}
                      ></div>
                      <h3 className="font-bold text-stone-900 tracking-wide uppercase text-sm group-hover:text-amber-600 transition-colors">
                        {content.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setItemToDelete(id);
                      }}
                      className="text-stone-300 hover:text-red-500 transition-colors p-2 -mr-2"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>

                  <div className="text-stone-700 font-serif leading-relaxed text-lg">
                    {content.text.replace(/\*\*/g, "")}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold font-serif mb-2 text-stone-900">
              Remove Favorite?
            </h3>
            <p className="text-stone-500 mb-8 leading-relaxed">
              Are you sure you want to remove this from your favorites?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toggleFavorite(itemToDelete);
                  setItemToDelete(null);
                }}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
