'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from './server';
import { Survey, SurveyQuestion } from '@/types/database';
import { redirect } from 'next/navigation';

export async function createSurvey(formData: FormData) {
  const supabase = createClient();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const questionsString = formData.get('questions') as string;

  if (!title || !questionsString) {
    throw new Error('Title and questions are required');
  }

  let questions: SurveyQuestion[];
  try {
    questions = JSON.parse(questionsString);
  } catch (error) {
    throw new Error('Invalid questions format');
  }

  const newSurvey: Omit<Survey, 'id' | 'created_at' | 'updated_at'> = {
    title,
    description: description || undefined,
    questions: questions,
    is_active: true, // Default to active
    status: 'pending', // Default status
  };

  const { error } = await supabase.from('surveys').insert([newSurvey]);

  if (error) {
    console.error('Error creating survey:', error);
    throw new Error('Failed to create survey in database.');
  }

  // Revalidate the surveys page to show the new survey
  revalidatePath('/admin/surveys');

  // Redirect to the surveys list
  redirect('/admin/surveys');
}
