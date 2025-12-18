# 🎮 Jogo da Memória Online - A Era das Emoções com Cecília

Um jogo interativo de memória com suporte para um ou dois jogadores locais e multiplayer online em tempo real. Personalize as imagens das cartas e jogue com amigos em dispositivos diferentes!

## ✨ Funcionalidades

### 🎯 Modos de Jogo
- **Single Player**: Jogue sozinho com contador de movimentos
- **2 Jogadores Local**: Jogue com um amigo no mesmo computador com placar individual
- **Multiplayer Online**: Jogue com amigos em dispositivos diferentes usando código de sala

### 🎨 Personalização
- **Painel Administrativo**: Gerenciar imagens das cartas (frente e verso)
- **Upload para S3**: Armazene suas imagens na nuvem
- **Sistema de Pares**: Configure quais cartas são pares (ex: emoção + versículo)

### 🔄 Sincronização
- **Banco de Dados Centralizado**: Salas criadas em um dispositivo são encontradas em outro
- **Fallback Local**: Funciona mesmo se o servidor estiver indisponível
- **BroadcastChannel**: Sincronização entre abas do navegador

## 🚀 Como Começar

### Pré-requisitos
- Node.js 22.13.0 ou superior
- npm ou pnpm
- Conta MySQL/TiDB para o banco de dados

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/claytondror/memory-game.git
cd memory-game
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
# Crie um arquivo .env.local com:
DATABASE_URL=mysql://usuario:senha@host:porta/database
JWT_SECRET=sua_chave_secreta
# ... outras variáveis necessárias
```

4. Configure o banco de dados:
```bash
pnpm db:push
```

5. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

6. Acesse em seu navegador:
```
http://localhost:3000
```

## 🎮 Como Jogar

### Single Player
1. Clique em "Single Player"
2. Vire as cartas para encontrar pares
3. Veja seu score ao final

### 2 Jogadores Local
1. Clique em "2 Jogadores Local"
2. Jogador 1 e Jogador 2 se alternam
3. Quem encontrar mais pares vence!

### Multiplayer Online
1. **Criador da Sala**: Clique em "Multiplayer Online" → "Criar Sala"
2. Copie o código da sala (ex: `DIJ92KFP`)
3. **Outro Jogador**: Clique em "Multiplayer Online" → "Entrar em Sala"
4. Digite o código e aguarde o jogo começar
5. Jogue em tempo real!

## 🛠️ Painel Administrativo

### Acessar
- Faça login como admin
- Acesse `/admin` ou clique no menu administrativo

### Gerenciar Cartas
1. **Upload de Imagens**: Selecione frente e verso das cartas
2. **Configurar Pares**: Clique no ícone de link para definir qual é o par
3. **Ativar/Desativar**: Controle quais cartas aparecem no jogo
4. **Deletar**: Remova cartas que não quer mais

## 📁 Estrutura do Projeto

```
memory_game/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas do jogo
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # Contextos (GameProvider)
│   │   └── lib/           # Utilitários (tRPC, Firebase)
│   └── public/            # Arquivos estáticos
├── server/                # Backend Node.js + Express
│   ├── routers.ts         # Procedures tRPC
│   ├── db.ts              # Funções de banco de dados
│   └── _core/             # Configuração interna
├── drizzle/               # Migrações do banco de dados
├── storage/               # Utilitários de S3
└── shared/                # Código compartilhado
```

## 🗄️ Banco de Dados

### Tabelas Principais
- **users**: Usuários autenticados
- **card_images**: Imagens das cartas (frente/verso)
- **game_rooms**: Salas multiplayer online
- **game_sessions**: Sessões de jogo
- **game_participants**: Jogadores em cada sessão
- **game_moves**: Histórico de movimentos

## 🔐 Autenticação

O projeto usa **Manus OAuth** para autenticação. Apenas o criador/admin pode:
- Gerenciar imagens de cartas
- Configurar pares
- Acessar o painel administrativo

## 🧪 Testes

Execute os testes unitários:
```bash
pnpm test
```

Resultado esperado: **11 testes passando**

## 🚢 Deploy

### Opção 1: Manus (Recomendado)
O projeto já está configurado para deploy na plataforma Manus:
1. Clique no botão "Publish" na interface
2. Escolha um domínio
3. Pronto! Seu jogo está online

### Opção 2: Vercel/Netlify
```bash
# Build para produção
pnpm build

# Deploy no Vercel/Netlify
vercel deploy
```

## 📊 Tecnologias Utilizadas

### Frontend
- **React 19**: Framework UI
- **TypeScript**: Tipagem estática
- **Tailwind CSS 4**: Estilos
- **Framer Motion**: Animações
- **tRPC**: Chamadas ao backend
- **Vite**: Build tool

### Backend
- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **tRPC**: API type-safe
- **Drizzle ORM**: Gerenciamento de banco de dados
- **MySQL/TiDB**: Banco de dados

### Infraestrutura
- **S3**: Armazenamento de imagens
- **Firebase Realtime Database**: Sincronização (fallback)
- **BroadcastChannel**: Sincronização entre abas
- **Manus OAuth**: Autenticação

## 🐛 Troubleshooting

### "Não foi possível entrar na sala"
- Verifique se o código da sala está correto
- Certifique-se de que a sala ainda está ativa (não expirou)
- Tente recarregar a página

### Imagens não aparecem
- Verifique se as imagens foram enviadas corretamente no painel admin
- Confirme que as imagens estão ativas (checkbox marcado)
- Tente fazer upload novamente

### Jogo travado no "Aguardando outro jogador"
- Verifique sua conexão com a internet
- Tente recarregar a página
- Crie uma nova sala se necessário

## 📝 Roadmap

- [ ] Chat em tempo real entre jogadores
- [ ] Histórico de partidas e estatísticas
- [ ] Ranking de jogadores
- [ ] Temas personalizáveis
- [ ] Suporte para mais de 2 jogadores online
- [ ] Modo de jogo com tempo limite

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👤 Autor

**Clayton Dror**
- GitHub: [@claytondror](https://github.com/claytondror)
- Repositório: [memory-game](https://github.com/claytondror/memory-game)

## 🙏 Agradecimentos

- Desenvolvido com Manus
- Inspirado em clássicos jogos de memória
- Dedicado a todos os jogadores de memória por aí!

## 📞 Suporte

Tem dúvidas ou encontrou um bug? 
- Abra uma [Issue](https://github.com/claytondror/memory-game/issues)
- Envie um email para suporte

---

**Aproveite o jogo! 🎉**
