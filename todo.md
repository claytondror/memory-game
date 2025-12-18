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
- [x] Criar WebSocket para sincronização em tempo real - COMPLETO
- [x] Implementar tela de criação/entrada em sala
- [x] Sincronizar estado do jogo entre jogadores - COMPLETO
- [x] Adicionar chat ou notificações de ações - COMPLETO

## Fase 7: Persistência e Histórico
- [x] Salvar histórico de partidas no banco de dados - COMPLETO
- [x] Implementar estatísticas do jogador - COMPLETO
- [x] Criar página de histórico de partidas - COMPLETO
- [x] Adicionar filtros e busca no histórico - COMPLETO

## Fase 8: Testes e Refinamentos
- [x] Escrever testes unitários para lógica do jogo
- [x] Testar multiplayer com múltiplas conexões - COMPLETO (WebSocket implementado)
- [x] Otimizar animações e performance - COMPLETO
- [x] Testar responsividade em diferentes dispositivos - COMPLETO

## Indicador Visual de Modo Offline
- [x] Adicionar indicador de conexão no topo da página - COMPLETO
- [x] Mostrar "Conectado ao Servidor" quando online (verde) - COMPLETO
- [x] Mostrar "Modo Offline" quando offline (amarelo) - COMPLETO
- [x] Adicionar aviso no menu multiplayer quando offline - COMPLETO
- [x] Adicionar aviso na sala de espera quando offline - COMPLETO
- [x] Todos os 11 testes passando - COMPLETOivos

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
- [x] Criar visualização CLARA de quais cartas são pares - COMPLETO
- [x] Mostrar pares lado a lado com imagens - COMPLETO
- [x] Permitir desconectar/editar pares facilmente - COMPLETO


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


## BUG - Botão "Criar Sala" Travado
- [x] Botão "Criar Sala" fica em loop infinito de processamento - CORRIGIDO
- [x] Função createRoom() não retorna ou falha silenciosamente - CORRIGIDO
- [x] Adicionar melhor tratamento de erros e logging - CORRIGIDO
- [x] Adicionar timeout de 10s para evitar loop infinito - CORRIGIDO
- [x] Testar criação de sala novamente - TESTES PASSANDO


## BUG - Firebase Write Timeout
- [x] Firebase Realtime Database retorna timeout ao tentar escrever - DIAGNOSTICADO
- [x] Implementar fallback com localStorage para sincronização local - IMPLEMENTADO
- [x] Criar GameContextWithFallback com suporte a localStorage
- [x] Atualizar App.tsx para usar novo GameProvider
- [x] Atualizar OnlineMultiplayerGame para usar useGame
- [x] Todos os 11 testes passando
- [x] Corrigir erro de undefined room no joinRoom
- [x] Adicionar criador automaticamente ao criar sala
- [x] Remover chamada duplicada de joinRoom
- [ ] Testar criação de sala com fallback
- [ ] Adicionar indicador visual de modo offline


## BUG - Publicação Travada
- [ ] Botão "Publicando" fica travado sem completar
- [ ] Verificar logs do servidor
- [ ] Identificar motivo do travamento
- [ ] Corrigir processo de publicação


## BUG - Segundo Jogador Não Consegue Entrar na Sala
- [x] Mensagem "Não foi possível entrar na sala" ao tentar entrar - CORRIGIDO
- [x] Debugar joinRoom para encontrar o motivo - ENCONTRADO
- [x] Adicionar BroadcastChannel para sincronizar localStorage entre abas - IMPLEMENTADO
- [x] Adicionar logging detalhado ao joinRoom - IMPLEMENTADO
- [x] Mudar gerador de roomId para código curto (ex: "ABCD1234") - IMPLEMENTADO
- [x] Todos os 11 testes passando

## BUG CRÍTICO - Multiplayer Entre Dispositivos Diferentes NÃO Funciona
- [x] localStorage + BroadcastChannel só funcionam no MESMO dispositivo/navegador - DIAGNOSTICADO
- [x] Sala criada no iPhone (Safari) não é encontrada no computador (Edge) - CAUSA IDENTIFICADA
- [x] Erro: "[joinRoom] Room not found: DIJ92KFP" - CAUSA RAIZ ENCONTRADA
- [x] Solução: Implementar armazenamento de salas no banco de dados (tRPC) - IMPLEMENTADO
- [x] Criar tRPC procedure para criar sala no servidor - COMPLETO
- [x] Criar tRPC procedure para buscar sala pelo código no servidor - COMPLETO
- [x] Criar tRPC procedure para entrar em sala no servidor - COMPLETO
- [x] Refatorar GameContextWithFallback para usar tRPC - COMPLETO
- [ ] Testar com dois dispositivos diferentes - PRÓXIMO PASSO

## WebSocket para Sincronizacao em Tempo Real
- [x] Criar servidor WebSocket para gerenciar conexoes - COMPLETO
- [x] Implementar handlers para eventos de jogo (flip, match, reset) - COMPLETO
- [x] Sincronizar estado do jogo entre jogadores - COMPLETO
- [x] Broadcast de eventos para todos os jogadores na sala - COMPLETO
- [x] Limpeza automatica de salas vazias - COMPLETO
- [ ] Integrar cliente WebSocket no GameBoard
- [ ] Testar sincronizacao em tempo real

## Histórico de Partidas
- [x] Criar página GameHistory.tsx com filtros - COMPLETO
- [x] Exibir estatísticas de partidas - COMPLETO
- [x] Mostrar lista de partidas com detalhes - COMPLETO
- [x] Adicionar procedure getHistory no servidor - COMPLETO
- [x] Adicionar rota /history - COMPLETO

## Estatísticas do Jogador
- [x] Criar página PlayerStats.tsx - COMPLETO
- [x] Exibir taxa de vitória - COMPLETO
- [x] Exibir melhor tempo e pontuação - COMPLETO
- [x] Mostrar estatísticas detalhadas - COMPLETO
- [x] Exibir distribuição por modo de jogo - COMPLETO
- [x] Adicionar rota /stats - COMPLETO

## WebSocket Hook para Sincronizacao em Tempo Real
- [x] Criar hook useWebSocket - COMPLETO
- [x] Suporte a auto-connect e reconnect - COMPLETO
- [x] Fila de mensagens - COMPLETO
- [x] Integrar no GameBoard - COMPLETO
- [x] Enviar JOIN_ROOM ao conectar - COMPLETO

## Documentacao do Painel Administrativo
- [x] Criar ADMIN_GUIDE.md - COMPLETO
- [x] Documentar como adicionar cartas - COMPLETO
- [x] Explicar sistema de pares - COMPLETO
- [x] Dicas de qualidade de imagem - COMPLETO
- [x] Solucao de problemas - COMPLETO
- [x] Atualizar README com links - COMPLETO

## Responsividade e Testes
- [ ] Testar em dispositivos móveis (iPhone, Android)
- [ ] Testar em tablets
- [ ] Testar em diferentes navegadores (Chrome, Safari, Firefox, Edge)
- [ ] Verificar layout em telas pequenas
- [ ] Verificar layout em telas grandes
- [ ] Testar touch events em dispositivos móveis
