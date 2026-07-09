-- Add AI provider settings to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_provider text DEFAULT 'openai';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_api_key text;
