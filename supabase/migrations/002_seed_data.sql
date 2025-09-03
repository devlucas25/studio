-- supabase/migrations/002_seed_data.sql

-- Inserir dados de exemplo para pesquisas (surveys)
-- Este script assume que o schema de 001_initial_schema.sql foi executado.

INSERT INTO "surveys" (title, description, status, city, progress, questions)
VALUES 
(
  'Pesquisa Eleitoral 2024 - Prefeitura', 
  'Análise de intenção de voto para o cargo de prefeito na cidade.', 
  'active', 
  'São Paulo, SP', 
  '40/100',
  '[
    {"id": "q1", "question": "Em quem você votaria para prefeito hoje?", "type": "single_choice", "options": ["Candidato A", "Candidato B", "Candidato C", "Branco/Nulo", "Não sabe"], "required": true},
    {"id": "q2", "question": "Qual é a sua avaliação do atual prefeito?", "type": "single_choice", "options": ["Péssima", "Ruim", "Regular", "Boa", "Ótima"], "required": true}
  ]'::jsonb
),
(
  'Avaliação do Governo Estadual',
  'Pesquisa sobre a percepção da população em relação ao governo do estado.',
  'active',
  'São Paulo, SP',
  '78/80',
  '[
    {"id": "q1", "question": "Você aprova ou desaprova a atual gestão do governo estadual?", "type": "single_choice", "options": ["Aprovo", "Desaprovo", "Não sabe"], "required": true},
    {"id": "q2", "question": "Qual área você considera a mais crítica atualmente?", "type": "single_choice", "options": ["Saúde", "Educação", "Segurança", "Economia"], "required": true}
  ]'::jsonb
),
(
  'Intenção de Voto - Vereadores',
  'Levantamento sobre a intenção de voto para vereadores na região central.',
  'completed',
  'São Paulo, SP - Centro',
  '150/150',
  '[
    {"id": "q1", "question": "Se a eleição para vereador fosse hoje, em qual candidato você votaria? (Resposta espontânea)", "type": "text", "required": true},
    {"id": "q2", "question": "Quão interessado(a) você está nas eleições municipais deste ano?", "type": "rating", "options": ["1", "2", "3", "4", "5"], "required": true}
  ]'::jsonb
);
