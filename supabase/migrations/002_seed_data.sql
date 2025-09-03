-- Insere dados de exemplo na tabela de pesquisas
-- para testar a funcionalidade de listagem.

INSERT INTO "surveys" (title, description, status, city, progress, questions)
VALUES 
(
  'Pesquisa Eleitoral Municipal 2024', 
  'Análise de intenção de voto para prefeito na cidade de São Paulo.', 
  'active',
  'São Paulo, SP',
  '45/100',
  '[
    {"id": "q1", "text": "Em quem você votaria para prefeito hoje?", "type": "single_choice", "options": ["Candidato A", "Candidato B", "Candidato C", "Branco/Nulo"], "required": true},
    {"id": "q2", "text": "Qual sua avaliação da gestão atual?", "type": "single_choice", "options": ["Ótima", "Boa", "Regular", "Ruim", "Péssima"], "required": true}
  ]'::jsonb
),
(
  'Avaliação do Governo Estadual', 
  'Pesquisa de aprovação do governo do estado em diversas áreas.', 
  'completed',
  'Campinas, SP',
  '200/200',
  '[
    {"id": "q1", "text": "Você aprova ou desaprova o atual governador?", "type": "single_choice", "options": ["Aprovo", "Desaprovo"], "required": true},
    {"id": "q2", "text": "Qual a área mais crítica na sua opinião?", "type": "single_choice", "options": ["Saúde", "Educação", "Segurança"], "required": true}
  ]'::jsonb
),
(
  'Pesquisa Cenário Presidencial 2026', 
  'Primeira pesquisa de intenção de voto para as eleições presidenciais de 2026.', 
  'pending',
  'Nacional',
  '0/5000',
  '[
    {"id": "q1", "text": "Se a eleição fosse hoje, em quem você votaria para presidente?", "type": "single_choice", "options": ["Candidato X", "Candidato Y", "Candidato Z", "Nenhum"], "required": true}
  ]'::jsonb
);
