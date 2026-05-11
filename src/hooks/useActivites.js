import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useActivites (clientUuid) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!clientUuid) { setItems([]); return }
    setLoading(true)
    const { data } = await supabase.from('crm179_activites')
      .select('*').eq('client_id', clientUuid).order('created_at', { ascending:false })
    setLoading(false)
    setItems(data || [])
  }, [clientUuid])

  useEffect(() => { reload() }, [reload])

  const add = useCallback(async (payload) => {
    if (!clientUuid) return
    const { error } = await supabase.from('crm179_activites').insert({ client_id: clientUuid, ...payload })
    if (error) throw error
    await reload()
  }, [clientUuid, reload])

  const remove = useCallback(async (id) => {
    await supabase.from('crm179_activites').delete().eq('id', id)
    await reload()
  }, [reload])

  return { items, loading, add, remove, reload }
}
