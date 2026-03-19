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
  theme,
}: BookHeroProps) {
  if (!nextChapter) return null;

  return (
    <section className="px-4 mb-8">
      <div className="bg-stone-900 rounded-4xl p-8 text-white relative overflow-hidden min-h-[350px] flex flex-col justify-end shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>

        {nextChapter.visuals?.[0]?.imageSrc && (
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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20">
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {isChapterDone ? "Review Chapter" : "Next Reading"}
            </span>
          </div>

          <h2 className="text-4xl font-serif font-bold mb-4">
            Chapter {nextChapter.chapter}
          </h2>

          <div className="flex flex-col gap-2 mb-8 max-w-md">
            {nextChapter.visuals?.map((visual: any, index: number) => (
              <div key={index} className="flex gap-3 items-start">
                <div
                  className={`w-1 h-1 rounded-full ${theme.doneBg} mt-2 shrink-0`}
                />
                <p className="text-stone-300 text-sm leading-tight font-medium">
                  {visual.title}
                </p>
              </div>
            ))}
          </div>

          <Link
            href={`/book/${bookId}/${nextChapterId}`}
            className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs inline-flex items-center gap-2 hover:scale-105 transition-transform w-fit shadow-xl"
          >
            <Play size={14} fill="currentColor" />
            {isChapterDone ? "Continue Reading" : "Start Reading"}
          </Link>
        </div>
      </div>
    </section>
  );
}
