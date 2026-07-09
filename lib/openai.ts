interface SkillItem {
  topic: string
  weight: string
  subtopics: string[]
}

function formatTopics(enriched: SkillItem[]) {
  return enriched
    .map(t => {
      const subs = t.subtopics.map(s => `  - ${s}`).join('\n')
      return `Tópico: ${t.topic} (peso: ${t.weight}%)\nSubtópicos:\n${subs}`
    })
    .join('\n\n')
}

export function buildPrompt(
  examId: string,
  weakTopics: string[],
  askedTopics: string[] = [],
  skills_measured?: SkillItem[] | null,
  learningContent?: string
): string {
  const topicLine = weakTopics.length > 0
    ? `Priorize os seguintes tópicos (onde o usuário tem maior dificuldade): ${weakTopics.join(', ')}.`
    : 'Escolha um tópico relevante para o exame.';

  const avoidLine = askedTopics.length > 0
    ? `\n\nIMPORTANTE: Evite completamente os tópicos já perguntados: ${askedTopics.join(', ')}. Gere uma questão sobre um tópico diferente.`
    : '';

  const skillsSection =
    skills_measured && skills_measured.length > 0
      ? `\n\nSKILLS OFICIAIS DO EXAME (USO OBRIGATÓRIO):\n${formatTopics(skills_measured)}\n\nREGRAS OBRIGATÓRIAS:\n- A questão DEVE ser baseada EXCLUSIVAMENTE nos skills listados acima\n- Escolha EXATAMENTE UM subtópico dos skills fornecidos\n- NÃO use conhecimento fora da lista de skills\n- Priorize tópicos com maior peso (weight) MAS NÃO ignore completamente tópicos de menor peso`
      : `\n\nNOTA: Os skills oficiais deste exame não estão disponíveis. Use seu conhecimento sobre o exame ${examId} para gerar uma questão relevante e precisa.`

  const hasSkills = skills_measured && skills_measured.length > 0

  const rulesSection = hasSkills
    ? ``
    : `\nREGRAS OBRIGATÓRIAS:\n- Use tecnologias, serviços e ferramentas relevantes ao exame (${examId})\n- A pergunta deve refletir cenário real de uso em produção (arquitetura, integração, troubleshooting)`

  const contentSection = learningContent
    ? `\n\n${learningContent}\n\nIMPORTANTE: Use o conteúdo acima como FONTE PRIMÁRIA para criar a questão. A questão deve testar conceitos e detalhes presentes neste conteúdo oficial do Microsoft Learn.`
    : ''

  return `Exame de certificação Microsoft: ${examId}. ${topicLine}${avoidLine}${skillsSection}${rulesSection}${contentSection}

  Gere UMA questão de múltipla escolha no estilo PearsonVue, simulando uma questão REAL de prova da Microsoft.

  Retorne APENAS um objeto JSON com a seguinte estrutura exata (sem markdown, sem texto extra):
  {
    "question": "enunciado da questão",
    "options": {
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "..."
    },
    "correct_answer": "X", // onde X é A, B, C ou D
    "explanation": "explicação detalhada da resposta correta",
    "topic_tag": "nome-do-topico-em-slug"
  }`;
}
