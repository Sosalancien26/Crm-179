import { useState } from 'react'
import { Sun, Moon, Lock, Save } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Toggle from '../components/ui/Toggle'
import CategorieEditor from '../components/parametres/CategorieEditor'
import { useParametres } from '../hooks/useParametres'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth }  from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { changePassword } from '../lib/auth'

const CATEGORIES = [
  { key:'type_client',       label:'Types de clients',     color:true  },
  { key:'statut_client',     label:'Statuts clients',      color:true  },
  { key:'statut_devis',      label:'Statuts devis',        color:true  },
  { key:'type_document',     label:'Types de documents',   color:false },
  { key:'type_action',       label:'Types d\'actions',     color:false },
  { key:'zone_climatique',   label:'Zones climatiques',    color:true  },
  { key:'energie_remplacee', label:'Énergies remplacées',  color:true  },
  { key:'mandataire_cee',    label:'Mandataires CEE',      color:false },
  { key:'source_lead',       label:'Sources de leads',     color:false }
]

export default function ParametresPage () {
  const { byCat, reload } = useParametres()
  const { theme, toggle } = useTheme()
  const { session }       = useAuth()
  const toast = useToast()

  const [pwd, setPwd] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [notif, setNotif] = useState(true)

  const savePwd = async () => {
    if (!pwd || pwd.length < 6) return toast.error('Mot de passe trop court (6 caractères min.)')
    if (pwd !== pwd2) return toast.error('Les mots de passe ne correspondent pas')
    try {
      await changePassword(session.id, pwd)
      setPwd(''); setPwd2('')
      toast.success('Mot de passe mis à jour')
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-[.18em] text-ink-300">Configuration</div>
        <h1 className="font-display text-4xl md:text-5xl text-deep tracking-tight">Paramètres</h1>
        <p className="text-sm text-ink-300 mt-1">Tout ce qui personnalise le CRM est éditable ici, et synchronisé avec Supabase.</p>
      </div>

      {/* Compte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="font-display text-base mb-3">Apparence</div>
          <Button variant="ghost" icon={theme === 'dark' ? Sun : Moon} onClick={toggle}>
            Passer en mode {theme === 'dark' ? 'clair' : 'sombre'}
          </Button>
        </Card>
        <Card>
          <div className="font-display text-base mb-3">Notifications</div>
          <Toggle label="Recevoir les alertes intelligentes" checked={notif} onChange={setNotif}/>
          <p className="text-xs text-ink-300 mt-2">Affichage uniquement dans l'app pour cette version.</p>
        </Card>
        <Card>
          <div className="font-display text-base mb-3 flex items-center gap-2"><Lock className="w-4 h-4"/> Mot de passe</div>
          <div className="flex flex-col gap-2">
            <Input label="Nouveau mot de passe" type="password" value={pwd} onChange={e=> setPwd(e.target.value)}/>
            <Input label="Confirmer"             type="password" value={pwd2} onChange={e=> setPwd2(e.target.value)}/>
            <Button icon={Save} onClick={savePwd} className="self-start">Mettre à jour</Button>
          </div>
        </Card>
      </div>

      {/* Catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map(c => (
          <CategorieEditor key={c.key}
            categorie={c.key} label={c.label}
            items={byCat(c.key)} withColor={c.color} onReload={reload}/>
        ))}
      </div>
    </div>
  )
}
