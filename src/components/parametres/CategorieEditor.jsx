import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, GripVertical } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../contexts/ToastContext'

export default function CategorieEditor ({ categorie, label, items=[], onReload, withColor=false }) {
  const [list, setList] = useState(items)
  const [val,  setVal]  = useState('')
  const [color, setColor] = useState('#7C3AED')
  const toast = useToast()
  useEffect(() => setList(items), [items])

  const add = async () => {
    if (!val.trim()) return
    try {
      const ordre = (list[list.length-1]?.ordre || 0) + 1
      const { error } = await supabase.from('crm179_parametres').insert({
        categorie, valeur: val.trim(), ordre, couleur: withColor ? color : null
      })
      if (error) throw error
      setVal('')
      toast.success('Ajouté'); onReload?.()
    } catch (e) { toast.error(e.message) }
  }

  const remove = async (id) => {
    try {
      const { error } = await supabase.from('crm179_parametres').delete().eq('id', id)
      if (error) throw error
      onReload?.()
    } catch (e) { toast.error(e.message) }
  }

  const updateColor = async (id, couleur) => {
    try {
      const { error } = await supabase.from('crm179_parametres').update({ couleur }).eq('id', id)
      if (error) throw error
      onReload?.()
    } catch (e) { toast.error(e.message) }
  }

  return (
    <Card className="!p-4">
      <div className="font-display text-base mb-2">{label}</div>
      <div className="flex flex-wrap gap-2 mb-3">
        <AnimatePresence>
          {list.map(p => (
            <motion.span key={p.id}
              initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.95 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/[.05] border border-white/[.06] px-3 py-1 text-sm">
              {withColor && (
                <input type="color" value={p.couleur || '#7C3AED'}
                  onChange={e => updateColor(p.id, e.target.value)}
                  className="w-4 h-4 rounded border-0 bg-transparent cursor-pointer"/>
              )}
              <span>{p.valeur}</span>
              <button onClick={() => remove(p.id)} className="text-ink-300 hover:text-rose-400">
                <X className="w-3.5 h-3.5"/>
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2">
        <Input wrapperClass="flex-1" placeholder="Nouvelle valeur"
          value={val} onChange={e=> setVal(e.target.value)}
          onKeyDown={e=> e.key === 'Enter' && add()}/>
        {withColor && (
          <input type="color" value={color} onChange={e=> setColor(e.target.value)}
            className="w-10 h-10 rounded-xl border border-white/[.08] bg-transparent cursor-pointer"/>
        )}
        <Button icon={Plus} onClick={add}>Ajouter</Button>
      </div>
    </Card>
  )
}
