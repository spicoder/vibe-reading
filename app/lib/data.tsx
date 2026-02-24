import { ChapterData, BookData } from "../types";
import { bookOfIsaiah } from "../bookData/bookOfIsaiah";

export const isaiahChapters: Record<string, ChapterData> = bookOfIsaiah;

export const bibleBooks: Record<string, BookData> = {
  isaiah: {
    id: "isaiah",
    title: "Isaiah",
    coverImage: "/pictures/placeholder.png",
    chapters: isaiahChapters,
  },
  // Future books go here
  // genesis: { id: "genesis", title: "Genesis", ... }
};
