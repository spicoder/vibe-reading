import Link from "next/link";
import { Heart, Bookmark } from "lucide-react";
import { bibleBooks } from "@/app/lib/data";

export default function Home() {
  const books = Object.values(bibleBooks);

  return (
    <main className="min-h-screen bg-[#FDFBF7] pb-24">
      <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <h1 className="uppercase text-2xl font-black font-serif text-stone-900 tracking-tight">
          Vibe Reading
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

      <section className="px-6 grid grid-cols-2 gap-4 mt-6">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/book/${book.id}`}
            className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-stone-900 shadow-lg block hover:scale-105 transition-transform"
          >
            {/* If you add coverImage to your BookData, you can use Next/Image here */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
            <div className="absolute inset-0 p-4 flex flex-col justify-end z-20">
              <h2 className="text-2xl font-serif font-bold text-white drop-shadow-md">
                {book.title}
              </h2>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
