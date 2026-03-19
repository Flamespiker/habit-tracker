'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/db/supabase/server'

export type AuthActionState = { error: string } | null

/**
 * Signs in an existing user with email and password.
 * Used as a Server Action with useActionState — prevState is required by that API.
 */
export async function signIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  redirect('/')
}

/**
 * Creates a new user account with email and password.
 * Used as a Server Action with useActionState — prevState is required by that API.
 */
export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) return { error: 'Passwords do not match' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }

  redirect('/')
}

/**
 * Signs out the current user and redirects to /login.
 * Call directly as a form action — no useActionState needed.
 */
export async function signOut(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
