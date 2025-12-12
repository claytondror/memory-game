import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Users, Gamepad2, Globe } from "lucide-react";

export default function GameMode() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">Jogo da Memória</h1>
          <p className="text-white text-lg opacity-90">Escolha como você quer jogar</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Single Player */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/game/single")}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Gamepad2 className="w-12 h-12 text-purple-600" />
              </div>
              <CardTitle>Um Jogador</CardTitle>
              <CardDescription>Jogue sozinho e bata seus recordes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Começar</Button>
            </CardContent>
          </Card>

          {/* Local Multiplayer */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/game/local")}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="w-12 h-12 text-pink-600" />
              </div>
              <CardTitle>2 Jogadores Local</CardTitle>
              <CardDescription>Jogue com um amigo no mesmo computador</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Começar</Button>
            </CardContent>
          </Card>

          {/* Online Multiplayer */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/game/online")}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Globe className="w-12 h-12 text-red-600" />
              </div>
              <CardTitle>Multiplayer Online</CardTitle>
              <CardDescription>Jogue com amigos em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Começar</Button>
            </CardContent>
          </Card>
        </div>

        {/* Admin Panel Link */}
        {user?.role === "admin" && (
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              className="bg-white hover:bg-gray-100"
              onClick={() => setLocation("/admin")}
            >
              Painel Administrativo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
