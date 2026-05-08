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
    <div className="min-h-screen flex flex-col">
      {/* Bandeau supérieur éditorial */}
      <header className="h-16 px-8 flex items-center justify-between border-b border-paper-300 bg-paper-100/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-warm grid place-items-center">
            <Flame className="w-4 h-4 text-paper-50" />
          </div>
          <div>
            <div className="font-display font-semibold text-deep leading-none">CRM 179</div>
            <div className="eyebrow mt-0.5">Pompe à chaleur collective air/eau</div>
          </div>
        </div>
        <div className="text-xs text-soft hidden md:block num">v1.0 · BAR-TH-179</div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 relative">
        {/* Côté gauche : narration */}
        <motion.section
          initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:.6, ease:[.21,1.02,.73,1] }}
          className="hidden lg:flex flex-col justify-center px-16 py-12 border-r border-paper-300 relative bg-paper-100/40">
          <div className="max-w-lg">
            <div className="eyebrow mb-5">Édition 2026 · Opération CEE BAR-TH-179</div>
            <h1 className="font-display text-5xl xl:text-6xl text-deep leading-[1.05] mb-6 tracking-tight">
              Le pilotage des <em className="text-copper-400 not-italic">pompes à chaleur collectives</em>, fait pour les pros qui les installent.
            </h1>
            <div className="accent-rule mb-6" />
            <p className="text-base text-mute leading-relaxed mb-8 font-serif">
              Un endroit unique pour structurer tes copropriétés,
              suivre tes devis, anticiper les AG, et garder l'œil sur
              le volume CEE de chaque chantier — du premier RDV
              jusqu'au certificat.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <div className="num text-2xl text-deep">11</div>
                <div className="eyebrow">Sections par fiche</div>
              </div>
              <div className="h-8 w-px bg-paper-300" />
              <div>
                <div className="num text-2xl text-deep">3×</div>
                <div className="eyebrow">Coup de Pouce détecté</div>
              </div>
              <div className="h-8 w-px bg-paper-300" />
              <div>
                <div className="num text-2xl text-deep">H1·H2·H3</div>
                <div className="eyebrow">Zones climatiques</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Côté droit : formulaire */}
        <section className="flex items-center justify-center px-6 py-12 lg:px-16">
          <motion.div
            initial={{ opacity:0, y:14, scale:.98 }} animate={{ opacity:1, y:0, scale:1 }}
            transition={{ type:'spring', stiffness:220, damping:24 }}
            className="w-full max-w-md">
            <div className="eyebrow mb-3">Connexion</div>
            <h2 className="font-display text-3xl text-deep mb-2">Bienvenue.</h2>
            <p className="text-sm text-mute mb-8 font-serif leading-relaxed">
              Connecte-toi pour piloter tes copropriétés et tes chantiers PAC collective.
            </p>

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
                    className="text-sm text-brick-500 bg-brick-50 border border-brick-100 rounded-md px-3 py-2">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" loading={loading} iconRight={ArrowRight} className="w-full mt-2" size="lg">
                Se connecter
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-paper-300 flex items-center gap-2 text-[11px] text-soft">
              <ShieldCheck className="w-3.5 h-3.5 text-copper-400" />
              Connexion sécurisée bcrypt · session locale chiffrée
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}
