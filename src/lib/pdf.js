import jsPDF from 'jspdf'
import { fmtEUR, fmtDate, fmtNum } from './utils'
import { CHECKLIST_ITEMS, checklistProgress, calcVolumeCEE } from './cee'

/**
 * Export PDF : 4 designs aléatoires pour varier la livraison.
 *  - "minimal"  : épuré noir & blanc, gold accent
 *  - "violet"   : dégradé violet/bleu signature
 *  - "editorial": grosse typo display, bandeaux
 *  - "compact"  : tableau dense, technique
 */
export function exportClientPDF (client, contacts=[]) {
  const variants = ['minimal','violet','editorial','compact']
  const v = variants[Math.floor(Math.random()*variants.length)]
  return buildPDF(client, contacts, v)
}

function buildPDF (c, contacts, variant) {
  const doc = new jsPDF({ unit:'mm', format:'a4' })
  const W = 210, H = 297
  let y = 20

  const palette = {
    minimal:   { bg:'#FFFFFF', ink:'#0A0A0F', accent:'#D4AF37', soft:'#F4F4F7' },
    violet:    { bg:'#FFFFFF', ink:'#0A0A0F', accent:'#7C3AED', soft:'#F2EEFD' },
    editorial: { bg:'#FFFFFF', ink:'#111111', accent:'#3B82F6', soft:'#EEF4FF' },
    compact:   { bg:'#FFFFFF', ink:'#0A0A0F', accent:'#10B981', soft:'#ECFDF5' }
  }[variant]

  // ============== Header
  if (variant === 'violet') {
    // bandeau dégradé simulé par fines bandes
    for (let i=0; i<28; i++) {
      const t = i/27
      doc.setFillColor(...mix('#7C3AED','#3B82F6', t))
      doc.rect(0, i, W, 1, 'F')
    }
    doc.setTextColor('#FFFFFF')
    doc.setFont('helvetica','bold'); doc.setFontSize(22)
    doc.text('CRM 179', 14, 18)
    doc.setFontSize(10); doc.setFont('helvetica','normal')
    doc.text('Fiche client — BAR-TH-179', 14, 25)
    y = 42
  } else if (variant === 'editorial') {
    doc.setFillColor(palette.soft); doc.rect(0,0,W,40,'F')
    doc.setTextColor(palette.ink); doc.setFont('helvetica','bold'); doc.setFontSize(28)
    doc.text('Fiche client', 14, 22)
    doc.setFontSize(11); doc.setFont('helvetica','normal'); doc.setTextColor('#666')
    doc.text('Pompe à chaleur collective air/eau — résidentiel collectif', 14, 30)
    doc.setDrawColor(palette.accent); doc.setLineWidth(.6); doc.line(14, 36, W-14, 36)
    y = 50
  } else if (variant === 'compact') {
    doc.setFillColor(palette.ink); doc.rect(0,0,W,12,'F')
    doc.setTextColor('#FFFFFF'); doc.setFont('helvetica','bold'); doc.setFontSize(11)
    doc.text(`CRM 179 · ${c.client_id||''}`, 14, 8)
    doc.setFont('helvetica','normal'); doc.setFontSize(9)
    doc.text(`Édité le ${fmtDate(new Date())}`, W-14, 8, { align:'right' })
    y = 22
  } else {
    doc.setTextColor(palette.ink); doc.setFont('helvetica','bold'); doc.setFontSize(20)
    doc.text('Fiche client', 14, 22)
    doc.setDrawColor(palette.accent); doc.setLineWidth(2); doc.line(14, 26, 60, 26)
    doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor('#666')
    doc.text(c.client_id || '', W-14, 22, { align:'right' })
    y = 38
  }

  // ============== Titre client
  doc.setTextColor(palette.ink); doc.setFont('helvetica','bold')
  doc.setFontSize(variant==='editorial' ? 18 : 14)
  doc.text(c.raison_sociale || '—', 14, y); y += 7
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor('#555')
  doc.text(`${c.type_client || ''}${c.siret ? ' · SIRET ' + c.siret : ''}`, 14, y); y += 8

  // ============== Sections
  const section = (title) => {
    if (y > H-30) { doc.addPage(); y = 20 }
    doc.setFillColor(palette.soft); doc.rect(14, y-4, W-28, 7, 'F')
    doc.setTextColor(palette.accent); doc.setFont('helvetica','bold'); doc.setFontSize(10)
    doc.text(title.toUpperCase(), 16, y+1.5)
    doc.setTextColor(palette.ink); doc.setFont('helvetica','normal'); doc.setFontSize(10)
    y += 9
  }
  const kv = (k,v) => {
    if (y > H-15) { doc.addPage(); y = 20 }
    doc.setTextColor('#666'); doc.text(k, 16, y)
    doc.setTextColor(palette.ink); doc.text(String(v ?? '—'), 70, y, { maxWidth: W-86 })
    y += 6
  }

  section('Identification')
  kv('ID client',    c.client_id)
  kv('Type',         c.type_client)
  kv('Raison sociale', c.raison_sociale)
  kv('SIRET',        c.siret)
  kv('Immatriculation copro', c.num_immatriculation_copro)
  kv('Nb logements', c.nb_logements)

  section('Adresse du chantier')
  const a = c.adresse_chantier || {}
  kv('Adresse', [a.rue, a.cp, a.ville].filter(Boolean).join(' '))
  kv('Département', a.departement)
  kv('Zone climatique', c.zone_climatique)

  section('Caractéristiques techniques')
  const t = c.caracteristiques_techniques || {}
  kv('Bâtiment',   t.type_batiment)
  kv('Année',      t.annee_construction)
  kv('Surface',    t.surface_chauffee ? fmtNum(t.surface_chauffee) + ' m²' : '—')
  kv('Énergie remplacée', c.energie_remplacee + (c.coup_de_pouce_x3 ? '  ⚡ Coup de Pouce x3' : ''))
  kv('Puissance PAC', t.puissance_pac ? t.puissance_pac + ' kW' : '—')
  kv('Usage',      t.usage)
  kv('ETAS prévu', t.etas ? t.etas + ' %' : '—')

  section('Devis & financier')
  const d = c.devis || {}
  kv('N° devis',          d.numero)
  kv('Date envoi',        fmtDate(d.date_envoi))
  kv('Montant HT',        d.montant_ht  ? fmtEUR(d.montant_ht)  : '—')
  kv('Montant TTC',       d.montant_ttc ? fmtEUR(d.montant_ttc) : '—')
  kv('Statut devis',      c.statut_devis)
  kv('Prime CEE estimée', d.prime_cee   ? fmtEUR(d.prime_cee)   : '—')
  kv('Reste à charge',    d.reste_charge!=null ? fmtEUR(d.reste_charge) : '—')

  section('Suivi')
  kv('Statut',            c.statut_client)
  kv('AG prévue',         fmtDate(c.date_ag_prevue))
  kv('Prochaine action',  c.type_prochaine_action ? `${c.type_prochaine_action} — ${fmtDate(c.date_prochaine_action)}` : '—')
  kv('Score chaleur',     '★'.repeat(c.score_chaleur||0) + '☆'.repeat(5-(c.score_chaleur||0)))
  kv('Source',            c.source_lead)
  kv('Mandataire CEE',    c.mandataire_cee)

  if (contacts?.length) {
    section('Interlocuteurs')
    contacts.forEach((ct,i) => {
      const line = `${i+1}. ${[ct.civilite,ct.prenom,ct.nom].filter(Boolean).join(' ')}` +
                   `${ct.fonction ? ' · ' + ct.fonction : ''}` +
                   `${ct.tel_mobile ? ' · ' + ct.tel_mobile : ''}` +
                   `${ct.email ? ' · ' + ct.email : ''}`
      if (y > H-15) { doc.addPage(); y = 20 }
      doc.text(line, 16, y, { maxWidth: W-32 }); y += 6
    })
  }

  section('Volume CEE & checklist')
  const vol = c.volume_cee_estime || calcVolumeCEE({
    usage:t.usage, zone:c.zone_climatique, nbLogements:c.nb_logements,
    energieRemplacee:c.energie_remplacee, etas:t.etas
  })
  kv('Volume CEE estimé', fmtNum(vol) + ' kWh cumac')
  const prog = checklistProgress(c.checklist_cee || {})
  kv('Conformité', `${prog.done}/${prog.total} (${Math.round(prog.pct*100)}%)`)
  CHECKLIST_ITEMS.forEach(it => {
    if (y > H-15) { doc.addPage(); y = 20 }
    const ok = !!c.checklist_cee?.[it.key]
    doc.setTextColor(ok ? palette.accent : '#999')
    doc.text(ok ? '☑' : '☐', 16, y)
    doc.setTextColor(palette.ink)
    doc.text(it.label, 22, y); y += 5.5
  })

  if (c.notes) {
    section('Notes')
    const lines = doc.splitTextToSize(c.notes, W-32)
    lines.forEach(l => { if (y>H-15){doc.addPage(); y=20} ; doc.text(l, 16, y); y+=5 })
  }

  // Footer
  const pages = doc.getNumberOfPages()
  for (let i=1; i<=pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8); doc.setTextColor('#888')
    doc.text(`CRM 179 · ${c.client_id||''}`, 14, H-8)
    doc.text(`${i}/${pages}`, W-14, H-8, { align:'right' })
    doc.text(fmtDate(new Date(),'dd/MM/yyyy HH:mm'), W/2, H-8, { align:'center' })
  }
  doc.save(`Fiche_${c.client_id||'client'}_${variant}.pdf`)
}

function mix (a,b,t) {
  const ah = a.replace('#',''), bh = b.replace('#','')
  const ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab = parseInt(ah.slice(4,6),16)
  const br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb = parseInt(bh.slice(4,6),16)
  return [ Math.round(ar+(br-ar)*t), Math.round(ag+(bg-ag)*t), Math.round(ab+(bb-ab)*t) ]
}
