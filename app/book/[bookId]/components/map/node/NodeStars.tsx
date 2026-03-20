import { Star } from "lucide-react";

interface NodeStarsProps {
  userStarsCount: number;
  isDone: boolean;
}

export default function NodeStars({ userStarsCount, isDone }: NodeStarsProps) {
  return (
    isDone && (
      <div className="absolute -bottom-3 bg-white px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5 z-40 border border-stone-200/50">
        {Array.from({ length: 3 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            className={
              i < userStarsCount
                ? "fill-amber-400 text-amber-500 drop-shadow-sm"
                : "fill-stone-200 text-stone-300"
            }
          />
        ))}
      </div>
    )
  );
}
