import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Eye, EyeOff, Upload, Home, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [cardName, setCardName] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Refs for file inputs
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Fetch all card images
  const { data: cardImages = [], refetch } = trpc.cardImages.listAll.useQuery();

  // Mutations
  const createCardMutation = trpc.cardImages.create.useMutation({
    onSuccess: () => {
      toast.success("Carta criada com sucesso!");
      setCardName("");
      setFrontImage(null);
      setBackImage(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar carta: " + error.message);
    },
  });

  const deleteCardMutation = trpc.cardImages.delete.useMutation({
    onSuccess: () => {
      toast.success("Carta deletada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao deletar carta: " + error.message);
    },
  });

  const toggleActiveMutation = trpc.cardImages.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-white mb-8">Você não tem permissão para acessar o painel administrativo.</p>
          <Button onClick={() => setLocation("/")} className="bg-white text-purple-600 hover:bg-gray-100">
            Voltar ao Menu
          </Button>
        </div>
      </div>
    );
  }

  const handleFrontImageClick = () => {
    frontInputRef.current?.click();
  };

  const handleBackImageClick = () => {
    backInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "front") {
        setFrontImage(file);
      } else {
        setBackImage(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!cardName.trim() || !frontImage || !backImage) {
      toast.error("Preencha todos os campos!");
      return;
    }

    setUploading(true);
    try {
      // Convert images to base64
      const frontBase64 = await fileToBase64(frontImage);
      const backBase64 = await fileToBase64(backImage);

      await createCardMutation.mutateAsync({
        name: cardName,
        frontImageBase64: frontBase64,
        backImageBase64: backBase64,
      });
    } catch (error) {
      console.error("Error uploading:", error);
      toast.error("Erro ao fazer upload das imagens!");
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-white opacity-90">Gerenciar imagens das cartas</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
            <Home className="w-4 h-4 mr-2" />
            Menu
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Nova Carta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Nome da Carta
                  </label>
                  <Input
                    placeholder="Ex: Gato"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Imagem da Frente
                  </label>
                  <button
                    onClick={handleFrontImageClick}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    {frontImage ? (
                      <div>
                        <img
                          src={URL.createObjectURL(frontImage)}
                          alt="preview"
                          className="w-24 h-24 object-cover mx-auto rounded mb-2"
                        />
                        <p className="text-sm text-gray-600 font-medium">{frontImage.name}</p>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Clique para selecionar imagem</p>
                      </div>
                    )}
                  </button>
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "front")}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Imagem do Verso
                  </label>
                  <button
                    onClick={handleBackImageClick}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    {backImage ? (
                      <div>
                        <img
                          src={URL.createObjectURL(backImage)}
                          alt="preview"
                          className="w-24 h-24 object-cover mx-auto rounded mb-2"
                        />
                        <p className="text-sm text-gray-600 font-medium">{backImage.name}</p>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Clique para selecionar imagem</p>
                      </div>
                    )}
                  </button>
                  <input
                    ref={backInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "back")}
                    className="hidden"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleUpload}
                  disabled={uploading || createCardMutation.isPending}
                >
                  {uploading || createCardMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Adicionar Carta
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Card List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cartas Existentes ({cardImages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {cardImages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma carta adicionada ainda. Crie uma acima!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {cardImages.map((card) => (
                      <div
                        key={card.id}
                        className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <div className="aspect-square bg-gray-200 relative overflow-hidden">
                          <img
                            src={card.frontImageUrl}
                            alt={card.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                toggleActiveMutation.mutate({
                                  id: card.id,
                                  isActive: !card.isActive,
                                })
                              }
                            >
                              {card.isActive ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteCardMutation.mutate({ id: card.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm text-gray-800 truncate">
                            {card.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {card.isActive ? "Ativa" : "Inativa"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
