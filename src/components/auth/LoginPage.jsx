import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage () {
  const { signIn } = useAuth()
  const [prenom,   setPrenom]   = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  const submit = async e => {
    e.preventDefault()
    setError(null); setLoading(true)
    try { await signIn(prenom, password) }
    catch (err) { setError(err.message || 'Erreur inconnue') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background lumineux */}
      <motion.div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
        style={{ background:'radial-gradient(circle, rgba(124,58,237,.35), transparent 60%)' }}
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease:'easeInOut' }}/>
      <motion.div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full"
        style={{ background:'radial-gradient(circle, rgba(59,130,246,.30), transparent 60%)' }}
        animate={{ y: [0, -25, 0], x: [0, -10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease:'easeInOut' }}/>

      <motion.div
        initial={{ opacity:0, y:24, scale:.97 }}
        animate={{ opacity:1, y:0,  scale:1   }}
        transition={{ type:'spring', stiffness:220, damping:24 }}
        className="relative w-full max-w-md">
        <div className="card p-8 gradient-border">
          {/* Branding */}
          <div className="flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[.18em] text-ink-300">CEE BAR-TH-179</div>
              <div className="font-display text-2xl text-gradient leading-tight">CRM 179</div>
            </div>
          </div>
          <div className="mb-7">
            <h1 className="font-display text-2xl">Bienvenue.</h1>
            <p className="text-sm text-ink-300 mt-1">
              Connecte-toi pour piloter tes copropriétés et tes chantiers PAC collective.
            </p>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input label="Prénom" icon={User} placeholder="Sacha"
              value={prenom} onChange={e=>setPrenom(e.target.value)} autoFocus />
            <Input label="Mot de passe" icon={Lock} type="password" placeholder="••••••••"
              value={password} onChange={e=>setPassword(e.target.value)} />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity:0, y:-6, height:0 }}
                  animate={{ opacity:1, y:0,  height:'auto' }}
                  exit={{    opacity:0, y:-6, height:0 }}
                  className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" loading={loading} iconRight={ArrowRight} className="w-full mt-1" size="lg">
              Se connecter
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-[11px] text-ink-300">
            <ShieldCheck className="w-3.5 h-3.5" /> Connexion sécurisée bcrypt · session locale chiffrée
          </div>
        </div>
        <div className="text-center text-xs text-ink-300 mt-4 font-mono">v1.0 · Pompe à chaleur collective air/eau</div>
      </motion.div>
    </div>
  )
}
