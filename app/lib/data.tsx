import { ChapterData, BookData } from "../types";
import { bookOfIsaiah } from "../bookData/bookOfIsaiah";
import { bookOfJeremiah } from "../bookData/bookOfJeremiah";

export const isaiahChapters: Record<string, ChapterData> = bookOfIsaiah;
export const jeremiahChapters: Record<string, ChapterData> = bookOfJeremiah;

export const bibleBooks: Record<string, BookData> = {
  isaiah: {
    id: "isaiah",
    title: "Isaiah",
    coverImage: "/pictures/placeholder.png",
    chapters: isaiahChapters,
  },
  jeremiah: {
    id: "jeremiah",
    title: "Jeremiah",
    coverImage: "/pictures/placeholder.png",
    chapters: jeremiahChapters,
  },
};
