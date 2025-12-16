import { useState } from "react";
import { useLocation } from "wouter";
import { useGame } from "@/contexts/GameContextWithFallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import GameBoard from "./GameBoard";

export default function OnlineMultiplayerGame() {
  const [, setLocation] = useLocation();
  const game = useGame();
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [gameMode, setGameMode] = useState<"menu" | "create" | "join" | "playing">("menu");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast.error("Por favor, digite seu nome");
      return;
    }

    setIsLoading(true);
    console.log("[handleCreateRoom] Starting...");
    try {
      console.log("[handleCreateRoom] Calling game.createRoom()...");
      const newRoomId = await game.createRoom();
      console.log("[handleCreateRoom] Room created:", newRoomId);
      setRoomCode(newRoomId);
      setGameMode("create");
      
      console.log("[handleCreateRoom] Joining room as creator...");
      await game.joinRoom(newRoomId, playerName);
      console.log("[handleCreateRoom] Joined successfully");
      toast.success("Sala criada com sucesso!");
    } catch (error) {
      console.error("[handleCreateRoom] Error:", error);
      const msg = error instanceof Error ? error.message : "Desconhecido";
      toast.error(`Erro ao criar sala: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast.error("Por favor, digite o código da sala");
      return;
    }

    if (!playerName.trim()) {
      toast.error("Por favor, digite seu nome");
      return;
    }

    setIsLoading(true);
    try {
      const success = await game.joinRoom(roomCode, playerName);
      if (success) {
        toast.success("Entrou na sala com sucesso!");
        setGameMode("playing");
      } else {
        toast.error("Não foi possível entrar na sala");
      }
    } catch (error) {
      toast.error("Erro ao entrar na sala");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Código copiado!");
  };

  const handleLeaveRoom = async () => {
    await game.leaveRoom();
    setGameMode("menu");
    setRoomCode("");
    setPlayerName("");
    toast.success("Saiu da sala");
  };

  if (gameMode === "playing" && game.roomId && game.players.length >= 1) {
    return (
      <GameBoard
        mode="online"
        roomId={game.roomId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-red-500 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {gameMode === "menu" && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Multiplayer Online</h1>
            <p className="text-white/80 mb-8">Jogue com amigos em tempo real</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Criar Sala */}
              <Card className="bg-white/95 backdrop-blur">
                <CardHeader>
                  <CardTitle>Criar Sala</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Crie uma nova sala e compartilhe o código com seu amigo
                  </p>
                  <Input
                    placeholder="Seu nome"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleCreateRoom}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Sala"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Entrar em Sala */}
              <Card className="bg-white/95 backdrop-blur">
                <CardHeader>
                  <CardTitle>Entrar em Sala</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Digite o código da sala para entrar
                  </p>
                  <Input
                    placeholder="Seu nome"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    disabled={isLoading}
                  />
                  <Input
                    placeholder="Código da sala"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleJoinRoom}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Button
              variant="outline"
              onClick={() => setLocation("/")}
              className="mt-6"
            >
              Voltar
            </Button>
          </div>
        )}

        {gameMode === "create" && (
          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle>Sala Criada!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Código da Sala:</p>
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <p className="text-2xl font-mono font-bold">{game.roomId}</p>
                </div>
              </div>

              <Button
                onClick={handleCopyCode}
                className="w-full"
                variant="outline"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Código Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Código
                  </>
                )}
              </Button>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  Compartilhe este código com seu amigo para que ele possa entrar na sala. Você será conectado assim que ele entrar.
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Aguardando outro jogador...</p>
                <p className="text-2xl font-bold text-purple-600">
                  {game.players.length}/2
                </p>
              </div>

              {game.players.length === 2 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-900">
                    ✓ Segundo jogador conectado! Iniciando jogo...
                  </p>
                </div>
              )}

              <Button
                onClick={handleLeaveRoom}
                variant="destructive"
                className="w-full"
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
