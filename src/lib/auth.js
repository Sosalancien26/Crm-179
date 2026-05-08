import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

const STORAGE_KEY = 'crm179_session'

/**
 * Pseudo-JWT côté client (signature HS256 simulée — l'auth est applicative).
 * Le but n'est pas la sécurité réseau (déjà couverte par RLS Supabase) mais
 * la persistance d'une session utilisateur dans le localStorage.
 */
function b64url (s) {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}
function makeToken (payload) {
  const header = { alg:'HS256', typ:'JWT' }
  const body   = { ...payload, iat: Math.floor(Date.now()/1000) }
  const sig    = b64url(JSON.stringify({ s: payload.id, t: body.iat }))
  return `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(body))}.${sig}`
}

export async function login (prenom, password) {
  if (!prenom || !password) throw new Error('Identifiants requis')
  const { data, error } = await supabase
    .from('crm179_users')
    .select('id, prenom, password_hash, role')
    .ilike('prenom', prenom.trim())
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Identifiants incorrects')
  const ok = bcrypt.compareSync(password, data.password_hash)
  if (!ok) throw new Error('Identifiants incorrects')

  const session = {
    id:    data.id,
    prenom:data.prenom,
    role:  data.role,
    token: makeToken({ id:data.id, prenom:data.prenom, role:data.role })
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  return session
}

export function logout () {
  localStorage.removeItem(STORAGE_KEY)
}

export function getSession () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

export async function changePassword (userId, newPassword) {
  const hash = bcrypt.hashSync(newPassword, 10)
  const { error } = await supabase
    .from('crm179_users')
    .update({ password_hash: hash })
    .eq('id', userId)
  if (error) throw error
}
