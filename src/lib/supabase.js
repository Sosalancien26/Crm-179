import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.error('[CRM-179] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant. Vérifie .env.local')
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: { 'x-app': 'crm-179' }
  }
})

export const STORAGE_BUCKET = 'crm179-documents'
