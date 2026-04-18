**Nome do Projeto:** CertifyFlow AI
**Objetivo:** Aplicativo web progressivo (PWA) para simulação de exames de certificação Microsoft, focado em aprendizado adaptativo.
**Público-alvo:** Profissionais de TI que buscam certificações Microsoft.

**Arquitetura Técnica:**
*   **Frontend:** Next.js (App Router), Tailwind CSS, Shadcn/UI (foco em estética clean/Microsoft), Framer Motion (animações).
*   **Backend:** Next.js Serverless Functions (API Routes).
*   **Banco de Dados & Auth:** Supabase (PostgreSQL).
*   **Integrações de IA:** 
    *   OpenAI API (GPT-4o) para geração de questões e análise de gaps de conhecimento.
    *   Microsoft Catalog API para listagem dinâmica de exames.
    *   (Opcional) Tavily Search API para busca de conteúdos atualizados no Microsoft Learn.
*   **Deployment:** Vercel.

**Funcionalidades Principais:**
1.  **Catálogo Dinâmico:** Consumir a Microsoft Catalog API para exibir exames disponíveis.
2.  **Motor de Questões Adaptativo:** O sistema deve consultar o histórico do usuário no Supabase. Se o usuário falhou em "Networking", o prompt da OpenAI deve priorizar esse tópico.
3.  **Simulador de Prova (PearsonVue Style):** Interface de questão única, cronômetro, barra de progresso, marcação de questões para revisão e feedback imediato após o simulado.
4.  **Dashboard de Progresso:** Gráficos de desempenho por área de conhecimento e sugestões de estudo baseadas nos erros.