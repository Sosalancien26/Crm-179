import { createClient } from '@supabase/supabase-js'

// La clé anon Supabase est publique par nature (présente dans le bundle JS).
// On la met en fallback pour ne dépendre d'AUCUN secret GitHub Actions.
const FALLBACK_URL  = 'https://yxfanlgklvpdpsrzcoqy.supabase.co'
const FALLBACK_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZmFubGdrbHZwZHBzcnpjb3F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODM3MjgsImV4cCI6MjA5MzA1OTcyOH0.rxj1AuveTUavV_BqXwgQ4RPKQqAu_lQ5b3zbls06mDc'

const url  = import.meta.env.VITE_SUPABASE_URL  || FALLBACK_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.error('[CRM-179] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant.')
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
