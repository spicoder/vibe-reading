"use client";

import Link from "next/link";
import { bibleBooks } from "@/app/lib/data";
import { BookOpen } from "lucide-react";

export default function LibraryBookGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(bibleBooks).map(([id, book]) => (
        <Link
          href={`/book/${id}`}
          key={id}
          className="group bg-white p-6 rounded-3xl shadow-sm border border-stone-100 hover:shadow-xl hover:border-amber-200 transition-all flex flex-col gap-4"
        >
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <BookOpen size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif text-stone-900">
              {book.title}
            </h2>
            <p className="text-stone-500 font-medium">
              {Object.keys(book.chapters).length} Chapters
            </p>
          </div>
          <div className="mt-auto pt-4 flex items-center text-amber-600 font-bold uppercase tracking-widest text-sm group-hover:gap-2 transition-all">
            Enter Map &rarr;
          </div>
        </Link>
      ))}
    </div>
  );
}
