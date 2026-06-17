import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/actions/auth'
import { DEFAULT_CATEGORIES } from '@/lib/constants'

export async function GET() {
  const supabase = await createClient()

  // TEMPORARILY bypass auth for debug by grabbing the first user
  const { data: users } = await supabase.from('users').select('id').limit(1)
  const userId = users?.[0]?.id

  if (!userId) return NextResponse.json({ error: 'No user found' })

  const { data: existing } = await supabase.from('categories').select('name').eq('user_id', userId)
  const existingNames = (existing || []).map(c => c.name)

  const toInsert = DEFAULT_CATEGORIES.filter(c => !existingNames.includes(c.name)).map(c => ({
    user_id: userId,
    name: c.name,
    icon: c.icon,
    color: c.color,
    is_default: true
  }))

  if (toInsert.length > 0) {
    await supabase.from('categories').insert(toInsert)
  }

  const { data: finalCategories } = await supabase.from('categories').select('name').eq('user_id', user.id)

  return NextResponse.json({ 
    success: true, 
    inserted: toInsert.length,
    current_categories: (finalCategories || []).map(c => c.name)
  })
}
