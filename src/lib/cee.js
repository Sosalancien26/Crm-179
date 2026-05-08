/**
 * Calcul indicatif du volume CEE (kWh cumac) pour la fiche
 * BAR-TH-179 — Pompe à chaleur collective air/eau, résidentiel collectif.
 *
 * ⚠️ Référence métier : le montant final dépend du certificat RGE,
 * de l'ETAS, de la zone climatique et du nombre de logements desservis.
 * Ce calcul reste indicatif côté CRM (la pige et la prime exacte
 * sont confirmées par le mandataire).
 *
 * Forfaits BAR-TH-179 (kWh cumac / logement, MaPrimeRénov' Copropriété
 * exclu) — usage chauffage seul / chauffage + ECS, par zone H1/H2/H3.
 */
const FORFAIT = {
  'Chauffage seul':         { H1: 56000, H2: 38800, H3: 26800 },
  'Chauffage + ECS':        { H1: 73600, H2: 51200, H3: 35200 }
}

/** Bonus Coup de Pouce x3 si fioul/gaz/charbon remplacés. */
const ENERGIES_X3 = new Set(['Fioul','Gaz','Charbon'])

export function isCoupDePouceX3 (energieRemplacee) {
  return ENERGIES_X3.has(String(energieRemplacee||'').trim())
}

export function calcVolumeCEE ({ usage, zone, nbLogements, energieRemplacee, etas }) {
  const u = usage && FORFAIT[usage] ? usage : 'Chauffage seul'
  const z = zone && FORFAIT[u][zone] ? zone : 'H2'
  const n = Number(nbLogements||0)
  if (!n) return 0
  let base = FORFAIT[u][z] * n
  // Coup de pouce x3 (selon énergie remplacée éligible)
  if (isCoupDePouceX3(energieRemplacee)) base *= 3
  // Légère pondération ETAS si fournie (référence 126%)
  const etasNum = Number(etas||0)
  if (etasNum > 0) {
    const ratio = Math.min(1.10, Math.max(0.90, etasNum / 126))
    base = Math.round(base * ratio)
  }
  return Math.round(base)
}

/**
 * Estimation simple de la prime CEE, en €.
 * Hypothèse de prix : 8 € / MWh cumac (ordre de grandeur 2025).
 */
export function estimerPrimeCEE (kWhCumac, prixMWhCumac = 8) {
  return Math.round((Number(kWhCumac||0) / 1000) * Number(prixMWhCumac))
}

/** Items de la checklist conformité (clé / libellé). */
export const CHECKLIST_ITEMS = [
  { key: 'devis_signe',          label: 'Devis signé avant démarrage' },
  { key: 'cadre_contribution',   label: 'Cadre de contribution rempli' },
  { key: 'attestation_honneur',  label: 'Attestation sur l’honneur signée' },
  { key: 'note_dimensionnement', label: 'Note de dimensionnement remise' },
  { key: 'facture_emise',        label: 'Facture émise' },
  { key: 'rge_qualipac',         label: 'Certificat RGE QualiPAC valide' },
  { key: 'immat_copro',          label: 'N° immatriculation copro vérifié' },
  { key: 'photos_avant_apres',   label: 'Photos avant/après' },
  { key: 'date_engagement',      label: 'Date d’engagement enregistrée' },
  { key: 'date_achevement',      label: 'Date d’achèvement enregistrée' }
]

export function checklistProgress (checklist={}) {
  const total = CHECKLIST_ITEMS.length
  const done  = CHECKLIST_ITEMS.filter(i => !!checklist?.[i.key]).length
  return { done, total, pct: total ? done/total : 0 }
}
