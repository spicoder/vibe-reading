import { StoryItem } from "@/app/types";

interface StoryProgressProps {
  segmentSlides: StoryItem[];
  indexInSegment: number;
  progress: number;
  totalSegments: number;
  currentSegmentIndex: number;
}

export function StoryProgress({
  segmentSlides,
  indexInSegment,
  progress,
  totalSegments,
  currentSegmentIndex,
}: StoryProgressProps) {
  return (
    <div className="absolute top-2 left-2 right-2 z-40 flex flex-col gap-2 pointer-events-none">
      <div className="flex gap-1 h-1">
        {segmentSlides.map((_, idx) => (
          <div
            key={idx}
            className="flex-1 h-full rounded-full bg-white/20 overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-[50ms] linear"
              style={{
                width:
                  idx < indexInSegment
                    ? "100%"
                    : idx === indexInSegment
                      ? `${progress}%`
                      : "0%",
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-1.5">
        {Array.from({ length: totalSegments }).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentSegmentIndex ? "w-4 bg-amber-500" : "w-1 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
