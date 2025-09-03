-- Dados de exemplo para a tabela de Pesquisas (Surveys)
-- Insere 3 pesquisas para que a lista não apareça vazia na aplicação.

DELETE FROM "surveys";

INSERT INTO "surveys" (title, description, status, city, progress, questions)
VALUES
  (
    'Pesquisa Eleitoral 2024 - Prefeitura',
    'Pesquisa de intenção de voto para prefeito na cidade de São Paulo.',
    'active',
    'São Paulo, SP',
    '40/100',
    '[{"id": "q1", "text": "Em quem você votaria para prefeito hoje?", "type": "single_choice", "options": ["Candidato A", "Candidato B", "Candidato C", "Branco/Nulo"], "required": true}]'
  ),
  (
    'Avaliação de Gestão Estadual',
    'Avaliação da gestão do atual governador.',
    'active',
    'Estado de São Paulo',
    '78/80',
    '[{"id": "q1", "text": "Você aprova ou desaprova a atual gestão do estado?", "type": "single_choice", "options": ["Aprovo", "Desaprovo", "Não sei"], "required": true}]'
  ),
  (
    'Pesquisa de Rejeição de Candidatos',
    'Pesquisa para medir a rejeição dos principais candidatos.',
    'completed',
    'Rio de Janeiro, RJ',
    '150/150',
    '[{"id": "q1", "text": "Qual destes candidatos você não votaria de jeito nenhum?", "type": "multiple_choice", "options": ["Candidato X", "Candidato Y", "Candidato Z"], "required": true}]'
  );
