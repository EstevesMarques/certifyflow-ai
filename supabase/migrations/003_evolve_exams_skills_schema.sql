-- Evoluir tabela exams para suportar catálogo rico e geração de questões
-- Compatível com dados existentes (fallbacks aplicados)

-- 1. Renomear updated_at -> last_updated
ALTER TABLE exams RENAME COLUMN updated_at TO last_updated;

-- 2. Adicionar skills_measured (jsonb) — estrutura de tópicos com peso e subtopics
ALTER TABLE exams ADD COLUMN IF NOT EXISTS skills_measured jsonb;

-- 3. Adicionar external_id (text) — referência opcional ao catálogo externo
ALTER TABLE exams ADD COLUMN IF NOT EXISTS external_id text;

-- 4. Comentários para documentação
COMMENT ON COLUMN exams.skills_measured IS 'Array of topic objects: [{topic, weight, subtopics[]}]';
COMMENT ON COLUMN exams.external_id IS 'External catalog reference (e.g., Microsoft exam code)';
COMMENT ON COLUMN exams.last_updated IS 'Last update timestamp from external catalog';

-- 5. Criar índice GIN para queries em skills_measured
CREATE INDEX IF NOT EXISTS idx_exams_skills_measured ON exams USING gin (skills_measured);

-- 6. Função helper com fallback — retorna skills_measured ou fallback baseado no título
CREATE OR REPLACE FUNCTION get_exam_topics(p_exam_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_skills jsonb;
  v_title text;
BEGIN
  SELECT skills_measured, title INTO v_skills, v_title
  FROM exams WHERE id = p_exam_id;

  IF v_skills IS NOT NULL AND jsonb_array_length(v_skills) > 0 THEN
    RETURN v_skills;
  END IF;

  RETURN jsonb_build_array(
    jsonb_build_object(
      'topic', v_title,
      'weight', '20-30%',
      'subtopics', jsonb_build_array('General knowledge')
    )
  );
END;
$$;

-- 7. Função para extrair topic_tags de um exam
CREATE OR REPLACE FUNCTION get_exam_topic_tags(p_exam_id text)
RETURNS text[] LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_skills jsonb;
  v_result text[] := ARRAY[]::text[];
  v_item jsonb;
BEGIN
  SELECT skills_measured INTO v_skills FROM exams WHERE id = p_exam_id;

  IF v_skills IS NULL THEN
    RETURN ARRAY['General knowledge']::text[];
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_skills)
  LOOP
    v_result := array_append(v_result, v_item->>'topic');
  END LOOP;

  RETURN COALESCE(v_result, ARRAY['General knowledge']::text[]);
END;
$$;
