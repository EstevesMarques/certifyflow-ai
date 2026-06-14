-- Tabela única para armazenar conteúdo de aprendizagem do Microsoft Learn
-- source_type: learning_path | module | unit
-- parent_uid referencia o source_uid do item pai (module -> learning_path, unit -> module)
CREATE TABLE IF NOT EXISTS learning_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id text NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('learning_path', 'module', 'unit')),
  source_uid text NOT NULL,
  title text NOT NULL,
  summary text,
  content text,
  parent_uid text,
  sort_order int DEFAULT 0,
  duration_minutes int,
  skills_tags text[],
  url text,
  ingested_at timestamptz DEFAULT now(),
  UNIQUE(exam_id, source_uid)
);

-- Índice para busca por exam_id + skills_tags
CREATE INDEX IF NOT EXISTS idx_learning_content_exam_tags
  ON learning_content USING gin (skills_tags)
  WHERE skills_tags IS NOT NULL AND array_length(skills_tags, 1) > 0;

-- Índice para busca por exam_id + source_type
CREATE INDEX IF NOT EXISTS idx_learning_content_exam_type
  ON learning_content (exam_id, source_type);

-- RLS
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;

-- Leitura pública (necessário para o gerador de questões acessar conteúdo)
CREATE POLICY "learning_content: public read"
  ON learning_content FOR SELECT
  USING (true);

-- Inserção/atualização apenas via service_role (sync/ingest)
CREATE POLICY "learning_content: service all"
  ON learning_content FOR ALL
  USING (true)
  WITH CHECK (true);
