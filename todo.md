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
