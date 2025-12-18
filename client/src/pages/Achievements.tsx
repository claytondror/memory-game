import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  earned: boolean;
  earnedAt?: string;
}

const ACHIEVEMENTS_DATA: Achievement[] = [
  {
    id: 1,
    code: "first_win",
    name: "Primeira Vitória",
    description: "Vença sua primeira partida",
    icon: "🎮",
    rarity: "common",
    earned: true,
    earnedAt: "2024-01-15",
  },
  {
    id: 2,
    code: "ten_wins",
    name: "Dez Vitórias",
    description: "Vença 10 partidas",
    icon: "⭐",
    rarity: "uncommon",
    earned: true,
    earnedAt: "2024-01-20",
  },
  {
    id: 3,
    code: "hundred_wins",
    name: "Centésima Vitória",
    description: "Vença 100 partidas",
    icon: "🏆",
    rarity: "rare",
    earned: false,
  },
  {
    id: 4,
    code: "perfect_game",
    name: "Jogo Perfeito",
    description: "Vença sem cometer erros",
    icon: "💯",
    rarity: "epic",
    earned: false,
  },
  {
    id: 5,
    code: "speed_demon",
    name: "Demônio da Velocidade",
    description: "Complete um jogo em menos de 30 segundos",
    icon: "⚡",
    rarity: "rare",
    earned: false,
  },
  {
    id: 6,
    code: "streak_five",
    name: "Cinco em Sequência",
    description: "Vença 5 partidas consecutivas",
    icon: "🔥",
    rarity: "uncommon",
    earned: true,
    earnedAt: "2024-01-18",
  },
  {
    id: 7,
    code: "multiplayer_master",
    name: "Mestre do Multiplayer",
    description: "Vença 50 partidas online",
    icon: "👥",
    rarity: "epic",
    earned: false,
  },
  {
    id: 8,
    code: "collector",
    name: "Colecionador",
    description: "Desbloqueie 8 achievements diferentes",
    icon: "🎁",
    rarity: "legendary",
    earned: false,
  },
];

const rarityColors = {
  common: "bg-gray-100 text-gray-800 border-gray-300",
  uncommon: "bg-green-100 text-green-800 border-green-300",
  rare: "bg-blue-100 text-blue-800 border-blue-300",
  epic: "bg-purple-100 text-purple-800 border-purple-300",
  legendary: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all");

  useEffect(() => {
    setAchievements(ACHIEVEMENTS_DATA);
  }, []);

  const filteredAchievements = achievements.filter((ach) => {
    if (filter === "earned") return ach.earned;
    if (filter === "locked") return !ach.earned;
    return true;
  });

  const earnedCount = achievements.filter((ach) => ach.earned).length;
  const totalCount = achievements.length;
  const progressPercentage = Math.round((earnedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏅 Achievements</h1>
          <p className="text-white/80">Desbloqueie badges e conquiste milestones</p>
        </div>

        {/* Progress Card */}
        <Card className="bg-white/95 backdrop-blur mb-6">
          <CardHeader>
            <CardTitle>Seu Progresso</CardTitle>
            <CardDescription>
              {earnedCount} de {totalCount} achievements desbloqueados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-center text-2xl font-bold text-purple-600">{progressPercentage}%</p>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === "all"
                ? "bg-white text-purple-600"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Todos ({achievements.length})
          </button>
          <button
            onClick={() => setFilter("earned")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === "earned"
                ? "bg-white text-purple-600"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Desbloqueados ({earnedCount})
          </button>
          <button
            onClick={() => setFilter("locked")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === "locked"
                ? "bg-white text-purple-600"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Bloqueados ({totalCount - earnedCount})
          </button>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`relative transition-all duration-300 ${
                achievement.earned ? "opacity-100" : "opacity-75 hover:opacity-100"
              }`}
            >
              <Card
                className={`h-full ${
                  achievement.earned
                    ? `bg-white/95 backdrop-blur border-2 border-${
                        achievement.rarity === "legendary"
                          ? "yellow"
                          : achievement.rarity === "epic"
                            ? "purple"
                            : "gray"
                      }-300`
                    : "bg-gray-800/50 backdrop-blur border-2 border-gray-600"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{achievement.icon}</div>
                    {!achievement.earned && (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <CardTitle className="text-lg mt-2">{achievement.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge
                      className={`${
                        rarityColors[achievement.rarity]
                      } border capitalize`}
                    >
                      {achievement.rarity}
                    </Badge>
                    {achievement.earned && achievement.earnedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(achievement.earnedAt).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/80 text-lg">
              {filter === "earned"
                ? "Você ainda não desbloqueou nenhum achievement"
                : "Nenhum achievement bloqueado para mostrar"}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm">Rarity Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Common</span>
                <span className="font-semibold">
                  {achievements.filter((a) => a.rarity === "common" && a.earned).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Uncommon</span>
                <span className="font-semibold">
                  {achievements.filter((a) => a.rarity === "uncommon" && a.earned).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rare</span>
                <span className="font-semibold">
                  {achievements.filter((a) => a.rarity === "rare" && a.earned).length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm">Próximos Objetivos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Dez Vitórias</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "70%" }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">7/10 vitórias</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Desbloqueado</span>
                <span className="font-semibold">{earnedCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de Conclusão</span>
                <span className="font-semibold">{progressPercentage}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
