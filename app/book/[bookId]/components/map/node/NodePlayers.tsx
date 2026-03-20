import { PlayerProfile } from "@/app/lib/MultiplayerContext";

interface NodePlayersProps {
  allPlayers: PlayerProfile[];
  currentUser: PlayerProfile | null;
  chapters: [string, any][];
  bookId: string;
  pos: { id: string };
}

export default function NodePlayers({
  allPlayers,
  currentUser,
  chapters,
  bookId,
  pos,
}: NodePlayersProps) {
  const playersOnThisNode = allPlayers.filter((player) => {
    if (player.id === currentUser?.id) return false;
    const playerNextChapter =
      chapters.find(
        ([id]) => !player.completedChapters.includes(`${bookId}-${id}`),
      )?.[0] || "1";
    return playerNextChapter === pos.id;
  });

  return (
    playersOnThisNode.length > 0 && (
      <div className="absolute -top-3 -left-5 flex -space-x-2 z-30 drop-shadow-sm">
        {playersOnThisNode.slice(0, 3).map((player) => (
          <div
            key={player.id}
            className="w-10 h-10 rounded-full bg-white border border-stone-200 flex flex-col text-2xl shadow-sm"
            title={player.name}
          >
            {player.avatar}
            <p className="text-black text-center text-xs bg-white border border-stone-200">{`${player.name}`}</p>
          </div>
        ))}
      </div>
    )
  );
}
