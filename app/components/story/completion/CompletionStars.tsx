import { Star } from "lucide-react";

export default function CompletionStars({
  starsEarned,
}: {
  starsEarned: number;
}) {
  return (
    <div className="flex justify-center gap-4 mb-6">
      {[1, 2, 3].map((star) => (
        <div
          key={star}
          className={`transform transition-all duration-700 ${star <= starsEarned ? "scale-110" : "scale-100 opacity-50"}`}
          style={{ transitionDelay: `${star * 150}ms` }}
        >
          <Star
            size={56}
            className={
              star <= starsEarned
                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                : "fill-stone-800 text-stone-700"
            }
          />
        </div>
      ))}
    </div>
  );
}
