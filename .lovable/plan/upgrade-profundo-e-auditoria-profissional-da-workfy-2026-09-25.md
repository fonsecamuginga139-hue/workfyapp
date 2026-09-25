# Upgrade profundo e auditoria profissional da Workfy

## Objetivo
Evoluir o projeto atual, sem o recriar, para um SaaS mobile-first completo. Preservar o que funciona, eliminar valores inventados e ligar todos os fluxos reais ao Supabase com isolamento rigoroso entre utilizadores.

## 1. Base segura e dados reais
- Auditar e normalizar o modelo atual sem perder biosites existentes.
- Criar estruturas próprias para blocos/seções, mídia, leads, formulários, reservas, serviços, clientes, entregas, chaves de acesso, histórico e preferências de exposição na landing.
- Aplicar RLS por proprietário e por cliente autorizado, privilégios mínimos, validação no servidor e funções seguras.
- Manter uploads privados, registrar metadados e usar links temporários renováveis em vez de links permanentes de dez anos.
- Fortalecer autenticação persistente, recuperação de acesso, estados de sessão e mensagens de erro.

## 2. Construtor profissional de biosites
- Evoluir o editor existente para adicionar, editar, ocultar, duplicar, remover, ordenar e redimensionar blocos.
- Suportar hero/banner, imagem, vídeo, títulos, textos, botões, redes sociais, telefone, WhatsApp, localização, música, formulários, serviços, catálogo e agenda.
- Ampliar personalização de identidade, fontes, fundos, cores, transparência, vidro discreto, alinhamento, tamanho e decoração funcional.
- Implementar preview em tempo real com modos de telefone e desktop, autosave confiável e publicação com validações claras.
- Manter a experiência simples por meio de painéis contextuais e controles adequados a cada propriedade.

## 3. Biosite público e conversão
- Renderizar todos os novos blocos e formatos de mídia com boa performance e acessibilidade.
- Fazer WhatsApp, telefone, mapas, redes, produtos, serviços, música, formulários e reservas funcionarem de ponta a ponta.
- Criar formulários e agendamentos reais, com disponibilidade, estados e proteção contra abuso.
- Adicionar URL pública, QR Code, compartilhamento e SEO básico por biosite.
- Registrar eventos reais e calcular conversão sem métricas fictícias.

## 4. Dashboards do negócio, freelancer e cliente
- Reorganizar a visão geral com dados reais, estados vazios úteis e ações diretas.
- Manter múltiplos biosites e gestão comercial, removendo preços padrão ou números inventados.
- Criar gestão de clientes, entrega do biosite, chave de acesso rotacionável, histórico e mensagem pronta de entrega.
- Dar ao cliente acesso apenas ao biosite entregue e às permissões concedidas, incluindo analytics permitido.
- Remover aparência genérica de IA, animações desnecessárias e excesso de indicadores.

## 5. Landing e vitrine de biosites
- Manter azul, branco e neutros, com transições suaves, rápidas e discretas.
- Substituir o mockup atual por um telefone moderno com proporção real de iPhone.
- Exibir biosites publicados de utilizadores que ativarem “Mostrar na vitrine da Workfy”.
- Considerar automaticamente o primeiro biosite criado como candidato, mas respeitar a escolha explícita do proprietário antes de exposição pública.
- Alternar biosites em mockups com movimento suave da direita para a esquerda, pausa acessível e redução de movimento quando configurada no aparelho.
- Nunca preencher a vitrine com conteúdo inventado; ocultar ou mostrar estado editorial quando não houver opt-ins.

## 6. Auditoria final
- Testar criação de conta, sessão persistente, isolamento entre utilizadores, criação/edição/publicação e acesso público.
- Testar upload, formulário, reserva, WhatsApp, analytics, entrega e acesso do cliente.
- Verificar rotas diretas, refresh, imports, erros no navegador, build e configuração para Vercel.
- Validar telefone estreito, iPhone moderno, tablet e desktop, incluindo teclado, foco, toque e prevenção de zoom involuntário.
- Executar revisão de segurança e corrigir problemas encontrados antes de declarar o projeto pronto.

## Detalhes técnicos
- Evolução incremental sobre React/Vite e Supabase atuais.
- Migrações compatíveis com os dados existentes; novas tabelas sempre com grants, RLS e timestamps.
- Recursos públicos expostos por funções de leitura limitadas; operações privadas sempre vinculadas ao utilizador autenticado.
- Editor baseado em esquema de blocos versionado, mantendo compatibilidade com os campos JSON atuais durante a migração.
- Entrega em etapas internas coerentes, mas com validação completa do fluxo final antes da conclusão.
