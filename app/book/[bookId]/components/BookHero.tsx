import Link from "next/link";
import Image from "next/image";
import { Sparkles, Play } from "lucide-react";

interface BookHeroProps {
  bookId: string;
  nextChapterId: string;
  nextChapter: any;
  isChapterDone: boolean;
  theme: { doneBg: string };
}

export default function BookHero({
  bookId,
  nextChapterId,
  nextChapter,
  isChapterDone,
}: BookHeroProps) {
  if (!nextChapter) return null;

  return (
    <div className="bg-blue-300 rounded-3xl p-3 pl-4 pr-3 text-gray-800 relative overflow-hidden flex items-center shadow-2xl gap-4 mx-auto max-w-sm border-stone-700">
      {/* Background Texture & Image */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
      {nextChapter.visuals?.[0]?.imageSrc && (
        <div className="absolute inset-0 z-0">
          <Image
            src={nextChapter.visuals[0].imageSrc}
            alt="Background"
            fill
            className="object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex-1">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white backdrop-blur-md rounded-full mb-1.5 border border-black/10">
          <Sparkles size={10} className="text-amber-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-800">
            {isChapterDone ? "Review Mode" : "Next Level"}
          </span>
        </div>

        <h2 className="text-xl font-serif font-bold leading-none">
          Chapter {nextChapter.chapter}
        </h2>
      </div>

      {/* Call to Action Play Button */}
      <Link
        href={`/book/${bookId}/${nextChapterId}`}
        className="relative z-10 bg-white text-stone-900 w-12 h-12 rounded-full flex items-center justify-center shrink-0 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
      >
        <Play size={20} fill="currentColor" className="ml-1" />
      </Link>
    </div>
  );
}
