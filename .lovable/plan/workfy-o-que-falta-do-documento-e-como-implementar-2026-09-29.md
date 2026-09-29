# Workfy — O que falta do documento e como implementar

Comparei as 70 secções do documento com o que existe hoje na app. Abaixo está o que já existe, o que falta, e a ordem para implementar em fases (cada fase fica testável sozinha).

## Já existe (manter)
- Login com Supabase, sessão que fica guardada, cada utilizador vê só os seus dados, uploads privados.
- Editor com os separadores Identidade, Catálogo, WhatsApp, Localização, Horário, Marcação, Redes sociais e Aparência.
- Blocos (adicionar, editar, ocultar, duplicar, reordenar com setas, mudar tamanho), Serviços e Formulários de contacto.
- Página pública com serviços, formulários e blocos; separador Leads no painel (só leitura).
- Vitrine da landing com mockups de celular e opt-in; bloqueio de zoom; Vendas retirado do painel.

## O que falta

### Fase 1 — Editor completo (secções 3–18, 59–60)
- Arrastar blocos com o dedo para reordenar (além das setas).
- Bloco Hero/Banner: imagem ou vídeo de fundo, título, subtítulo, botão, escurecimento por cima e altura.
- Bloco Título/Texto com opções de tamanho, peso, alinhamento e cor.
- Fontes: escolher entre 6 a 8 fontes profissionais para títulos e para texto.
- Estilo avançado por bloco: cantos, sombra, borda, espaçamento e alinhamento.
- Fundo: cor, imagem, vídeo ou degradê suave, com escurecimento.
- Efeito vidro discreto (ligar/desligar e intensidade).
- Figurinhas/elementos decorativos simples com posição e tamanho.
- Bloco de botões personalizados: ícone, cor, estilo, ordem e ocultar.
- Pré-visualização ao vivo, lado a lado no computador e em tela cheia no celular.

### Fase 2 — Catálogo, mídia e serviços (secções 5–7, 26)
- Vídeo nos itens do catálogo, com a opção de tocar em silêncio e em loop.
- Editar serviços já criados (hoje só dá para criar, ocultar e remover), marcar em destaque, preço promocional e ordem.
- Ligações de mídia que não expiram (hoje as ligações duram 7 dias).

### Fase 3 — Contacto, música, formulários (secções 19–22)
- Botão de telefone normal separado do WhatsApp.
- WhatsApp com mensagem pronta e botão fixo no ecrã (opcional).
- Bloco Spotify com pré-visualização do leitor dentro do editor.
- Construtor de formulário: adicionar, remover e ordenar campos, marcar como obrigatório, tipos (texto, email, telefone, escolha, data).

### Fase 4 — Reservas e leads (secções 23, 25)
- Mostrar o formulário de marcação na página pública (o componente já existe, mas falta ligá-lo aos serviços com o botão "Agendar").
- Horários disponíveis calculados a partir do horário de funcionamento e da duração do serviço.
- No painel: mudar o estado de leads (novo, contactado, fechado) e de reservas (pendente, confirmada, cancelada), pesquisar, filtrar e responder por WhatsApp com um toque.

### Fase 5 — Painel e analytics (secções 27–33, 43, 54–55)
- Visão geral: visitas, cliques por botão, leads e reservas por período (7, 30 ou 90 dias).
- Taxa de conversão real (leads + reservas ÷ visitas), sem números estimados.
- Gráfico simples por dia e botões mais clicados.
- Painel de freelancer: lista de biosites com estado, cliente, progresso e entrega.
- Rever cartões e textos para tirar o que ainda soa a IA.

### Fase 6 — Entrega ao cliente (secções 34–42)
Hoje o banco de dados já suporta isto, mas não há ecrãs.
- Botão "Entregar ao cliente": escolher o cliente, gerar a chave de acesso e mostrar a mensagem pronta para enviar por WhatsApp.
- Página de entrada do cliente (link do biosite + chave de 16 caracteres).
- Editor do cliente limitado pelas permissões (editar, leads, reservas, analytics).
- Histórico de entregas, trocar a chave e desativar o acesso.
- Analytics só do biosite do cliente.

### Fase 7 — Selo, SEO e partilha (secções 24, 61–64)
- Selo "Criado com Workfy" configurável (texto, ligar ou desligar).
- Título, descrição e imagem de partilha editáveis por biosite.
- Pré-visualização correta no WhatsApp e nas redes sociais (exige resposta do servidor, através de uma função no Supabase).
- Botão de partilha nativo e QR code na página pública.

### Fase 8 — Landing, mobile, desempenho e auditoria (secções 47–53, 56–58, 65–70)
- Landing: parar a animação contínua de escrita no topo e rever cada secção para ficar mais sóbria.
- Editor no celular: barra de separadores que desliza e painéis que cabem no ecrã.
- Desempenho: carregar os ecrãs pesados só quando são abertos e as imagens de forma preguiçosa.
- Segurança: tratar os 20 avisos antigos do Supabase (funções expostas ao público, proteção contra senhas vazadas).
- Auditoria final: testar cada botão e link, cada rota e o fluxo completo com uma conta real.

## Pontos a decidir
- **Vendas no Gerenciador:** tirar também o cartão "Total Vendido", o filtro "Vendidos" e o botão "Venda & Preço"? O plano parte do princípio de que sim.
- **Testes com sessão iniciada:** não consigo entrar na sua conta a partir daqui, por isso cada fase precisa de ser confirmada por si na pré-visualização.

## Detalhes técnicos
- Novos campos em `biosites.appearance` (fontes, fundo, vidro) e `biosite_blocks.appearance`/`content` (JSON). Não são precisas tabelas novas nas fases 1–3.
- Fase 4: migration com `status` e validação por trigger em leads e bookings, e uma função RPC para os horários livres.
- Fase 5: RPC `get_biosite_analytics` com intervalo de datas e série diária.
- Fase 6: usa as tabelas `biosite_deliveries`/`history` e as RPCs `rotate_biosite_access_key` e `get_client_biosite`, que já existem. Faltam uma RPC de edição do cliente validada pela chave e uma rota `/cliente`.
- Fase 7: Edge Function que devolve HTML com as meta tags OG para os crawlers.
- Arrastar para reordenar: `@dnd-kit/sortable`.
- Remover do código `SalesDashboard.tsx` e `SellBiositeModal.tsx` se a remoção for confirmada.
