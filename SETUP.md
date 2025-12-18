# 🚀 Guia de Configuração Local

Este guia fornece instruções passo a passo para configurar e rodar o **Jogo da Memória Online** em seu computador.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### 1. Node.js e npm/pnpm
- **Node.js 22.13.0 ou superior**
  - Download: https://nodejs.org/
  - Verifique a versão: `node --version`

- **pnpm** (gerenciador de pacotes recomendado)
  - Instale globalmente: `npm install -g pnpm`
  - Verifique a versão: `pnpm --version`

### 2. Git
- Download: https://git-scm.com/
- Verifique: `git --version`

### 3. Banco de Dados MySQL/TiDB
Você tem 2 opções:

#### Opção A: MySQL Local (Recomendado para desenvolvimento)
- Download: https://dev.mysql.com/downloads/mysql/
- Ou use Docker: `docker run --name mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:latest`

#### Opção B: TiDB Cloud (Gratuito)
- Crie conta em: https://tidbcloud.com/
- Crie um cluster gratuito
- Copie a connection string

## 🔧 Passo 1: Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/claytondror/memory-game.git

# Entre na pasta
cd memory-game
```

## 📦 Passo 2: Instalar Dependências

```bash
# Instale todas as dependências
pnpm install

# Isso pode levar alguns minutos na primeira vez
```

## 🗄️ Passo 3: Configurar Banco de Dados

### 3.1 Criar arquivo `.env.local`

Na raiz do projeto, crie um arquivo chamado `.env.local`:

```bash
# Copie o arquivo de exemplo (se existir)
cp .env.example .env.local

# Ou crie manualmente
touch .env.local
```

### 3.2 Adicionar variáveis de ambiente

Abra `.env.local` e adicione:

```env
# Banco de Dados
DATABASE_URL=mysql://root:root@localhost:3306/memory_game

# Autenticação
JWT_SECRET=seu_segredo_super_secreto_aqui_12345

# OAuth (Manus - opcional para desenvolvimento local)
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# S3 (opcional - para upload de imagens)
# Se não configurar, usará fallback local
```

**Nota:** Para desenvolvimento local, você pode usar valores fictícios para OAuth e S3. O projeto funcionará sem eles.

### 3.3 Criar banco de dados

```bash
# Se estiver usando MySQL local, crie o banco:
mysql -u root -p -e "CREATE DATABASE memory_game;"

# Ou use TiDB Cloud (já criado automaticamente)
```

### 3.4 Executar migrações

```bash
# Isso criará as tabelas no banco de dados
pnpm db:push
```

Você deve ver uma mensagem como:
```
✓ migrations applied successfully!
```

## 🚀 Passo 4: Iniciar o Servidor de Desenvolvimento

```bash
# Inicie o servidor
pnpm dev
```

Você deve ver algo como:
```
[OAuth] Initialized with baseURL: https://api.manus.im
Server running on http://localhost:3000/
```

## 🌐 Passo 5: Acessar o Aplicativo

Abra seu navegador e acesse:

```
http://localhost:3000
```

## ✅ Verificar se Tudo Está Funcionando

### 1. Página Inicial Carrega
- Você deve ver a tela inicial com 3 opções de modo de jogo

### 2. Single Player Funciona
- Clique em "Single Player"
- Você deve ver cartas de demonstração
- Clique nas cartas para virá-las

### 3. Testes Passam
```bash
# Execute os testes
pnpm test

# Resultado esperado: 11 testes passando
```

## 🛠️ Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Rodar testes
pnpm test

# Build para produção
pnpm build

# Executar build em produção
pnpm start

# Verificar tipos TypeScript
pnpm type-check

# Limpar cache
pnpm clean

# Atualizar banco de dados
pnpm db:push

# Gerar migrações
pnpm db:generate
```

## 🐛 Troubleshooting

### Erro: "Cannot find module 'drizzle-orm'"
```bash
# Reinstale as dependências
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro: "ECONNREFUSED - MySQL não está rodando"
```bash
# Se usar Docker:
docker run --name mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:latest

# Se usar MySQL local, inicie o serviço:
# Windows: net start MySQL80
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql
```

### Erro: "Database connection failed"
- Verifique se a `DATABASE_URL` está correta em `.env.local`
- Teste a conexão: `mysql -u root -p -h localhost`
- Certifique-se de que o banco de dados `memory_game` foi criado

### Porta 3000 já está em uso
```bash
# Use outra porta
PORT=3001 pnpm dev

# Ou mate o processo usando a porta 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000
```

### Cartas não aparecem no jogo
- Vá para `/admin` (se estiver autenticado como admin)
- Faça upload de imagens de cartas
- Recarregue a página do jogo

## 📱 Testar Multiplayer Local

### Em 2 abas do navegador:
1. Abra `http://localhost:3000` em 2 abas
2. Em uma aba, clique "2 Jogadores Local"
3. Ambas as abas devem mostrar o jogo
4. Clique nas cartas em uma aba
5. A outra aba deve atualizar automaticamente

### Entre dispositivos (mesma rede):
1. Descubra o IP do seu computador: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
2. Em outro dispositivo, acesse: `http://SEU_IP:3000`
3. Crie uma sala e compartilhe o código

## 🔐 Autenticação Local

Para testar recursos que requerem autenticação:

1. O projeto usa Manus OAuth
2. Para desenvolvimento, você pode:
   - Usar a autenticação real (requer credenciais)
   - Ou modificar o código para pular autenticação

Para pular autenticação em desenvolvimento:
```typescript
// Em client/src/lib/trpc.ts
// Comente a verificação de autenticação
```

## 📊 Estrutura de Pastas Importante

```
memory-game/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas principais
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── contexts/         # GameProvider
│   │   └── lib/              # Utilitários
│   └── index.html            # Arquivo HTML principal
├── server/                    # Backend Node.js
│   ├── routers.ts            # Procedures tRPC
│   ├── db.ts                 # Funções de banco
│   └── _core/                # Configuração interna
├── drizzle/                   # Banco de dados
│   ├── schema.ts             # Definição de tabelas
│   └── migrations/           # Histórico de mudanças
├── .env.local                # Variáveis de ambiente (criar)
├── package.json              # Dependências
└── README.md                 # Este arquivo
```

## 🎮 Próximos Passos

Depois de configurar:

1. **Explore o código**: Entenda a estrutura do projeto
2. **Adicione cartas**: Vá para `/admin` e faça upload de imagens
3. **Configure pares**: Defina quais cartas são pares
4. **Teste multiplayer**: Crie salas e convide amigos
5. **Customize**: Modifique cores, fontes, animações

## 📚 Documentação Adicional

- [README.md](./README.md) - Visão geral do projeto
- [Documentação React](https://react.dev)
- [Documentação tRPC](https://trpc.io)
- [Documentação Tailwind](https://tailwindcss.com)
- [Documentação Drizzle](https://orm.drizzle.team)

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique se todos os pré-requisitos estão instalados
2. Leia o arquivo [SETUP.md](./SETUP.md) novamente
3. Procure no [GitHub Issues](https://github.com/claytondror/memory-game/issues)
4. Abra uma nova issue descrevendo o problema

## ✨ Dicas de Desenvolvimento

### Hot Reload
O projeto usa Vite com hot reload. Qualquer mudança no código é refletida automaticamente no navegador.

### TypeScript
O projeto usa TypeScript. Erros de tipo são mostrados no console e no editor.

### Testes
Escreva testes para suas mudanças:
```bash
# Criar arquivo de teste
touch server/sua-feature.test.ts

# Rodar testes
pnpm test
```

### Debugging
```bash
# Use console.log para debugging
console.log("Valor:", valor);

# Ou use o debugger do navegador (F12)
```

---

**Pronto para começar? Boa sorte! 🎉**
