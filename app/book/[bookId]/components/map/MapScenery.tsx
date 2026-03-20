import Image from "next/image";

interface MapSceneryProps {
  containerHeight: number;
  mapWidth: number;
}

export default function MapScenery({
  containerHeight,
  mapWidth: MAP_WIDTH,
}: MapSceneryProps) {
  const sceneryElements: any[] = [];
  const numSceneryRow = Math.floor(containerHeight / 180);

  for (let i = 0; i < numSceneryRow; i++) {
    const y = containerHeight - (i * 180 + 60);
    const rollLeft = Math.abs(Math.sin(i * 21));
    const rollRight = Math.abs(Math.cos(i * 23));

    const getType = (roll: number) => {
      if (roll > 0.7) return "pine";
      if (roll > 0.4) return "tree";
      if (roll > 0.2) return "bush";
      return "cloud";
    };

    sceneryElements.push({
      id: `scen-L-${i}`,
      type: getType(rollLeft),
      x: 20 + rollLeft * 40,
      y: y + rollLeft * 40,
      scale: 0.7 + rollLeft * 0.3,
      flip: rollLeft > 0.5,
    });

    sceneryElements.push({
      id: `scen-R-${i}`,
      type: getType(rollRight),
      x: MAP_WIDTH - 20 - rollRight * 40,
      y: y + rollRight * 40,
      scale: 0.7 + rollRight * 0.3,
      flip: rollRight > 0.5,
    });
  }

  return (
    <>
      {sceneryElements.map((item) => {
        const transform = `scale(${item.scale}) ${item.flip ? "scaleX(-1)" : ""}`;
        let imageSrc = "";
        if (item.type === "pine") imageSrc = "/assets/3d/pine-tree.png";
        if (item.type === "tree") imageSrc = "/assets/3d/round-tree.png";
        if (item.type === "bush") imageSrc = "/assets/3d/bush.png";
        if (item.type === "cloud") imageSrc = "/assets/3d/cloud.png";

        if (!imageSrc) return null;

        return (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
            style={{ left: `${(item.x / MAP_WIDTH) * 100}%`, top: item.y }}
          >
            <div
              className="relative drop-shadow-lg opacity-90 transition-transform hover:scale-110"
              style={{ transform }}
            >
              <Image
                src={imageSrc}
                alt={`${item.type} scenery`}
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
        );
      })}
    </>
  );
}
