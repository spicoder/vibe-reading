import { useEffect, useRef, useState, useMemo } from "react";
import { PlayerProfile } from "@/app/lib/MultiplayerContext";

// Newly Extracted Sub-Components
import MapRoad from "./map/MapRoad";
import MapScenery from "./map/MapScenery";
import MapTreasure from "./map/MapTreasure";
import MapAvatar from "./map/MapAvatar";
import MapChapterNode from "./MapChapterNode"; // Or ./map/MapChapterNode if you moved it inside

interface GamifiedMapProps {
  book: any;
  bookId: string;
  chapters: [string, any][];
  completedChapters: string[];
  nextChapterId: string;
  theme: any;
  currentUser: PlayerProfile | null;
  allPlayers: PlayerProfile[];
  isLoaded: boolean;
  mounted: boolean;
  onViewGems: (gemsData: { chapter: string; gems: any[] }) => void;
  animateTo?: string | null;
  animateFrom?: string | null;
  isBookCompleted?: boolean;
}

export default function GamifiedMap({
  book,
  bookId,
  chapters,
  completedChapters,
  nextChapterId,
  theme,
  currentUser,
  allPlayers,
  isLoaded,
  mounted,
  onViewGems,
  animateTo,
  animateFrom,
  isBookCompleted,
}: GamifiedMapProps) {
  const activeNodeRef = useRef<HTMLDivElement>(null);

  const MAP_WIDTH = 400;
  const NODE_SPACING = 150;
  const containerHeight = chapters.length * NODE_SPACING + 250;

  // 1. Calculate Node Positions (Invert Y-axis so Chapter 1 starts at the bottom)
  const nodePositions = useMemo(() => {
    return chapters.map(([id, chapter], i) => {
      const x = 200 + Math.sin(i * 0.8) * 110;
      const y = containerHeight - (i * NODE_SPACING + 150);
      return { id, chapter, x, y, i };
    });
  }, [chapters, containerHeight]);

  // 2. Calculate Treasure Position (At the very top of the path)
  const treasureX = 200;
  const treasureY =
    nodePositions.length > 0
      ? nodePositions[nodePositions.length - 1].y - 130
      : 100;

  // 3. Generate SVG Path connecting all nodes and the treasure
  let pathD = "";
  if (nodePositions.length > 0) {
    pathD = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
    for (let i = 1; i < nodePositions.length; i++) {
      const prev = nodePositions[i - 1];
      const curr = nodePositions[i];
      pathD += ` C ${prev.x} ${prev.y - 75}, ${curr.x} ${curr.y + 75}, ${curr.x} ${curr.y}`;
    }
    const lastNode = nodePositions[nodePositions.length - 1];
    pathD += ` C ${lastNode.x} ${lastNode.y - 65}, ${treasureX} ${treasureY + 65}, ${treasureX} ${treasureY + 20}`;
  }

  // 4. Handle Avatar Position and Movement Animations
  const [avatarPos, setAvatarPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  useEffect(() => {
    if (!mounted || !isLoaded) return;

    if (animateFrom && animateTo) {
      const fromNode = nodePositions.find((n) => n.id === animateFrom);

      if (animateTo === "treasure") {
        if (fromNode) {
          setAvatarPos({ x: fromNode.x, y: fromNode.y });
          const timer = setTimeout(() => {
            setAvatarPos({ x: treasureX, y: treasureY });
          }, 800);
          return () => clearTimeout(timer);
        } else {
          setAvatarPos({ x: treasureX, y: treasureY });
        }
      } else {
        const toNode = nodePositions.find((n) => n.id === animateTo);

        if (fromNode && toNode) {
          // Instantly snap to the start position
          setAvatarPos({ x: fromNode.x, y: fromNode.y });

          // Wait 800ms for the map's fade-in transition to mostly finish, THEN move
          const timer = setTimeout(() => {
            setAvatarPos({ x: toNode.x, y: toNode.y });
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    } else {
      // No animation, snap directly to active next chapter node
      if (isBookCompleted) {
        setAvatarPos({ x: treasureX, y: treasureY });
      } else {
        const activeNode = nodePositions.find((n) => n.id === nextChapterId);
        if (activeNode) {
          setAvatarPos((prev) =>
            prev?.x === activeNode.x && prev?.y === activeNode.y
              ? prev
              : { x: activeNode.x, y: activeNode.y },
          );
        }
      }
    }
  }, [
    animateFrom,
    animateTo,
    nextChapterId,
    mounted,
    isLoaded,
    nodePositions,
    isBookCompleted,
    treasureX,
    treasureY,
  ]);

  // 5. Scroll to active node on mount or when navigation finishes
  useEffect(() => {
    if (mounted && isLoaded && activeNodeRef.current) {
      setTimeout(() => {
        activeNodeRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }, [mounted, isLoaded, nextChapterId, animateTo]);

  return (
    <section className="w-full overflow-hidden px-4 py-8 relative">
      <div
        className={`relative mx-auto w-full max-w-[450px] transition-opacity duration-1000 ${
          mounted && isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ height: containerHeight }}
      >
        {/* Layer 1: Volumetric Road */}
        <MapRoad
          pathD={pathD}
          mapWidth={MAP_WIDTH}
          containerHeight={containerHeight}
        />

        {/* Layer 2: Scenery (Trees, Bushes, Clouds) */}
        <MapScenery containerHeight={containerHeight} mapWidth={MAP_WIDTH} />

        {/* Layer 3: The Final Treasure */}
        {nodePositions.length > 0 && (
          <MapTreasure x={treasureX} y={treasureY} mapWidth={MAP_WIDTH} />
        )}

        {/* Layer 4: The Player's Avatar */}
        {avatarPos && (
          <MapAvatar
            avatarPos={avatarPos}
            mapWidth={MAP_WIDTH}
            currentUser={currentUser}
          />
        )}

        {/* Layer 5: Chapter Nodes */}
        {nodePositions.map((pos) => (
          <MapChapterNode
            key={pos.id}
            pos={pos}
            bookId={bookId}
            bookTitle={book.title}
            completedChapters={completedChapters}
            nextChapterId={nextChapterId}
            currentUser={currentUser}
            allPlayers={allPlayers}
            chapters={chapters}
            onViewGems={onViewGems}
            MAP_WIDTH={MAP_WIDTH}
            nodeRef={pos.id === nextChapterId ? activeNodeRef : undefined}
          />
        ))}
      </div>
    </section>
  );
}
