'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/actions/auth'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) return { success: false, error: 'Unauthorized' }
    
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return { success: true, data }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function markAsRead(id: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', id)
      
    if (error) throw error
    revalidatePath('/notifications')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function markAllAsRead() {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) return { success: false, error: 'Unauthorized' }
    
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('user_id', user.id)
      
    if (error) throw error
    revalidatePath('/notifications')
    return { success: true }
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
