import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useTimeline (clientUuid) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!clientUuid) { setEvents([]); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('crm179_timeline')
      .select('*')
      .eq('client_id', clientUuid)
      .order('created_at', { ascending: false })
    setLoading(false)
    if (!error) setEvents(data || [])
  }, [clientUuid])

  useEffect(() => { reload() }, [reload])

  const add = useCallback(async (payload) => {
    if (!clientUuid) return
    await supabase.from('crm179_timeline').insert({ client_id: clientUuid, ...payload })
    await reload()
  }, [clientUuid, reload])

  return { events, loading, reload, add }
}
