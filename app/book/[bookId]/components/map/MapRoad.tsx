export default function MapRoad({
  pathD,
  mapWidth,
  containerHeight,
}: {
  pathD: string;
  mapWidth: number;
  containerHeight: number;
}) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md z-0"
      viewBox={`0 0 ${mapWidth} ${containerHeight}`}
      preserveAspectRatio="none"
    >
      <path
        d={pathD}
        fill="none"
        stroke="#d4c5b0"
        strokeWidth="60"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0, 12)"
        className="opacity-50"
      />
      <path
        d={pathD}
        fill="none"
        stroke="#ffffff"
        strokeWidth="60"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-90"
      />
      <path
        d={pathD}
        fill="none"
        stroke="#e7e5e4"
        strokeWidth="4"
        strokeDasharray="12 20"
        strokeLinecap="round"
      />
    </svg>
  );
}
