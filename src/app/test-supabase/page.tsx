'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestSupabase() {
  const [status, setStatus] = useState('Testando...')
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  const testSupabaseConnection = async () => {
    const supabase = createClient()
    
    try {
      // Teste 1: Buscar surveys
      setStatus('Buscando surveys...')
      const { data: surveys, error: surveysError } = await supabase
        .from('surveys')
        .select('*')
        .limit(5)
      
      if (surveysError) throw surveysError
      
      // Teste 2: Buscar interviewers
      setStatus('Buscando entrevistadores...')
      const { data: interviewers, error: interviewersError } = await supabase
        .from('interviewers')
        .select('*')
        .limit(5)
      
      if (interviewersError) throw interviewersError
      
      // Teste 3: Buscar interviews
      setStatus('Buscando entrevistas...')
      const { data: interviews, error: interviewsError } = await supabase
        .from('interviews')
        .select('*')
        .limit(5)
      
      if (interviewsError) throw interviewsError
      
      setResults([
        { table: 'surveys', count: surveys?.length || 0, data: surveys },
        { table: 'interviewers', count: interviewers?.length || 0, data: interviewers },
        { table: 'interviews', count: interviews?.length || 0, data: interviews }
      ])
      
      setStatus('✅ Todos os testes passaram!')
      
    } catch (err: any) {
      setError(err.message)
      setStatus('❌ Erro na conexão')
    }
  }

  const testAuth = async () => {
    const supabase = createClient()
    
    try {
      setStatus('Testando autenticação...')
      
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      })
      
      if (error) throw error
      
      setStatus('✅ Autenticação funcionando!')
      
    } catch (err: any) {
      setError(err.message)
      setStatus('❌ Erro na autenticação')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Teste Supabase</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Status:</h2>
        <p className="text-lg">{status}</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Erro:</h2>
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <button 
          onClick={testAuth}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Testar Autenticação
        </button>
      </div>
      
      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Resultados:</h2>
          {results.map((result, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <h3 className="font-semibold">Tabela: {result.table}</h3>
              <p>Registros encontrados: {result.count}</p>
              {result.data && result.data.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer">Ver dados</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}