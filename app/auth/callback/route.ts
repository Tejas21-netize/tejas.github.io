import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthCallbackPage() {
  const supabase = await createClient()

  const { searchParams } = new URL(location.origin)
  const code = searchParams.get('code')

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
    } catch (err) {
      return redirect('/auth/error')
    }
  }

  return redirect('/')
}
