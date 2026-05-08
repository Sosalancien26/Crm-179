import { useCallback, useEffect, useState } from 'react'
import { supabase, STORAGE_BUCKET } from '../lib/supabase'

export function useDocuments (clientUuid) {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!clientUuid) { setDocs([]); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('crm179_documents')
      .select('*')
      .eq('client_id', clientUuid)
      .order('created_at', { ascending: false })
    setLoading(false)
    if (!error) setDocs(data || [])
  }, [clientUuid])

  useEffect(() => { reload() }, [reload])

  const upload = useCallback(async (file, type_document='Autre') => {
    if (!clientUuid || !file) return
    const ext = file.name.split('.').pop()
    const path = `${clientUuid}/${Date.now()}_${file.name.replace(/[^\w.\-]+/g,'_')}`
    const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600', upsert: false, contentType: file.type
    })
    if (upErr) throw upErr
    const { data, error } = await supabase.from('crm179_documents').insert({
      client_id: clientUuid,
      type_document,
      nom_fichier: file.name,
      url_storage: path,
      taille: file.size,
      statut: 'reçu'
    }).select().single()
    if (error) throw error
    await supabase.from('crm179_timeline').insert({
      client_id: clientUuid,
      type_event: 'document',
      description: `Document ajouté : ${file.name}`
    })
    await reload()
    return data
  }, [clientUuid, reload])

  const remove = useCallback(async (doc) => {
    if (doc.url_storage) await supabase.storage.from(STORAGE_BUCKET).remove([doc.url_storage])
    await supabase.from('crm179_documents').delete().eq('id', doc.id)
    await reload()
  }, [reload])

  const signedUrl = useCallback(async (path) => {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 60*60)
    if (error) throw error
    return data.signedUrl
  }, [])

  return { docs, loading, reload, upload, remove, signedUrl }
}
