import { Star } from "lucide-react";

interface FlyingStarsProps {
  count: number;
}

export default function FlyingStars({ count }: FlyingStarsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={`fly-${i}`}
          className="fly-star fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]"
          style={{ animationDelay: `${i * 500}ms` }} // Stagger them slightly
          size={56}
        />
      ))}
    </>
  );
}
