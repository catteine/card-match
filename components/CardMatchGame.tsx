"use client";

import { useState, useEffect, useCallback } from "react";

const ANIMALS = [
  { id: "lion", emoji: "🦁", name: "사자" },
  { id: "elephant", emoji: "🐘", name: "코끼리" },
  { id: "penguin", emoji: "🐧", name: "펭귄" },
  { id: "fox", emoji: "🦊", name: "여우" },
  { id: "panda", emoji: "🐼", name: "판다" },
  { id: "frog", emoji: "🐸", name: "개구리" },
  { id: "tiger", emoji: "🐯", name: "호랑이" },
  { id: "rabbit", emoji: "🐰", name: "토끼" },
];

const WAVE_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='12'%3E%3Cpath d='M0 6 C10 0%2C 20 12%2C 40 6' stroke='%23fdba74' stroke-width='1.5' fill='none' opacity='0.6'/%3E%3C/svg%3E")`;

type Card = {
  uid: number;
  animalId: string;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
};

type GameState = "idle" | "playing" | "finished";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createCards(): Card[] {
  const doubled = [...ANIMALS, ...ANIMALS].map((animal, idx) => ({
    uid: idx,
    animalId: animal.id,
    emoji: animal.emoji,
    name: animal.name,
    isFlipped: false,
    isMatched: false,
  }));
  return shuffle(doubled);
}

export default function CardMatchGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [isChecking, setIsChecking] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const startGame = useCallback(() => {
    setCards(createCards());
    setFlipped([]);
    setScore(0);
    setMoves(0);
    setGameState("playing");
    setIsChecking(false);
  }, []);

  useEffect(() => {
    if (gameState !== "playing" || cards.length === 0) return;
    const allMatched = cards.every((c) => c.isMatched);
    if (allMatched) {
      setGameState("finished");
      setBestScore((prev) => (prev === null || moves < prev ? moves : prev));
    }
  }, [cards, gameState, moves]);

  const handleCardClick = (uid: number) => {
    if (isChecking || gameState !== "playing") return;

    const card = cards.find((c) => c.uid === uid);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flipped.length === 1 && flipped[0] === uid) return;

    const newFlipped = [...flipped, uid];
    setCards((prev) =>
      prev.map((c) => (c.uid === uid ? { ...c, isFlipped: true } : c))
    );

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsChecking(true);

      const [firstUid, secondUid] = newFlipped;
      const first = cards.find((c) => c.uid === firstUid)!;
      const second = cards.find((c) => c.uid === secondUid)!;

      if (first.animalId === second.animalId) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.uid === firstUid || c.uid === secondUid
                ? { ...c, isMatched: true }
                : c
            )
          );
          setScore((s) => s + 1);
          setFlipped([]);
          setIsChecking(false);
        }, 600);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.uid === firstUid || c.uid === secondUid
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlipped([]);
          setIsChecking(false);
        }, 900);
      }
    } else {
      setFlipped(newFlipped);
    }
  };

  const matchedCount = cards.filter((c) => c.isMatched).length;
  const totalPairs = ANIMALS.length;

  return (
    <div className="flex flex-col items-center min-h-screen py-10 px-4">
      <h1 className="text-4xl font-bold text-orange-600 mb-2 tracking-tight">
        🐾 동물 카드 매치
      </h1>
      <p className="text-gray-500 mb-6 text-sm">
        같은 동물 카드 두 장을 찾아 매치하세요!
      </p>

      {/* Stats bar */}
      {gameState !== "idle" && (
        <div className="flex gap-6 mb-6 bg-white rounded-2xl px-6 py-3 shadow-md">
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">
              {score}
            </div>
            <div className="text-xs text-gray-400">매치</div>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {moves}
            </div>
            <div className="text-xs text-gray-400">시도</div>
          </div>
          {bestScore !== null && (
            <>
              <div className="w-px bg-gray-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">
                  {bestScore}
                </div>
                <div className="text-xs text-gray-400">최고 기록</div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Game finished banner */}
      {gameState === "finished" && (
        <div className="mb-6 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-2xl px-8 py-4 text-center shadow-lg">
          <div className="text-2xl font-bold">🎉 축하해요!</div>
          <div className="text-sm mt-1 opacity-90">
            {moves}번 만에 모든 카드를 매치했어요!
          </div>
        </div>
      )}

      {/* Start / Restart button */}
      {gameState === "idle" ? (
        <button
          onClick={startGame}
          className="mb-8 px-8 py-3 bg-orange-500 hover:bg-orange-400 text-white text-lg font-semibold rounded-full shadow-md transition-all hover:scale-105 active:scale-95"
        >
          게임 시작
        </button>
      ) : (
        <button
          onClick={startGame}
          className="mb-8 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full shadow transition-all hover:scale-105 active:scale-95"
        >
          {gameState === "finished" ? "다시 하기" : "새 게임"}
        </button>
      )}

      {/* Progress bar */}
      {gameState === "playing" && (
        <div className="w-full max-w-md mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>진행도</span>
            <span>
              {matchedCount / 2} / {totalPairs}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${(matchedCount / (totalPairs * 2)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Card grid */}
      {gameState !== "idle" && (
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card) => (
            <button
              key={card.uid}
              onClick={() => handleCardClick(card.uid)}
              disabled={card.isMatched || card.isFlipped || isChecking}
              aria-label={card.isFlipped || card.isMatched ? card.name : "카드"}
              className={`
                relative w-16 h-20 sm:w-20 sm:h-24 select-none
                transition-all duration-300
                ${card.isMatched ? "opacity-60 cursor-default" : "cursor-pointer"}
                ${!card.isFlipped && !card.isMatched ? "hover:-translate-y-1" : ""}
              `}
              style={{ perspective: "600px" }}
            >
              {/* Flipper — rotates in 3D */}
              <div
                className="absolute inset-0 transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform:
                    card.isFlipped || card.isMatched
                      ? "rotateY(0deg)"
                      : "rotateY(180deg)",
                }}
              >
                {/* Front face — emoji */}
                <div
                  className="absolute inset-0 rounded-2xl bg-white shadow-inner flex items-center justify-center text-4xl sm:text-5xl"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className={card.isMatched ? "scale-90" : "scale-100"}>
                    {card.emoji}
                  </span>
                  {card.isMatched && (
                    <span className="absolute top-1 right-1 text-xs">✅</span>
                  )}
                </div>

                {/* Back face — wave pattern */}
                <div
                  className="absolute inset-0 rounded-2xl shadow-md"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    backgroundColor: "#f97316",
                    backgroundImage: WAVE_PATTERN,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {gameState === "idle" && (
        <div className="mt-4 text-center text-gray-400 text-sm">
          <p>16장의 카드, 8쌍의 동물</p>
          <p className="mt-1">같은 그림을 찾아 매치하세요</p>
        </div>
      )}
    </div>
  );
}
