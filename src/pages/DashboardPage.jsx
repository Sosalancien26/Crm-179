import { useMemo } from 'react'
import { Users, FileText, BadgeCheck, TrendingUp, Banknote, Coins, Zap, Briefcase } from 'lucide-react'
import KpiCard from '../components/dashboard/KpiCard'
import { DonutTypes, BarStatuts, LineSignatures, TopClients } from '../components/dashboard/Charts'
import MiniMapDensity from '../components/dashboard/MiniMapDensity'
import AlertsPanel from '../components/dashboard/AlertsPanel'
import { ProgressCircle } from '../components/ui/ProgressBar'
import Card from '../components/ui/Card'
import { useClients } from '../hooks/useClients'
import { useParametres } from '../hooks/useParametres'
import { fmtEUR } from '../lib/utils'
import { isSameMonth } from 'date-fns'

export default function DashboardPage () {
  const { clients, loading } = useClients()
  const { byCat } = useParametres()

  const k = useMemo(() => {
    const total = clients.length
    const sent  = clients.filter(c => ['Envoyé','En négociation','Signé','Refusé','Expiré'].includes(c.statut_devis))
    const sentMonth = sent.filter(c => c.devis?.date_envoi && isSameMonth(new Date(c.devis.date_envoi), new Date()))
    const signed = clients.filter(c => c.statut_devis === 'Signé')
    const conv = sent.length ? signed.length / sent.length : 0
    const totalSent   = sent.reduce((a,b)=> a + Number(b.devis?.montant_ttc||0), 0)
    const totalSigned = signed.reduce((a,b)=> a + Number(b.devis?.montant_ttc||0), 0)
    const pipeline = clients
      .filter(c => !['Signé','Perdu','Refusé','Clôturé'].includes(c.statut_devis))
      .reduce((a,b)=> a + Number(b.devis?.montant_ttc||0), 0)
    const cee = clients.reduce((a,b)=> a + Number(b.volume_cee_estime||0), 0)
    return { total, sent: sent.length, sentMonth: sentMonth.length, signed: signed.length, conv, totalSent, totalSigned, pipeline, cee }
  }, [clients])

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-[.18em] text-ink-300">Vue d'ensemble</div>
          <h1 className="font-display text-4xl md:text-5xl text-deep tracking-tight">Dashboard</h1>
          <p className="text-sm text-ink-300 mt-1">Pilotage de l'opération CEE BAR-TH-179 — PAC collective air/eau.</p>
        </div>
        <Card className="!p-0 flex items-center gap-4 px-4 py-2.5">
          <ProgressCircle value={k.conv} size={56} stroke={6} sub="Conv." />
          <div className="text-xs text-ink-300">
            <div className="text-ink-100 font-mono text-base">{k.signed}/{k.sent}</div>
            <div>Devis signés</div>
          </div>
        </Card>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Clients"       value={k.total}      icon={Users}      accent="violet" />
        <KpiCard label="Devis envoyés (total)" value={k.sent} icon={FileText} accent="blue" sub={`${k.sentMonth} ce mois-ci`}/>
        <KpiCard label="Devis signés"  value={k.signed}     icon={BadgeCheck} accent="green"/>
        <KpiCard label="Taux de conversion" value={k.conv} format="pct" icon={TrendingUp} accent="gold"/>
        <KpiCard label="Montant devis envoyés"  value={k.totalSent}   format="eur" icon={Banknote} accent="blue"/>
        <KpiCard label="Montant devis signés"   value={k.totalSigned} format="eur" icon={Coins}    accent="green"/>
        <KpiCard label="CA prévisionnel pipeline" value={k.pipeline}  format="eur" icon={Briefcase} accent="violet"/>
        <KpiCard label="Volume CEE estimé"       value={k.cee}        format="num" suffix=" kWh" icon={Zap} accent="gold"/>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <DonutTypes clients={clients} byCat={byCat}/>
        <BarStatuts clients={clients} byCat={byCat}/>
        <LineSignatures clients={clients}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <TopClients clients={clients}/>
        <MiniMapDensity clients={clients}/>
      </div>

      <AlertsPanel clients={clients}/>
      {!clients.length && !loading && (
        <p className="text-center text-sm text-ink-300 mt-8">
          Aucun client encore. Crée ton premier dossier depuis la page <span className="text-brand-violet">Clients</span>.
        </p>
      )}
    </div>
  )
}
