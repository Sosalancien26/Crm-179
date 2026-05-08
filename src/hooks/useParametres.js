import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Charge tous les paramètres groupés par catégorie.
 * Renvoie également un helper byCat(cat) → [{valeur, couleur, ordre}].
 */
export function useParametres () {
  const [data, setData]       = useState({})
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const { data: rows, error } = await supabase
      .from('crm179_parametres')
      .select('*')
      .order('ordre', { ascending: true })
    setLoading(false)
    if (error) { console.error(error); return }
    const grouped = {}
    rows.forEach(r => {
      grouped[r.categorie] ??= []
      grouped[r.categorie].push(r)
    })
    setData(grouped)
  }, [])

  useEffect(() => { reload() }, [reload])

  const byCat = (cat) => data[cat] || []
  const valuesOf = (cat) => byCat(cat).map(p => p.valeur)
  const colorOf  = (cat, valeur) => byCat(cat).find(p => p.valeur === valeur)?.couleur || null

  return { data, loading, reload, byCat, valuesOf, colorOf }
}
