-- Seed data for London Pesquisas electoral data system
-- Insert sample surveys only (no user dependencies)

INSERT INTO surveys (title, description, questions, is_active) VALUES
  (
    'Pesquisa Eleitoral Municipal 2024 - Prefeitura',
    'Pesquisa de intenção de voto para prefeito de São Paulo',
    '[
      {
        "id": "q1",
        "text": "Em quem você votaria para prefeito hoje?",
        "type": "single_choice",
        "options": ["Candidato A", "Candidato B", "Candidato C", "Branco/Nulo", "Não sabe"],
        "required": true
      },
      {
        "id": "q2", 
        "text": "Qual é a sua avaliação do atual prefeito?",
        "type": "single_choice",
        "options": ["Péssima", "Ruim", "Regular", "Boa", "Ótima"],
        "required": true
      },
      {
        "id": "q3",
        "text": "Quais são os principais problemas do município?",
        "type": "single_choice", 
        "options": ["Saúde", "Educação", "Segurança", "Transporte", "Emprego"],
        "required": false
      },
      {
        "id": "q4",
        "text": "Comentários adicionais (opcional)",
        "type": "text",
        "required": false
      }
    ]'::jsonb,
    true
  ),
  (
    'Avaliação Governo Estadual',
    'Pesquisa de aprovação do governo estadual',
    '[
      {
        "id": "q1",
        "text": "Como você avalia o governo estadual atual?",
        "type": "single_choice",
        "options": ["Aprovo totalmente", "Aprovo parcialmente", "Neutro", "Desaprovo parcialmente", "Desaprovo totalmente"],
        "required": true
      },
      {
        "id": "q2",
        "text": "Qual área precisa de mais atenção?",
        "type": "single_choice",
        "options": ["Saúde", "Educação", "Segurança", "Infraestrutura", "Economia"],
        "required": true
      }
    ]'::jsonb,
    true
  );

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_interviews_survey_interviewer ON interviews(survey_id, interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at_desc ON interviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interviews_status_completed ON interviews(status) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread ON messages(receiver_id, is_read) WHERE is_read = false;