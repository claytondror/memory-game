import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Calendar, Clock, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";

export default function GameHistory() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [filterMode, setFilterMode] = useState<"all" | "single" | "local" | "online">("all");

  // Fetch game history
  const { data: gameSessions = [], isLoading } = trpc.game.getHistory.useQuery({
    mode: filterMode === "all" ? undefined : filterMode,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Histórico de Partidas</h1>
          <p className="text-white mb-8">Você precisa estar logado para ver seu histórico.</p>
          <Button onClick={() => setLocation("/")} className="bg-white text-purple-600 hover:bg-gray-100">
            Voltar ao Menu
          </Button>
        </div>
      </div>
    );
  }

  const totalGames = gameSessions.length;
  const completedGames = gameSessions.filter((g: any) => g.status === "completed").length;
  const totalTime = gameSessions.reduce((sum: number, g: any) => sum + (g.totalSeconds || 0), 0);
  const avgMoves = totalGames > 0 ? Math.round(gameSessions.reduce((sum: number, g: any) => sum + (g.totalMoves || 0), 0) / totalGames) : 0;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      single: "🎮 Single Player",
      local: "👥 Local (2 Jogadores)",
      online: "🌐 Online",
    };
    return labels[mode] || mode;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      active: { label: "Em Progresso", color: "bg-blue-100 text-blue-800" },
      completed: { label: "Concluído", color: "bg-green-100 text-green-800" },
      abandoned: { label: "Abandonado", color: "bg-gray-100 text-gray-800" },
    };
    return labels[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Histórico de Partidas</h1>
            <p className="text-white opacity-90">Veja todas as suas partidas e estatísticas</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
            <Home className="w-4 h-4 mr-2" />
            Menu
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">Total de Partidas</p>
                <p className="text-3xl font-bold text-gray-800">{totalGames}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">Concluídas</p>
                <p className="text-3xl font-bold text-gray-800">{completedGames}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">Tempo Total</p>
                <p className="text-3xl font-bold text-gray-800">{formatTime(totalTime)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">Movimentos Médios</p>
                <p className="text-3xl font-bold text-gray-800">{avgMoves}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "single", "local", "online"] as const).map((mode) => (
            <Button
              key={mode}
              variant={filterMode === mode ? "default" : "outline"}
              onClick={() => setFilterMode(mode)}
              className={filterMode === mode ? "bg-white text-purple-600" : "bg-white/80"}
            >
              {mode === "all" ? "Todas" : getModeLabel(mode).split(" ")[1]}
            </Button>
          ))}
        </div>

        {/* Game List */}
        <Card>
          <CardHeader>
            <CardTitle>Partidas ({gameSessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Carregando histórico...</p>
              </div>
            ) : gameSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhuma partida encontrada.</p>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="mt-4"
                >
                  Jogar Agora
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {gameSessions.map((game: any) => {
                  const statusInfo = getStatusLabel(game.status);
                  return (
                    <div
                      key={game.id || Math.random()}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50"
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{getModeLabel(game.mode)}</span>
                            <span className={`text-xs px-2 py-1 rounded ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDate(game.createdAt)}
                          </p>
                        </div>

                        <div className="flex gap-6 text-center">
                          <div>
                            <p className="text-xs text-gray-600">Movimentos</p>
                            <p className="text-lg font-bold text-gray-800">{game.totalMoves}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Tempo</p>
                            <p className="text-lg font-bold text-gray-800">{formatTime(game.totalSeconds)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
