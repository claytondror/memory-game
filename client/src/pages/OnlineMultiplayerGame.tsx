import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Check } from "lucide-react";
import GameBoard from "./GameBoard";
import { nanoid } from "nanoid";

export default function OnlineMultiplayerGame() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [gameMode, setGameMode] = useState<"create" | "join" | "playing" | null>(null);
  const [roomId, setRoomId] = useState("");
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generate room ID
  const generateRoomIdHandler = () => {
    setLoading(true);
    try {
      const newRoomId = nanoid(8);
      setRoomId(newRoomId);
      setGameMode("create");
    } catch (error) {
      console.error("Error generating room ID:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoomId(true);
    setTimeout(() => setCopiedRoomId(false), 2000);
  };

  const handleJoinGame = () => {
    if (!roomId.trim()) return;
    setGameMode("playing");
  };

  // If game is playing, show the game board
  if (gameMode === "playing") {
    return <GameBoard mode="online" roomId={roomId} />;
  }

  // If no mode selected, show options
  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-2">Multiplayer Online</h1>
            <p className="text-white text-lg opacity-90">Jogue com um amigo em tempo real</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Room */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CardTitle>Criar Sala</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm">
                  Crie uma nova sala e compartilhe o código com seu amigo
                </p>
                <Button className="w-full" onClick={generateRoomIdHandler} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    "Criar Sala"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Join Room */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CardTitle>Entrar em Sala</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm">
                  Digite o código da sala para entrar
                </p>
                <Input
                  placeholder="Código da sala"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="mb-4"
                />
                <Button
                  className="w-full"
                  onClick={handleJoinGame}
                  disabled={!roomId.trim()}
                >
                  Entrar
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" className="bg-white hover:bg-gray-100" onClick={() => setLocation("/")}>
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show room creation screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sala Criada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-gray-600 text-sm mb-2">Código da Sala:</p>
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-gray-800 font-mono">{roomId}</p>
              </div>
            </div>

            <Button className="w-full" onClick={handleCopyRoomId}>
              {copiedRoomId ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Código
                </>
              )}
            </Button>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Compartilhe este código com seu amigo para que ele possa entrar na sala. Você será conectado assim que ele entrar.
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-sm mb-4">Aguardando outro jogador...</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setLocation("/")}>
              Cancelar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
