import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, TrendingUp, Award, Zap, Clock, Target } from "lucide-react";

export default function PlayerStats() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Fetch game history
  const { data: gameSessions = [] } = trpc.game.getHistory.useQuery({});

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Minhas Estatísticas</h1>
          <p className="text-white mb-8">Você precisa estar logado para ver suas estatísticas.</p>
          <Button onClick={() => setLocation("/")} className="bg-white text-purple-600 hover:bg-gray-100">
            Voltar ao Menu
          </Button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalGames = gameSessions.length;
  const completedGames = gameSessions.filter(g => g.status === "completed").length;
  const abandonedGames = gameSessions.filter(g => g.status === "abandoned").length;
  const winRate = totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0;

  const totalTime = gameSessions.reduce((sum, g) => sum + (g.totalSeconds || 0), 0);
  const avgTime = totalGames > 0 ? Math.round(totalTime / totalGames) : 0;
  const minTime = totalGames > 0 ? Math.min(...gameSessions.map(g => g.totalSeconds || 0)) : 0;
  const maxTime = totalGames > 0 ? Math.max(...gameSessions.map(g => g.totalSeconds || 0)) : 0;

  const totalMoves = gameSessions.reduce((sum, g) => sum + (g.totalMoves || 0), 0);
  const avgMoves = totalGames > 0 ? Math.round(totalMoves / totalGames) : 0;
  const minMoves = totalGames > 0 ? Math.min(...gameSessions.map(g => g.totalMoves || 0)) : 0;
  const maxMoves = totalGames > 0 ? Math.max(...gameSessions.map(g => g.totalMoves || 0)) : 0;

  // By mode
  const singleGames = gameSessions.filter(g => g.mode === "single").length;
  const localGames = gameSessions.filter(g => g.mode === "local").length;
  const onlineGames = gameSessions.filter(g => g.mode === "online").length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Minhas Estatísticas</h1>
            <p className="text-white opacity-90">Análise detalhada do seu desempenho</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
            <Home className="w-4 h-4 mr-2" />
            Menu
          </Button>
        </div>

        {/* Main Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Win Rate */}
          <Card className="border-2 border-green-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="w-12 h-12 mx-auto text-green-500 mb-3" />
                <p className="text-gray-600 text-sm font-semibold">TAXA DE VITÓRIA</p>
                <p className="text-5xl font-bold text-green-600 mt-2">{winRate}%</p>
                <p className="text-gray-600 text-xs mt-2">{completedGames} de {totalGames} partidas</p>
              </div>
            </CardContent>
          </Card>

          {/* Best Time */}
          <Card className="border-2 border-blue-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="w-12 h-12 mx-auto text-blue-500 mb-3" />
                <p className="text-gray-600 text-sm font-semibold">MELHOR TEMPO</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{formatTime(minTime)}</p>
                <p className="text-gray-600 text-xs mt-2">Tempo médio: {formatTime(avgTime)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Best Moves */}
          <Card className="border-2 border-purple-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto text-purple-500 mb-3" />
                <p className="text-gray-600 text-sm font-semibold">MELHOR PONTUAÇÃO</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{minMoves}</p>
                <p className="text-gray-600 text-xs mt-2">Movimentos médios: {avgMoves}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Time Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Estatísticas de Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-gray-700">Tempo Total</span>
                  <span className="font-bold text-blue-600">{formatTime(totalTime)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-gray-700">Tempo Médio</span>
                  <span className="font-bold text-blue-600">{formatTime(avgTime)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-gray-700">Melhor Tempo</span>
                  <span className="font-bold text-green-600">{formatTime(minTime)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                  <span className="text-gray-700">Pior Tempo</span>
                  <span className="font-bold text-red-600">{formatTime(maxTime)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Move Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Estatísticas de Movimentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="text-gray-700">Total de Movimentos</span>
                  <span className="font-bold text-purple-600">{totalMoves}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="text-gray-700">Movimentos Médios</span>
                  <span className="font-bold text-purple-600">{avgMoves}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="text-gray-700">Melhor Pontuação</span>
                  <span className="font-bold text-green-600">{minMoves}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                  <span className="text-gray-700">Pior Pontuação</span>
                  <span className="font-bold text-red-600">{maxMoves}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Mode Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Modo de Jogo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                <p className="text-gray-700 font-semibold mb-2">🎮 Single Player</p>
                <p className="text-3xl font-bold text-blue-600">{singleGames}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {totalGames > 0 ? Math.round((singleGames / totalGames) * 100) : 0}% do total
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
                <p className="text-gray-700 font-semibold mb-2">👥 Local (2 Jogadores)</p>
                <p className="text-3xl font-bold text-green-600">{localGames}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {totalGames > 0 ? Math.round((localGames / totalGames) * 100) : 0}% do total
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg border border-purple-200">
                <p className="text-gray-700 font-semibold mb-2">🌐 Online</p>
                <p className="text-3xl font-bold text-purple-600">{onlineGames}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {totalGames > 0 ? Math.round((onlineGames / totalGames) * 100) : 0}% do total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Resumo Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-gray-600 text-sm">Total de Partidas</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{totalGames}</p>
              </div>
              <div className="p-4 bg-green-50 rounded border border-green-200">
                <p className="text-gray-600 text-sm">Concluídas</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{completedGames}</p>
              </div>
              <div className="p-4 bg-red-50 rounded border border-red-200">
                <p className="text-gray-600 text-sm">Abandonadas</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{abandonedGames}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-gray-600 text-sm">Em Progresso</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{totalGames - completedGames - abandonedGames}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <Button onClick={() => setLocation("/")} className="bg-white text-purple-600 hover:bg-gray-100">
            Voltar ao Menu
          </Button>
          <Button onClick={() => setLocation("/history")} variant="outline" className="bg-white">
            Ver Histórico Completo
          </Button>
        </div>
      </div>
    </div>
  );
}
