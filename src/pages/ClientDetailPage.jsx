import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import ClientDrawer from '../components/clients/ClientDrawer'
import { useClients } from '../hooks/useClients'
import { useParametres } from '../hooks/useParametres'
import Skeleton from '../components/ui/Skeleton'

export default function ClientDetailPage () {
  const { id } = useParams()
  const { clients, loading } = useClients()
  const { byCat } = useParametres()

  const client = useMemo(() => clients.find(c => c.id === id), [clients, id])

  const paramsByCat = useMemo(() => {
    const o = {}
    ;[
      'type_client','statut_client','statut_devis','type_action','energie_remplacee',
      'mandataire_cee','source_lead','zone_climatique','type_document'
    ].forEach(c => o[c] = (byCat(c)||[]).map(p => p.valeur))
    return o
  }, [byCat])

  if (loading && !client) {
    return (
      <div className="p-8 max-w-[1500px] mx-auto space-y-3">
        <Skeleton className="h-12 w-1/3"/>
        <Skeleton className="h-32 w-full"/>
        <Skeleton className="h-64 w-full"/>
      </div>
    )
  }
  if (!client) {
    return (
      <div className="p-12 text-center">
        <div className="font-display text-2xl text-deep">Fiche introuvable</div>
        <div className="text-mute mt-2">Cet ID client n'existe pas ou a été supprimé.</div>
      </div>
    )
  }

  return (
    <ClientDrawer
      mode="page"
      open={true}
      client={client}
      paramsByCat={paramsByCat}
    />
  )
}
