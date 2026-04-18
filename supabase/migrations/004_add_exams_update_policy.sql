-- Permitir UPDATE e INSERT na tabela exams (para seed scripts)
DROP POLICY IF EXISTS "exams: service insert" ON exams;
CREATE POLICY "exams: public insert" ON exams FOR INSERT WITH CHECK (true);
CREATE POLICY "exams: public update" ON exams FOR UPDATE USING (true) WITH CHECK (true);
