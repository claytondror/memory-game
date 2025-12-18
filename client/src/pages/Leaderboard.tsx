import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Target } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  gamesWon: number;
  totalGames: number;
  winRate: string;
  bestTime: number | null;
  averageTime: number | null;
  highestScore: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"wins" | "winRate" | "bestTime" | "score">("wins");

  useEffect(() => {
    // Simular dados de leaderboard
    // Em produção, isso viria de uma API
    const mockData: LeaderboardEntry[] = [
      {
        rank: 1,
        name: "Você",
        gamesWon: 45,
        totalGames: 50,
        winRate: "90%",
        bestTime: 45,
        averageTime: 62,
        highestScore: 1200,
      },
      {
        rank: 2,
        name: "João Silva",
        gamesWon: 38,
        totalGames: 45,
        winRate: "84%",
        bestTime: 52,
        averageTime: 68,
        highestScore: 1050,
      },
      {
        rank: 3,
        name: "Maria Santos",
        gamesWon: 35,
        totalGames: 42,
        winRate: "83%",
        bestTime: 48,
        averageTime: 65,
        highestScore: 980,
      },
      {
        rank: 4,
        name: "Pedro Costa",
        gamesWon: 28,
        totalGames: 40,
        winRate: "70%",
        bestTime: 58,
        averageTime: 75,
        highestScore: 850,
      },
      {
        rank: 5,
        name: "Ana Oliveira",
        gamesWon: 25,
        totalGames: 38,
        winRate: "66%",
        bestTime: 62,
        averageTime: 80,
        highestScore: 780,
      },
    ];

    setLeaderboard(mockData);
    setIsLoading(false);
  }, [sortBy]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-sm font-semibold text-gray-500">#{rank}</span>;
    }
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "-";
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-white/80">Veja os melhores jogadores da comunidade</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          <button
            onClick={() => setSortBy("wins")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              sortBy === "wins"
                ? "bg-white text-purple-600"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Vitórias
          </button>
          <button
            onClick={() => setSortBy("winRate")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              sortBy === "winRate"
                ? "bg-white text-purple-600"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Taxa de Vitória
          </button>
          <button
            onClick={() => setSortBy("bestTime")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              sortBy === "bestTime"
                ? "bg-white text-purple-600"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Melhor Tempo
          </button>
          <button
            onClick={() => setSortBy("score")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              sortBy === "score"
                ? "bg-white text-purple-600"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Maior Pontuação
          </button>
        </div>

        {/* Leaderboard Table */}
        <Card className="bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle>Top 5 Jogadores</CardTitle>
            <CardDescription>Ranking global dos melhores jogadores</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando leaderboard...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                      entry.rank === 1
                        ? "bg-yellow-50 border-2 border-yellow-200"
                        : entry.rank === 2
                          ? "bg-gray-50 border-2 border-gray-200"
                          : entry.rank === 3
                            ? "bg-orange-50 border-2 border-orange-200"
                            : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{entry.name}</p>
                      <p className="text-sm text-gray-500">
                        {entry.gamesWon} vitórias de {entry.totalGames} partidas
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm">
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1 block">
                          {entry.winRate}
                        </Badge>
                        <p className="text-xs text-gray-500">Taxa</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatTime(entry.bestTime)}
                        </p>
                        <p className="text-xs text-gray-500">Melhor</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{entry.highestScore}</p>
                        <p className="text-xs text-gray-500">Pontos</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Sua Posição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">#1</p>
              <p className="text-sm text-gray-500 mt-1">Você é o melhor jogador!</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Próxima Meta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">50</p>
              <p className="text-sm text-gray-500 mt-1">vitórias para o badge especial</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-orange-500" />
                Streak Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">8</p>
              <p className="text-sm text-gray-500 mt-1">vitórias consecutivas</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
