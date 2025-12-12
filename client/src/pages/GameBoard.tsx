import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { RotateCcw, Home } from "lucide-react";

interface Card {
  id: number;
  imageId: number;
  frontImageUrl: string;
  backImageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameBoardProps {
  mode: "single" | "local" | "online";
  roomId?: string;
}

export default function GameBoard({ mode, roomId }: GameBoardProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Fetch card images
  const { data: cardImages = [], isLoading, error } = trpc.cardImages.list.useQuery();

  // Game state
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Player state for multiplayer
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [players, setPlayers] = useState<Array<{ id: number; name: string; score: number }>>([] as Array<{ id: number; name: string; score: number }>);
  const [gameSessionId, setGameSessionId] = useState<number | null>(null);

  // Initialize game with demo cards if no images available
  useEffect(() => {
    // Create demo cards if no images available
    if (cardImages.length === 0 && !isLoading) {
      const demoCards: Card[] = [];
      const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F"];
      
      colors.forEach((color, index) => {
        demoCards.push({
          id: index * 2,
          imageId: index,
          frontImageUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='${encodeURIComponent(color)}' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='40' fill='white' text-anchor='middle' dy='.3em'%3E${index + 1}%3C/text%3E%3C/svg%3E`,
          backImageUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%234169E1' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='60' fill='white' text-anchor='middle' dy='.3em'%3E%3F%3C/text%3E%3C/svg%3E`,
          isFlipped: false,
          isMatched: false,
        });
        demoCards.push({
          id: index * 2 + 1,
          imageId: index,
          frontImageUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='${encodeURIComponent(color)}' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='40' fill='white' text-anchor='middle' dy='.3em'%3E${index + 1}%3C/text%3E%3C/svg%3E`,
          backImageUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%234169E1' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='60' fill='white' text-anchor='middle' dy='.3em'%3E%3F%3C/text%3E%3C/svg%3E`,
          isFlipped: false,
          isMatched: false,
        });
      });
      
      const shuffled = demoCards.sort(() => Math.random() - 0.5);
      setCards(shuffled);
      
      if (mode === "single") {
        setPlayers([{ id: user?.id || 0, name: user?.name || "Você", score: 0 }]);
      } else if (mode === "local") {
        setPlayers([
          { id: 1, name: "Jogador 1", score: 0 },
          { id: 2, name: "Jogador 2", score: 0 },
        ]);
      }
      
      setGameStarted(true);
      return;
    }
    
    if (cardImages.length === 0) return;

    // Create pairs of cards from fetched images
    const gridSize = 12; // 6 pairs
    const pairsNeeded = gridSize / 2;
    const selectedImages = cardImages.slice(0, pairsNeeded);

    const newCards: Card[] = [];
    selectedImages.forEach((image, index) => {
      // Add pair
      newCards.push({
        id: index * 2,
        imageId: image.id,
        frontImageUrl: image.frontImageUrl,
        backImageUrl: image.backImageUrl,
        isFlipped: false,
        isMatched: false,
      });
      newCards.push({
        id: index * 2 + 1,
        imageId: image.id,
        frontImageUrl: image.frontImageUrl,
        backImageUrl: image.backImageUrl,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle cards
    const shuffled = newCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);

    // Initialize players
    if (mode === "single") {
      setPlayers([{ id: user?.id || 0, name: user?.name || "Você", score: 0 }]);
    } else if (mode === "local") {
      setPlayers([
        { id: 1, name: "Jogador 1", score: 0 },
        { id: 2, name: "Jogador 2", score: 0 },
      ]);
    }

    setGameStarted(true);
  }, [cardImages, mode, user, isLoading]);

  // Handle card click
  const handleCardClick = (index: number) => {
    if (!gameStarted || gameCompleted) return;
    if (flippedCards.includes(index)) return;
    if (cards[index].isMatched) return;
    if (flippedCards.length === 2) return;

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const isMatch = cards[first].imageId === cards[second].imageId;

      setTimeout(() => {
        if (isMatch) {
          // Match found
          setMatchedPairs([...matchedPairs, first, second]);
          setCards((prevCards) =>
            prevCards.map((card, idx) =>
              idx === first || idx === second ? { ...card, isMatched: true } : card
            )
          );

          // Update player score
          if (mode === "single" || mode === "local") {
            setPlayers((prevPlayers: Array<{ id: number; name: string; score: number }>) =>
              prevPlayers.map((player, idx) =>
                idx === currentPlayer ? { ...player, score: player.score + 1 } : player
              )
            );
          }

          // Check if game is completed
          if (matchedPairs.length + 2 === cards.length) {
            setGameCompleted(true);
          }
        } else {
          // No match - flip back
          setCards((prevCards) =>
            prevCards.map((card, idx) =>
              idx === first || idx === second ? { ...card, isFlipped: false } : card
            )
          );

          // Switch player in multiplayer mode
          if (mode === "local") {
            setCurrentPlayer((prev) => (prev + 1) % 2);
          }
        }

        setFlippedCards([]);
        setMoves((prev) => prev + 1);
      }, 600);
    }
  };

  // Reset game
  const handleReset = () => {
    window.location.reload();
  };

  if (!gameStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <div className="text-center">
          {error ? (
            <>
              <p className="text-lg text-white mb-4">Erro ao carregar imagens</p>
              <p className="text-sm text-white opacity-75">Usando cartas de demonstração</p>
            </>
          ) : (
            <p className="text-lg text-white">Carregando jogo...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Jogo da Memória</h1>
            <p className="text-white opacity-90">Movimentos: {moves}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
              <Home className="w-4 h-4 mr-2" />
              Menu
            </Button>
          </div>
        </div>

        {/* Player Info */}
        {mode === "local" && (
          <div className="flex gap-4 mb-8">
            {players.map((player: typeof players[0], idx: number) => (
              <div
                key={idx}
                className={`flex-1 p-4 rounded-lg ${
                  idx === currentPlayer
                    ? "bg-white shadow-lg"
                    : "bg-white bg-opacity-50"
                }`}
              >
                <p className="text-sm text-gray-600">Turno: {player.name}</p>
                <p className="text-2xl font-bold text-gray-800">{player.score} pares</p>
              </div>
            ))}
          </div>
        )}

        {/* Game Board */}
        <div className="grid grid-cols-4 gap-4 mb-8 bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              onClick={() => handleCardClick(index)}
              className="cursor-pointer perspective"
              style={{ aspectRatio: "63.5 / 88.9" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="relative w-full h-full"
                animate={{ rotateY: flippedCards.includes(index) || card.isMatched ? 0 : 180 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front of card (shown when not flipped) */}
                <div
                  className="absolute w-full h-full bg-white rounded-lg flex items-center justify-center shadow-lg overflow-hidden"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <img
                    src={card.frontImageUrl}
                    alt="card-front"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Back of card (shown when flipped) */}
                <div
                  className="absolute w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center cursor-pointer shadow-lg"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <img
                    src={card.backImageUrl}
                    alt="card-back"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Game Completed */}
        {gameCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div className="bg-white rounded-lg p-8 text-center max-w-md">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Parabéns!</h2>
              <p className="text-gray-600 mb-6">
                {mode === "single"
                  ? `Você completou o jogo em ${moves} movimentos!`
                  : `${players[currentPlayer].name} venceu com ${players[currentPlayer].score} pares!`}
              </p>
              <div className="flex gap-4">
                <Button className="flex-1" onClick={handleReset}>
                  Jogar Novamente
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setLocation("/")}>
                  Menu
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
