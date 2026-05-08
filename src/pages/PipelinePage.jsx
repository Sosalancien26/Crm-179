import KanbanBoard from '../components/pipeline/KanbanBoard'
import { useClients } from '../hooks/useClients'
import { useToast } from '../contexts/ToastContext'

export default function PipelinePage () {
  const { clients, update } = useClients()
  const toast = useToast()

  const onMove = async (clientId, nouveau, ancien) => {
    try {
      await update(clientId, { statut_client: nouveau }, ancien)
      toast.success(`Statut → ${nouveau}`)
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-[.18em] text-ink-300">Vue commerciale</div>
        <h1 className="font-display text-3xl md:text-4xl text-gradient">Pipeline</h1>
        <p className="text-sm text-ink-300 mt-1">Glisse les cartes pour avancer un dossier — la timeline s'enregistre automatiquement.</p>
      </div>
      <KanbanBoard clients={clients} onMove={onMove}/>
    </div>
  )
}
