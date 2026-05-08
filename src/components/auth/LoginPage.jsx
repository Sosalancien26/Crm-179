import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen flex flex-col">
      <header className="h-14 px-8 flex items-center justify-between border-b border-paper-300/70">
        <div className="font-display text-xl text-deep tracking-tight">CRM 179</div>
        <div className="eyebrow num">v1.0 · BAR-TH-179</div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <motion.section
          initial={{ opacity:0 }} animate={{ opacity:1 }}
          transition={{ duration:.6 }}
          className="hidden lg:flex flex-col justify-center px-20 py-16 border-r border-paper-300/70">
          <div className="max-w-xl">
            <div className="eyebrow mb-8">Édition 2026 — Opération CEE</div>
            <h1 className="font-display font-light text-7xl xl:text-[88px] text-deep leading-[.95] mb-10 tracking-tight">
              Le pilotage<br/>des <em className="italic font-normal">pompes à chaleur</em><br/>collectives.
            </h1>
            <div className="hairline mb-10" />
            <p className="text-[15px] text-mute leading-[1.7] font-serif font-light">
              Un endroit unique pour structurer vos copropriétés, suivre vos devis,
              anticiper les assemblées générales, et garder l'œil sur le volume CEE
              de chaque chantier — du premier rendez-vous jusqu'au certificat.
            </p>
          </div>
        </motion.section>

        <section className="flex items-center justify-center px-8 py-16 lg:px-20">
          <motion.div
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:.5, delay:.15 }}
            className="w-full max-w-sm">
            <div className="eyebrow mb-4">Connexion</div>
            <h2 className="font-display font-medium text-4xl text-deep mb-3 tracking-tight">Bienvenue.</h2>
            <p className="text-[14px] text-mute mb-10 font-serif leading-relaxed">
              Connectez-vous pour piloter vos copropriétés et chantiers PAC collective.
            </p>

            <form onSubmit={submit} className="flex flex-col gap-5">
              <Input label="Prénom" icon={User} placeholder="Sacha"
                value={prenom} onChange={e=>setPrenom(e.target.value)} autoFocus />
              <Input label="Mot de passe" icon={Lock} type="password" placeholder="••••••••"
                value={password} onChange={e=>setPassword(e.target.value)} />

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity:0, y:-6, height:0 }}
                    animate={{ opacity:1, y:0, height:'auto' }}
                    exit={{ opacity:0, y:-6, height:0 }}
                    className="text-[13px] text-brick-400 bg-brick-50 border border-brick-100 rounded-md px-3 py-2">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" loading={loading} iconRight={ArrowRight} className="w-full mt-3" size="lg">
                Se connecter
              </Button>
            </form>

            <div className="mt-12 pt-6 border-t border-paper-300/70 text-[11px] text-soft tracking-editorial uppercase">
              Connexion sécurisée · Session locale chiffrée
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}
