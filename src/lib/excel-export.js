import * as XLSX from 'xlsx'
import { fmtDate, downloadBlob } from './utils'

export function exportClientsExcel (clients) {
  const wb = XLSX.utils.book_new()

  const clientRows = clients.map(c => ({
    'ID client':        c.client_id,
    'Raison sociale':   c.raison_sociale || '',
    'Type':             c.type_client || '',
    'SIRET':            c.siret || '',
    'Immat copro':      c.num_immatriculation_copro || '',
    'Nb logements':     c.nb_logements || '',
    'Adresse chantier': [c.adresse_chantier?.rue, c.adresse_chantier?.cp, c.adresse_chantier?.ville].filter(Boolean).join(' '),
    'Département':      c.adresse_chantier?.departement || '',
    'Zone':             c.zone_climatique || '',
    'Énergie':          c.energie_remplacee || '',
    'Coup de Pouce x3': c.coup_de_pouce_x3 ? 'Oui' : 'Non',
    'Statut client':    c.statut_client || '',
    'Statut devis':     c.statut_devis || '',
    'Score':            c.score_chaleur || 0,
    'Source':           c.source_lead || '',
    'Mandataire CEE':   c.mandataire_cee || ''
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientRows), 'Clients')

  const devisRows = clients.filter(c => c.devis?.numero).map(c => ({
    'ID client':    c.client_id,
    'Raison':       c.raison_sociale,
    'N° devis':     c.devis?.numero,
    'Date envoi':   c.devis?.date_envoi ? fmtDate(c.devis.date_envoi, 'dd/MM/yyyy') : '',
    'HT':           Number(c.devis?.montant_ht  || 0),
    'TTC':          Number(c.devis?.montant_ttc || 0),
    'Prime CEE estimée': Number(c.devis?.prime_cee || 0),
    'Prime CEE réelle':  c.prime_cee_reelle != null ? Number(c.prime_cee_reelle) : '',
    'Reste à charge':    Number(c.devis?.reste_charge || 0),
    'Statut':            c.statut_devis
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(devisRows), 'Devis')

  const ceeRows = clients.filter(c => c.dossier_cee?.numero_dossier_ebs || c.dossier_cee?.statut).map(c => ({
    'ID client':    c.client_id,
    'Raison':       c.raison_sociale,
    'N° dossier EBS': c.dossier_cee?.numero_dossier_ebs || '',
    'Statut':       c.dossier_cee?.statut || '',
    'Convention':   c.dossier_cee?.date_convention || '',
    'Engagement':   c.dossier_cee?.date_engagement || '',
    'Achèvement':   c.dossier_cee?.date_achevement || '',
    'Dépôt PNCEE':  c.dossier_cee?.date_depot_pncee || '',
    'Validation':   c.dossier_cee?.date_validation_pncee || '',
    'Versement':    c.dossier_cee?.date_versement_prime || '',
    'Volume CEE kWh': Number(c.volume_cee_estime || 0),
    'Prime estimée':  Number(c.devis?.prime_cee || 0),
    'Prime réelle':   c.prime_cee_reelle != null ? Number(c.prime_cee_reelle) : ''
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ceeRows), 'Dossier CEE')

  const signed = clients.filter(c => c.statut_devis === 'Signé')
  const totalTTC = signed.reduce((a,b)=> a + Number(b.devis?.montant_ttc||0), 0)
  const totalPrimeR = signed.reduce((a,b)=> a + (b.prime_cee_reelle != null ? Number(b.prime_cee_reelle) : Number(b.devis?.prime_cee||0)), 0)
  const totalReste = signed.reduce((a,b)=> a + Math.max(0, Number(b.devis?.montant_ttc||0) - Number(b.devis?.prime_cee||0)), 0)
  const synth = [
    { Indicateur: 'Nb clients total',      Valeur: clients.length },
    { Indicateur: 'Nb devis signés',       Valeur: signed.length },
    { Indicateur: 'Montant TTC signés',    Valeur: totalTTC },
    { Indicateur: 'Primes CEE (réelles)',  Valeur: totalPrimeR },
    { Indicateur: 'Restes à charge',       Valeur: totalReste },
    { Indicateur: 'CA RÉEL encaissé',      Valeur: totalReste + totalPrimeR }
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(synth), 'Synthèse')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  downloadBlob(new Blob([buf], { type:'application/octet-stream' }),
               `CRM179_export_${new Date().toISOString().slice(0,10)}.xlsx`)
}
