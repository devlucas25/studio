// Database types for London Pesquisas electoral data system
// Generated from supabase/migrations/001_initial_schema.sql

export interface UserRole {
  id: string;
  user_id: string;
  role: 'interviewer' | 'administrator';
  created_at: string;
  updated_at: string;
}

export interface Interviewer {
  id: string;
  user_id: string;
  full_name: string;
  cpf: string;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id?: string; // Optional on creation, assigned by DB
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'text' | 'number';
  options?: string[];
  required: boolean;
}

export type SurveyStatus = 'pending' | 'active' | 'completed' | 'archived';


export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  is_active: boolean; // Legacy or can be used for quick toggles
  status?: SurveyStatus;
  city?: string;
  progress?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewAnswer {
  question_id: string;
  answer: string | number | string[];
}

export type InterviewStatus = 'draft' | 'completed' | 'submitted' | 'approved' | 'rejected';

export interface Interview {
  id: string;
  survey_id: string;
  interviewer_id: string;
  respondent_name?: string;
  respondent_age?: number;
  respondent_gender?: string;
  respondent_location?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  answers: InterviewAnswer[];
  status: InterviewStatus;
  is_offline: boolean;
  offline_synced: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ReportFilters {
  date_range?: { start: string; end: string };
  survey_id?: string;
  interviewer_id?: string;
  location?: string;
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: 'survey_summary' | 'interviewer_performance' | 'geographic_analysis';
  filters?: ReportFilters;
  data: any; // JSON data structure varies by report type
  format: 'pdf' | 'excel' | 'word';
  generated_by?: string;
  created_at: string;
  downloaded_at?: string;
}

export interface Message {
  id: string;
  sender_id?: string;
  receiver_id?: string;
  subject: string;
  content: string;
  type: 'notification' | 'alert' | 'message';
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

// Database enums for type safety
export const UserRoles = {
  INTERVIEWER: 'interviewer',
  ADMINISTRATOR: 'administrator',
} as const;

export const InterviewStatuses = {
  DRAFT: 'draft',
  COMPLETED: 'completed',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const SurveyStatuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;


export const ReportTypes = {
  SURVEY_SUMMARY: 'survey_summary',
  INTERVIEWER_PERFORMANCE: 'interviewer_performance',
  GEOGRAPHIC_ANALYSIS: 'geographic_analysis',
} as const;

export const ReportFormats = {
  PDF: 'pdf',
  EXCEL: 'excel',
  WORD: 'word',
} as const;

export const MessageTypes = {
  NOTIFICATION: 'notification',
  ALERT: 'alert',
  MESSAGE: 'message',
} as const;
