// Mock Supabase client for development without real database
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Mock authentication
      if (email === 'admin@london.com' && password === 'admin123') {
        return { 
          data: { 
            user: { id: '00000000-0000-0000-0000-000000000001', email },
            session: { access_token: 'mock-token' }
          }, 
          error: null 
        };
      }
      if (email === 'entrevistador@london.com' && password === 'entrev123') {
        return { 
          data: { 
            user: { id: '00000000-0000-0000-0000-000000000002', email },
            session: { access_token: 'mock-token' }
          }, 
          error: null 
        };
      }
      return { data: null, error: { message: 'Invalid credentials' } };
    },
    getSession: async () => ({
      data: { session: null },
      error: null
    }),
    signOut: async () => ({ error: null })
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          if (table === 'user_roles') {
            return {
              data: { role: value.includes('001') ? 'administrator' : 'interviewer' },
              error: null
            };
          }
          return { data: null, error: null };
        }
      })
    }),
    insert: (data: any) => ({ error: null }),
    upsert: (data: any) => ({ error: null })
  })
};

export const createClient = () => mockSupabaseClient;