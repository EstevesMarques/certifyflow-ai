-- Desempenho: evita sequential scan em question_attempts
-- Usado pela query de weakest topics em /api/generate-question
CREATE INDEX IF NOT EXISTS idx_question_attempts_user_topic
ON question_attempts(user_id, topic_tag, is_correct);
