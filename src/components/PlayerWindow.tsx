type PlayerWindowProps = {
  name: string;
  score: number;
  isTurn?: boolean;
  shots: ("red" | "yellow" | "green" | "brown" | "blue" | "pink" | "black")[];
  ballClasses: Record<string, string>;
};

export default function PlayerWindow({
  name,
  score,
  isTurn = false,
  shots,
  ballClasses,
}: PlayerWindowProps) {
  return (
    <div className="background rounded-sm p grid">
      {isTurn && (
        <div className="flex rounded-t-sm justify-center items-center bg-[#fff9] text-gray-900 font-semibold">
          Your Turn
        </div>
      )}

      <div className="text-center h-fit pt-6 font-bold">
        <h1 className="text-2xl">{name}</h1>
      </div>

      <div className="flex justify-center">
        <p className="text-8xl h-fit pb-3">{score}</p>
      </div>

      {/* Shot History */}
      <div className="flex flex-wrap justify-center gap-1 pb-2">
        {shots.map((color, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full ${ballClasses[color]}`}
          />
        ))}
      </div>
    </div>
  );
}
