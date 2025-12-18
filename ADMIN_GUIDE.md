# Guia do Painel Administrativo

## Visão Geral

O painel administrativo permite que você gerencie todas as cartas do jogo da memória. Você pode adicionar imagens, configurar pares relacionados e controlar quais cartas estão ativas no jogo.

**Acesso:** `/admin` (apenas para administradores)

---

## Seções do Painel

### 1. Adicionar Novas Cartas

**Localização:** Seção "Adicionar Nova Carta"

**Como adicionar uma carta:**

1. Clique em **"Selecionar Imagem da Frente"** para escolher a imagem que aparecerá quando a carta for virada
2. Clique em **"Selecionar Imagem do Verso"** para escolher a imagem que aparecerá quando a carta estiver fechada
3. Digite um **nome descritivo** para a carta (ex: "Alegria", "Salmo 23")
4. Clique em **"Adicionar Carta"** para salvar

**Dicas:**
- Use imagens com proporção 63.5mm × 88.9mm (padrão de cartas de jogo)
- Mantenha o verso consistente para todas as cartas
- Nomes descritivos ajudam a organizar as cartas

---

### 2. Gerenciar Cartas Existentes

**Localização:** Seção "Cartas Existentes"

Aqui você pode ver todas as cartas que foram adicionadas ao sistema.

**Ações disponíveis:**

- **Ativar/Desativar:** Use o toggle para controlar se a carta aparece no jogo
- **Deletar:** Remova a carta do sistema (não pode ser desfeito)
- **Editar Imagens:** Clique na carta para atualizar as imagens

---

### 3. Configurar Pares de Cartas

**Localização:** Seção "Configurar Pares"

O jogo da memória funciona com **pares relacionados** (não cartas idênticas). Por exemplo:
- Uma carta com a emoção "Alegria" é pareada com um versículo sobre alegria
- Uma carta com a emoção "Esperança" é pareada com um versículo sobre esperança

**Como configurar pares:**

1. Veja a lista de **"Cartas Sem Par"** (cartas que ainda não têm um par)
2. Clique em **"Parear"** em uma carta
3. Uma janela modal aparecerá mostrando:
   - A carta selecionada (esquerda)
   - Todas as cartas disponíveis para parear (direita)
4. Clique na carta que deseja parear com a primeira
5. O sistema confirmará o pareamento

**Visualização de Pares:**

A seção **"Visualização de Pares"** mostra:
- **Pares Configurados (Verde):** Cartas que já têm um par
  - Mostra as duas cartas lado a lado
  - Botão para desconectar o par se necessário
  
- **Cartas Sem Par (Amarelo):** Cartas que ainda precisam de um par
  - Botão para parear com outra carta

**Dica:** Certifique-se de que TODAS as cartas têm um par antes de jogar. Cartas sem par não aparecerão no jogo.

---

## Fluxo de Trabalho Recomendado

### Primeiro Acesso

1. **Adicione as imagens do verso**
   - Use uma imagem consistente para o verso de todas as cartas
   - Exemplo: um padrão ou logo do seu jogo

2. **Adicione as cartas da frente**
   - Adicione as emoções (ex: Alegria, Tristeza, Esperança, Medo)
   - Adicione os versículos correspondentes

3. **Configure os pares**
   - Pareie cada emoção com seu versículo correspondente
   - Verifique se todas as cartas têm um par

4. **Teste o jogo**
   - Vá para a página inicial e jogue
   - Verifique se os pares estão funcionando corretamente

### Atualizações Futuras

- **Adicionar mais cartas:** Repita o fluxo acima
- **Modificar cartas:** Delete a antiga e adicione uma nova
- **Desativar cartas:** Use o toggle em vez de deletar para manter o histórico

---

## Dicas e Boas Práticas

### Qualidade de Imagem

- **Tamanho recomendado:** 300×400 pixels (proporção 3:4)
- **Formato:** PNG ou JPG
- **Tamanho do arquivo:** Máximo 5MB por imagem
- **Resolução:** Pelo menos 150 DPI para impressão

### Organização

- Use nomes descritivos e consistentes
- Agrupe cartas por tema (ex: "Emoção - Alegria", "Versículo - Salmo 23")
- Mantenha um documento externo com a lista de pares para referência

### Pareamento

- Certifique-se de que cada par faz sentido semanticamente
- Teste o jogo regularmente para validar os pares
- Considere o nível de dificuldade ao criar pares

### Performance

- Limite-se a 20-30 cartas (10-15 pares) para melhor performance
- Imagens muito grandes podem deixar o jogo lento
- Use compressão de imagem quando possível

---

## Solução de Problemas

### Cartas não aparecem no jogo

**Possíveis causas:**
- A carta está desativada (toggle em OFF)
- A carta não tem um par configurado
- As imagens não foram carregadas corretamente

**Solução:**
1. Verifique se a carta está ativada
2. Verifique se tem um par na seção "Visualização de Pares"
3. Tente deletar e re-adicionar a carta com novas imagens

### Pares não funcionam corretamente

**Possíveis causas:**
- O pareamento foi feito incorretamente
- Há cartas duplicadas com o mesmo ID

**Solução:**
1. Desconecte o par e pareie novamente
2. Teste o jogo com apenas 2 pares para validar
3. Verifique o console do navegador (F12) para mensagens de erro

### Imagens não carregam

**Possíveis causas:**
- Arquivo muito grande
- Formato não suportado
- Problema com a conexão S3

**Solução:**
1. Comprima a imagem (máximo 5MB)
2. Use PNG ou JPG
3. Tente novamente ou contate o suporte

---

## Recursos Adicionais

- **Documentação do Jogo:** Veja [README.md](./README.md)
- **Guia de Configuração:** Veja [SETUP.md](./SETUP.md)
- **Histórico de Partidas:** Acesse `/history` para ver estatísticas
- **Estatísticas do Jogador:** Acesse `/stats` para análise detalhada

---

## Suporte

Se encontrar problemas ou tiver dúvidas:

1. Verifique este guia
2. Consulte a documentação do projeto
3. Abra uma issue no GitHub
4. Contate o desenvolvedor

---

**Última atualização:** Dezembro 2024
**Versão:** 1.0
