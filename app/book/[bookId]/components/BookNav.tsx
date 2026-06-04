// app/components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Map, Heart, Bookmark, Library } from "lucide-react";

export default function BookNav({ bookId }: { bookId?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Resolve bookId from prop or from current URL query param
  const resolvedBookId = bookId || searchParams.get("book") || undefined;

  const isFavorites = pathname === "/favorites";
  const isGems = pathname === "/spiritual-gems";
  const isMap = !isFavorites && !isGems;

  const favoritesHref = resolvedBookId ? `/favorites?book=${resolvedBookId}` : "/favorites";
  const gemsHref = resolvedBookId ? `/spiritual-gems?book=${resolvedBookId}` : "/spiritual-gems";

  return (
    <div className="bg-white border-t border-stone-200 px-8 py-3 w-full max-w-md flex justify-between items-center pointer-events-auto rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
      <Link
        href={resolvedBookId ? `/book/${resolvedBookId}` : "/"}
        className={`flex flex-col items-center transition-all hover:scale-105 ${
          isMap ? "text-amber-500" : "text-stone-400 hover:text-amber-500"
        }`}
      >
        {resolvedBookId ? (
          <Map size={24} strokeWidth={2.5} />
        ) : (
          <Library size={24} strokeWidth={2.5} />
        )}
        <span className="text-[10px] font-bold mt-1 tracking-wide">
          {resolvedBookId ? "Map" : "Library"}
        </span>
      </Link>
      <Link
        href={favoritesHref}
        className={`flex flex-col items-center transition-all hover:scale-105 ${
          isFavorites ? "text-rose-400" : "text-stone-400 hover:text-rose-400"
        }`}
      >
        <Heart size={24} strokeWidth={2.5} />
        <span className="text-[10px] font-bold mt-1 tracking-wide">
          Favorites
        </span>
      </Link>
      <Link
        href={gemsHref}
        className={`flex flex-col items-center transition-all hover:scale-105 ${
          isGems ? "text-amber-500" : "text-stone-400 hover:text-amber-500"
        }`}
      >
        <Bookmark size={24} strokeWidth={2.5} />
        <span className="text-[10px] font-bold mt-1 tracking-wide">Gems</span>
      </Link>
    </div>
  );
}
