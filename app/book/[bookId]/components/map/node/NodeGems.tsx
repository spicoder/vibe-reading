import { MessageCircle } from "lucide-react";

interface NodeGemsProps {
  communityGems: any[];
  onViewGems: (data: { chapter: string; gems: any[] }) => void;
  pos: { id: string };
}

export default function NodeGems({
  communityGems,
  onViewGems,
  pos,
}: NodeGemsProps) {
  return (
    <>
      {communityGems.length > 0 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onViewGems({ chapter: pos.id, gems: communityGems });
          }}
          className="absolute -bottom-2 -left-2 w-8 h-8 bg-amber-50 border-2 border-white rounded-full flex items-center justify-center text-amber-500 shadow-sm hover:scale-110 transition-all z-40"
        >
          <MessageCircle size={14} className="fill-amber-200" />
        </button>
      )}
    </>
  );
}
