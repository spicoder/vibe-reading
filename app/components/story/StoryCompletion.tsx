import Link from "next/link";

interface StoryCompletionProps {
  isLastSlide: boolean;
  showGrid: boolean;
  currentChapter: number;
  nextChapterUrl?: string | null; // <-- Updated to allow null
}

export function StoryCompletion({
  isLastSlide,
  showGrid,
  currentChapter,
  nextChapterUrl,
}: StoryCompletionProps) {
  if (!isLastSlide || showGrid) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-2xl z-50">
      <div className="text-center p-8">
        <h2 className="text-4xl font-serif font-bold mb-2">
          Chapter Complete! 🎉
        </h2>
        <p className="text-stone-400 mb-8 max-w-xs mx-auto">
          You've finished reading Chapter {currentChapter}.
        </p>
        <div className="flex flex-col gap-4 items-center">
          {nextChapterUrl && (
            <Link
              href={nextChapterUrl}
              className="bg-amber-500 text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest"
            >
              Next Chapter
            </Link>
          )}
          <Link
            href="/"
            className="bg-white/10 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest"
          >
            Return to Library
          </Link>
        </div>
      </div>
    </div>
  );
}
