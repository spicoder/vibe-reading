import Link from "next/link";

interface CompletionNavProps {
  bookId: string;
  currentChapter: number;
  nextChapterId?: string | null;
}

export default function CompletionNav({
  bookId,
  currentChapter,
  nextChapterId,
}: CompletionNavProps) {
  return (
    <div className="flex flex-col gap-4 items-center">
      {nextChapterId ? (
        <Link
          href={`/book/${bookId}?animateTo=${nextChapterId}&animateFrom=${currentChapter}`}
          className="bg-amber-500 text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-amber-400 transition transform hover:scale-105"
        >
          Next Chapter
        </Link>
      ) : (
        <Link
          href={`/book/${bookId}?animateTo=treasure&animateFrom=${currentChapter}`}
          className="bg-amber-500 text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-amber-400 transition transform hover:scale-105"
        >
          Claim Treasure
        </Link>
      )}
      <Link
        href={`/book/${bookId}`}
        className="bg-white/10 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-white/20 transition"
      >
        Return to Map
      </Link>
    </div>
  );
}
