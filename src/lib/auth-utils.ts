// Authentication utilities for role-based access control
import { createClient } from './supabase/server';
import { UserRole } from '@/types/database';

/**
 * Get the user's role from the database
 * @param userId The user ID from auth
 * @returns The user's role or null if not found
 */
export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data.role;
}

/**
 * Check if the current user has the required role
 * @param requiredRole The role required to access the resource
 * @returns boolean indicating if user has the role
 */
export async function hasRole(requiredRole: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    return false;
  }

  const userRole = await getUserRole(session.user.id);
  return userRole === requiredRole;
}

/**
 * Get the current user's role and ID
 * @returns Object with user ID and role, or null if not authenticated
 */
export async function getCurrentUserWithRole(): Promise<{ id: string; role: string } | null> {
  const supabase = createClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    return null;
  }

  const userRole = await getUserRole(session.user.id);
  if (!userRole) {
    return null;
  }

  return { id: session.user.id, role: userRole };
}

/**
 * Redirect user to the appropriate dashboard based on their role
 * @returns NextResponse.redirect to the correct dashboard
 */
export async function redirectBasedOnRole(): Promise<Response> {
  const userWithRole = await getCurrentUserWithRole();
  
  if (!userWithRole) {
    return new Response('Unauthorized', { status: 401 });
  }

  const dashboardPath = userWithRole.role === 'administrator' 
    ? '/admin/dashboard' 
    : '/interviewer/dashboard';

  return Response.redirect(new URL(dashboardPath, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}

/**
 * Create a new user role in the database
 * @param userId The user ID from auth
 * @param role The role to assign
 * @returns boolean indicating success
 */
export async function createUserRole(userId: string, role: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_roles')
    .insert([{ user_id: userId, role }]);

  if (error) {
    console.error('Error creating user role:', error);
    return false;
  }

  return true;
}

/**
 * Update a user's role in the database
 * @param userId The user ID to update
 * @param newRole The new role to assign
 * @returns boolean indicating success
 */
export async function updateUserRole(userId: string, newRole: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_roles')
    .update({ role: newRole })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    return false;
  }

  return true;
}

/**
 * Check if a user has admin privileges
 * @returns boolean indicating if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('administrator');
}

/**
 * Check if a user has interviewer privileges
 * @returns boolean indicating if user is interviewer
 */
export async function isInterviewer(): Promise<boolean> {
  return hasRole('interviewer');
}