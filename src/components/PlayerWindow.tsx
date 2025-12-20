type PlayerWindowProps = {
  name: string;
  score: number;
  isTurn?: boolean;
};

export default function PlayerWindow({
  name,
  score,
  isTurn = false,
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
        <p className="text-8xl h-fit pb-5">{score}</p>
      </div>
    </div>
  );
}
