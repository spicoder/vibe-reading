import Link from "next/link";
import { PlayerProfile } from "@/app/lib/MultiplayerContext";
import NodeThumbnail from "./node/NodeThumbnail";
import NodeCandy from "./node/NodeCandy";
import NodePlayers from "./node/NodePlayers";
import NodeStars from "./node/NodeStars";
import NodeGemsProps from "./node/NodeGems";

interface MapChapterNodeProps {
  pos: { id: string; chapter: any; x: number; y: number; i: number };
  bookId: string;
  bookTitle: string;
  completedChapters: string[];
  nextChapterId: string;
  currentUser: PlayerProfile | null;
  allPlayers: PlayerProfile[];
  chapters: [string, any][];
  onViewGems: (gemsData: { chapter: string; gems: any[] }) => void;
  MAP_WIDTH: number;
  nodeRef?: React.RefObject<HTMLDivElement | null>;
}

export default function MapChapterNode({
  pos,
  bookId,
  bookTitle,
  completedChapters,
  nextChapterId,
  currentUser,
  allPlayers,
  chapters,
  onViewGems,
  MAP_WIDTH,
  nodeRef,
}: MapChapterNodeProps) {
  const isDone = completedChapters.includes(`${bookId}-${pos.id}`);
  const isActive = !isDone && pos.id === nextChapterId;
  const isLocked = !isDone && !isActive;
  const thumbnail = pos.chapter.visuals[0]?.imageSrc;
  const isRightSide = pos.x > 200;

  // Compute Stars Based on Activity
  let userStarsCount = 1; // Base 1 star for reading
  if (isDone) {
    const chapterPrefix = `${bookTitle} ${pos.id}:`;
    const hasGems = Object.keys(currentUser?.gems || {}).some((ref) =>
      ref.startsWith(chapterPrefix),
    );
    const hasFavs = currentUser?.favorites?.some((fav) =>
      fav.startsWith(`chapter-${pos.id}-`),
    );

    if (hasGems) userStarsCount = 3;
    else if (hasFavs) userStarsCount = 2;
  }

  // Gather community gems for this chapter
  const communityGems: any[] = [];
  const chapterPrefix = `${bookTitle} ${pos.id}:`;
  allPlayers.forEach((player) => {
    if (!player.gems) return;
    Object.entries(player.gems).forEach(([ref, content]) => {
      if (ref.startsWith(chapterPrefix))
        communityGems.push({ player, ref, content: content as string });
    });
  });

  const nodeInnerContent = (
    <>
      <NodeCandy id={pos.chapter.chapter} isActive={isActive} isDone={isDone} />
      <NodeStars userStarsCount={userStarsCount} isDone={isDone} />
      <NodePlayers
        allPlayers={allPlayers}
        currentUser={currentUser}
        chapters={chapters}
        bookId={bookId}
        pos={pos}
      />
      <NodeGemsProps
        communityGems={communityGems}
        onViewGems={onViewGems}
        pos={pos}
      />
      <NodeThumbnail
        thumbnail={thumbnail}
        chapterNumber={pos.chapter.chapter}
        isRightSide={isRightSide}
        isActive={isActive}
      />
    </>
  );

  return (
    <div
      ref={nodeRef}
      style={{ left: `${(pos.x / MAP_WIDTH) * 100}%`, top: pos.y }}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-30"
    >
      {isLocked ? (
        <div className="relative group flex items-center justify-center transition-transform duration-300 opacity-80 cursor-not-allowed">
          {nodeInnerContent}
        </div>
      ) : (
        <Link
          href={`/book/${bookId}/${pos.id}`}
          className={`relative group flex items-center justify-center transition-transform duration-300 ${isDone ? "hover:-translate-y-1" : ""}`}
        >
          {nodeInnerContent}
        </Link>
      )}
    </div>
  );
}
