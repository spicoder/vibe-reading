// Data

export type Verse = {
  verse: number;
  groupId?: string;
  speaker: string;
  text: string;
};

export type VisualScene = {
  startVerse: number;
  title: string;
  description: string;
  imageSrc?: string;
  alt?: string;
};

export type ChapterData = {
  chapter: number;
  visuals: VisualScene[];
  verses: Verse[];
};

// StoryViwer

export type SpeakerTheme = {
  container: string;
  text: string;
  badge: string;
};

export type StoryItem =
  | { type: "visual"; data: VisualScene; id: string; segmentIndex: number }
  | {
      type: "verse";
      data: {
        verses: Verse[];
        speaker: string;
        text: string;
        verseDisplay: string;
      };
      id: string;
      segmentIndex: number;
    };

export interface StoryViewerProps {
  chapter: ChapterData;
  nextChapterId: string | null;
}
