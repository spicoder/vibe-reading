import { notFound } from "next/navigation";
import { bibleBooks } from "@/app/lib/data";
import StoryViewer from "@/app/components/story/StoryViewer";

export async function generateStaticParams() {
  const params: { bookId: string; chapterId: string }[] = [];

  for (const bookId of Object.keys(bibleBooks)) {
    const book = bibleBooks[bookId];
    for (const chapterId of Object.keys(book.chapters)) {
      params.push({ bookId, chapterId });
    }
  }

  return params;
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ bookId: string; chapterId: string }>;
}) {
  const { bookId, chapterId } = await params;
  const book = bibleBooks[bookId];

  if (!book) notFound();

  const chapter = book.chapters[chapterId];
  if (!chapter) notFound();

  // Calculate the next chapter URL
  const chapterIds = Object.keys(book.chapters).sort(
    (a, b) => Number(a) - Number(b),
  );
  const currentIndex = chapterIds.indexOf(chapterId);
  const nextChapterId = chapterIds[currentIndex + 1] || null;

  const bookUrl = `/book/${bookId}`;

  return (
    <StoryViewer
      bookId={book.id}
      bookTitle={book.title}
      chapter={chapter}
      nextChapterId={nextChapterId}
      bookUrl={bookUrl}
    />
  );
}
