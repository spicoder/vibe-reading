import Link from "next/link";

interface StoryCompletionProps {
  isLastSlide: boolean;
  showGrid: boolean;
  currentChapter: number;
  bookId: string;
  nextChapterId?: string | null;
}

export function StoryCompletion({
  isLastSlide,
  showGrid,
  currentChapter,
  bookId,
  nextChapterId,
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
          {nextChapterId && (
            <Link
              href={`/book/${bookId}?animateTo=${nextChapterId}&animateFrom=${currentChapter}`}
              className="bg-amber-500 text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-amber-400 transition"
            >
              Next Chapter
            </Link>
          )}
          <Link
            href={`/book/${bookId}`}
            className="bg-white/10 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/20 transition"
          >
            Return to Map
          </Link>
        </div>
      </div>
    </div>
  );
}
