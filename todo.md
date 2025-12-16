# Jogo da Memória Online - TODO

## Fase 1: Estrutura Base e Banco de Dados
- [x] Definir schema do banco de dados (cartas, imagens, partidas, jogadores)
- [x] Criar tabelas: cards, games, game_sessions, game_moves
- [x] Implementar migrações do banco de dados

## Fase 2: Painel Administrativo
- [x] Criar página de admin para gerenciar imagens
- [x] Implementar upload de imagens (frente e verso das cartas)
- [x] Criar interface para visualizar e deletar imagens
- [x] Implementar proteção de acesso (apenas criador)
- [x] Armazenar URLs das imagens no S3

## Fase 3: Interface Base do Jogo
- [x] Criar tela inicial com seleção de modo de jogo
- [x] Implementar grid de cartas com animações
- [x] Adicionar lógica de virar cartas ao clicar
- [x] Implementar embaralhamento automático

## Fase 4: Lógica de Jogo Single Player
- [x] Implementar verificação de pares
- [x] Adicionar contador de movimentos
- [x] Criar tela de vitória com estatísticas
- [x] Implementar sistema de pontuação

## Fase 5: Modo 2 Jogadores Local
- [x] Implementar alternância de turnos
- [x] Criar placar individual para cada jogador
- [x] Adicionar indicador de turno atual
- [x] Implementar lógica de ganho/perda de pontos por turno

## Fase 6: Multiplayer Online
- [x] Implementar sistema de rooms/salas
- [ ] Criar WebSocket para sincronização em tempo real
- [x] Implementar tela de criação/entrada em sala
- [ ] Sincronizar estado do jogo entre jogadores
- [ ] Adicionar chat ou notificações de ações

## Fase 7: Persistência e Histórico
- [ ] Salvar histórico de partidas no banco de dados
- [ ] Implementar estatísticas do jogador
- [ ] Criar página de histórico de partidas
- [ ] Adicionar filtros e busca no histórico

## Fase 8: Testes e Refinamentos
- [x] Escrever testes unitários para lógica do jogo
- [ ] Testar modo multiplayer com múltiplas conexões
- [ ] Otimizar animações e performance
- [ ] Testar responsividade em diferentes dispositivos

## Fase 9: Deploy e Documentação
- [ ] Criar checkpoint final
- [ ] Documentar como usar o painel administrativo
- [ ] Preparar para publicação

## Bugs Reportados
- [x] Erro na página /game/single - API retorna HTML em vez de JSON (cardImages.list query) - CORRIGIDO
- [x] Investigar por que a query de cardImages está falhando - CORRIGIDO com fallback para cartas de demonstração

- [x] Corrigir inputs de arquivo no painel administrativo - botões não funcionam - CORRIGIDO

- [x] Corrigir lógica de flip das cartas - está invertida (mostrando verso em vez de frente) - CORRIGIDO
- [x] Aumentar tamanho das cartas para 63.5mm x 88.9mm (padrão de cartas de jogo) - CORRIGIDO

- [x] Corrigir ordem das imagens - verso deveria aparecer inicialmente, frente após clicar - CORRIGIDO (ajuste final de backfaceVisibility)

- [x] BUG CRÍTICO: Imagens estão trocadas - verso mostra frente e vice-versa - RESOLVIDO (era seleção incorreta do usuário)

## Novo Requisito: Sistema de Pares Relacionados
- [x] Refatorar lógica de pares: não mais cartas idênticas, mas cartas relacionadas - COMPLETO
- [x] Atualizar schema do banco para permitir relacionamento entre pares - COMPLETO
- [ ] Modificar painel admin para permitir definir qual é o par de cada carta - EM PROGRESSO
- [x] Atualizar lógica de verificação de pares no jogo - COMPLETO
- [ ] Testar com cartas emoção + versículo

## BUG CRÍTICO - Sistema de Pares
- [x] Painel admin não tem interface para configurar pares - CORRIGIDO com modal visual
- [x] PROBLEMA RAIZ: Relacionamento de pares não era bidirecional - CORRIGIDO
- [x] Quando configura Carta A = par de Carta B, agora Carta B também sabe que é par de Carta A
- [x] Relacionamento BIDIRECIONAL: A ↔ B - IMPLEMENTADO
- [x] Atualizar mutation setPair para configurar ambos os lados - COMPLETO
- [ ] Criar visualização CLARA de quais cartas são pares
- [ ] Mostrar pares lado a lado com imagens
- [ ] Permitir desconectar/editar pares facilmente


## BUG CRÍTICO - Jogo Não Funciona com Cartas Reais
- [x] Jogo mostra 8 cartas de demonstração em vez das 4 cartas reais (2 pares) que foram adicionadas - CORRIGIDO
- [x] Cartas reais não estão sendo carregadas - CORRIGIDO (gridSize estava fixo em 12)
- [x] Pares não são reconhecidos como encontrados - cartas viram de volta mesmo quando acerta - CORRIGIDO
- [x] Lógica de comparação de pairId no GameBoard estava falhando - CORRIGIDO


## Integração Firebase Realtime Database
- [x] Instalar Firebase SDK
- [x] Configurar credenciais do Firebase
- [x] Criar FirebaseGameContext para gerenciar salas
- [x] Implementar createRoom() para criar salas
- [x] Implementar joinRoom() para entrar em salas
- [x] Implementar leaveRoom() para sair de salas
- [x] Implementar subscribeToRoom() para sincronização em tempo real
- [x] Refatorar OnlineMultiplayerGame.tsx para usar Firebase
- [x] Adicionar GameBoard.tsx com suporte a Firebase
- [x] Criar testes vitest para validar sincronização
- [x] Todos os testes passando (11 testes)
- [x] Criar arquivo firebase.ts com configuração hardcoded
- [x] Corrigir inicialização do Firebase no Context
- [x] Adicionar fallback para getFirebaseDatabase em todos os métodos
- [ ] Testar multiplayer online com dois navegadores
- [ ] Validar sincronização de estado do jogo
- [ ] Validar sincronização de placar entre jogadores
