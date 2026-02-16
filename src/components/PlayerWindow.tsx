type PlayerWindowProps = {
  name: string;
  score: number;
  isTurn?: boolean;
  history: (
    | {
        id: number;
        player: 1 | 2;
        type: "pot";
        color: "red" | "yellow" | "green" | "brown" | "blue" | "pink" | "black";
        points: number;
      }
    | { id: number; player: 1 | 2; type: "miss" }
    | { id: number; player: 1 | 2; type: "foul"; points: 4 | 5 | 6 | 7 }
  )[];
  ballClasses: Record<string, string>;
};

export default function PlayerWindow({
  name,
  score,
  isTurn = false,
  history,
  ballClasses,
}: PlayerWindowProps) {
  return (
    <div className="background rounded-sm p-3 md:p-4 grid">
      {isTurn && (
        <div className="flex rounded-t-sm justify-center items-center bg-[#fff9] text-gray-900 font-semibold text-sm md:text-base">
          Your Turn
        </div>
      )}

      <div className="text-center h-fit pt-4 md:pt-6 font-bold">
        <h1 className="text-xl md:text-2xl break-words">{name}</h1>
      </div>

      <div className="flex justify-center">
        <p className="text-6xl md:text-8xl h-fit pb-3">{score}</p>
      </div>

      {/* Shot History */}
      <div className="mt-2 rounded-md bg-[#1c1c2b] border border-white/10 p-2 md:p-3">
        <div className="text-center text-xs md:text-sm font-semibold text-gray-300 mb-2">
          Shot History
        </div>
        <div className="flex flex-wrap justify-center gap-1 min-h-6">
          {history.map(item => {
            if (item.type === "pot") {
              return (
                <span
                  key={item.id}
                  className={`w-5 h-5 rounded-full ${ballClasses[item.color]} flex items-center justify-center`}
                />
              );
            }

            if (item.type === "foul") {
              return (
                <span
                  key={item.id}
                  className="w-5 h-5 rounded-full bg-gray-600 text-[10px] font-bold leading-none flex items-center justify-center"
                  title={`Foul +${item.points}`}
                >
                  {item.points}
                </span>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
}
