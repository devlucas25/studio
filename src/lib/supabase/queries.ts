
import { createClient } from './client'
import type { Survey, Interview, Interviewer } from '@/types/database'

const supabase = createClient()

// Buscar todas as pesquisas
export async function getAllSurveys() {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching surveys:', error);
    throw error;
  }
  return data as Survey[];
}


// Buscar todas as pesquisas ativas
export async function getSurveys() {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('is_active', true)
  
  if (error) throw error
  return data as Survey[]
}

// Criar nova entrevista
export async function createInterview(interview: Partial<Interview>) {
  const { data, error } = await supabase
    .from('interviews')
    .insert(interview)
    .select()
    .single()
  
  if (error) throw error
  return data as Interview
}

// Buscar entrevistas por entrevistador
export async function getInterviewsByInterviewer(interviewerId: string) {
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('interviewer_id', interviewerId)
  
  if (error) throw error
  return data as Interview[]
}

// Atualizar status da entrevista
export async function updateInterviewStatus(id: string, status: string) {
  const { error } = await supabase
    .from('interviews')
    .update({ status })
    .eq('id', id)
  
  if (error) throw error
}
