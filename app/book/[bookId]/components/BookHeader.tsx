import Link from "next/link";
import { ChevronLeft, Heart, Bookmark } from "lucide-react";

export default function BookHeader({ title }: { title: string }) {
  return (
    <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-stone-200 transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-2xl font-black font-serif text-stone-900 tracking-tight uppercase">
          {title}
        </h1>
      </div>
    </header>
  );
}
