'use client'

import { useEffect, useState } from 'react'
import { getSurveys, createInterview } from '@/lib/supabase/queries'
import type { Survey } from '@/types/database'

export default function ExamplePage() {
  const [surveys, setSurveys] = useState<Survey[]>([])

  useEffect(() => {
    async function loadSurveys() {
      try {
        const data = await getSurveys()
        setSurveys(data)
      } catch (error) {
        console.error('Erro ao carregar pesquisas:', error)
      }
    }
    
    loadSurveys()
  }, [])

  const handleCreateInterview = async () => {
    try {
      await createInterview({
        survey_id: surveys[0]?.id,
        interviewer_id: 'user-id',
        status: 'draft',
        answers: [],
        is_offline: false,
        offline_synced: true
      })
      alert('Entrevista criada!')
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  return (
    <div className="p-4">
      <h1>Exemplo Supabase</h1>
      <button onClick={handleCreateInterview}>Criar Entrevista</button>
      
      <div>
        <h2>Pesquisas:</h2>
        {surveys.map(survey => (
          <div key={survey.id}>{survey.title}</div>
        ))}
      </div>
    </div>
  )
}