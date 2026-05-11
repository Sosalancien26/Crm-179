import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs'
import { deptFromCP, zoneClimatique } from './geocoding'
import { isCoupDePouceX3, calcVolumeCEE } from './cee'

// Configurer le worker (chargé depuis CDN pour simplifier)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.worker.min.mjs'

/** Extrait tout le texte d'un PDF en un string. */
export async function extractPdfText (file) {
  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise
  let txt = ''
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    txt += content.items.map(it => it.str).join(' ') + '\n'
  }
  return txt
}

/**
 * Parse un PDF de devis Groupe ELS et renvoie un payload prêt
 * pour useClients.create(). Format ultra standardisé donc regex.
 */
export function parseGroupeElsDevis (text) {
  const out = {
    raison_sociale: null,
    siret: null,
    nb_logements: null,
    adresse_chantier: { rue:'', cp:'', ville:'', departement:'', pays:'France' },
    adresse_facturation: { rue:'', cp:'', ville:'', departement:'', pays:'France' },
    adresse_identique: false,
    zone_climatique: null,
    type_client: null,
    energie_remplacee: null,
    coup_de_pouce_x3: false,
    caracteristiques_techniques: {
      type_batiment: 'Copro existante',
      usage: null,
      puissance_pac: null,
      etas: null,
      pac_marque: null,
      pac_reference: null,
      pac_unites: null,
      numero_client_interne: null
    },
    devis: {
      numero: null, date_envoi: null,
      montant_ht: null, montant_ttc: null,
      prime_cee: null, reste_charge: null
    },
    volume_cee_estime: null,
    statut_client: 'Devis envoyé',
    statut_devis: 'Envoyé',
    source_lead: 'Apporteur',
    mandataire_cee: 'EBS ENERGIE',
    score_chaleur: 3,
    notes: '',
    contacts: []  // sera transformé en crm179_contacts par l'appelant
  }

  // === N° devis ===
  const mDevis = text.match(/DEVIS\s*:\s*(DE\d+-\d+)/i)
  if (mDevis) out.devis.numero = mDevis[1]

  // === Date (format français) ===
  const mDate = text.match(/Date\s*:\s*(\d{2})\/(\d{2})\/(\d{4})/)
  if (mDate) out.devis.date_envoi = `${mDate[3]}-${mDate[2]}-${mDate[1]}`

  // === Raison sociale — entre la fin du N° devis et "Numéro client" ===
  // Stratégie : capture le bloc texte juste avant "Numéro client" ou "SIRET"
  const mRaison = text.match(/DE\d+-\d+\s+(.+?)(?:\s+SIRET\s*:|\s+Numéro client\s*:)/i)
  if (mRaison) out.raison_sociale = mRaison[1].trim().replace(/\s+/g, ' ')

  // === SIRET ===
  const mSiret = text.match(/SIRET\s*:\s*(\d{14})/i)
  if (mSiret) out.siret = mSiret[1]

  // === Numéro client interne ===
  const mNumCli = text.match(/Numéro client\s*:\s*([\d-]+)/i)
  if (mNumCli) out.caracteristiques_techniques.numero_client_interne = mNumCli[1]

  // === Adresse des travaux (chantier) ===
  const mAdr = text.match(/Adresse des travaux\s*:\s*(.+?)\s+(?:Nom du correspondant|Matériel|Nom du site)/i)
  if (mAdr) {
    const a = mAdr[1].trim()
    const mCP = a.match(/(\d{5})\s+(.+)$/)
    if (mCP) {
      out.adresse_chantier.cp = mCP[1]
      out.adresse_chantier.ville = mCP[2].trim()
      out.adresse_chantier.rue = a.replace(mCP[0], '').trim()
      out.adresse_chantier.departement = deptFromCP(mCP[1]) || ''
    } else {
      out.adresse_chantier.rue = a
    }
  }

  // === Zone climatique ===
  const mZone = text.match(/Zone\s*:\s*(H[123])/i)
  if (mZone) out.zone_climatique = mZone[1].toUpperCase()
  else if (out.adresse_chantier.departement) out.zone_climatique = zoneClimatique(out.adresse_chantier.departement)

  // === Énergie remplacée (chaudière à remplacer) ===
  const mEnergie = text.match(/Type énergie de la chaudière à remplacer\s*:\s*(\w+)/i)
  if (mEnergie) {
    out.energie_remplacee = mEnergie[1].charAt(0).toUpperCase() + mEnergie[1].slice(1).toLowerCase()
    out.coup_de_pouce_x3 = isCoupDePouceX3(out.energie_remplacee)
  }
  // ou Type de chauffage : Gaz
  if (!out.energie_remplacee) {
    const m2 = text.match(/Type de chauffage\s*:\s*(\w+)/i)
    if (m2) {
      out.energie_remplacee = m2[1].charAt(0).toUpperCase() + m2[1].slice(1).toLowerCase()
      out.coup_de_pouce_x3 = isCoupDePouceX3(out.energie_remplacee)
    }
  }

  // === Usage (chauffage seul / chauffage + ECS) ===
  const mUsage = text.match(/besoins en\s*:\s*(chauffage\s*seul|chauffage\s*et\s*eau\s*chaude\s*sanitaire)/i)
  if (mUsage) {
    out.caracteristiques_techniques.usage =
      /seul/i.test(mUsage[1]) ? 'Chauffage seul' : 'Chauffage + ECS'
  }

  // === Puissance totale ===
  const mPwr = text.match(/Puissance totale utile.*?:\s*(\d+)\s*kW/i)
  if (mPwr) out.caracteristiques_techniques.puissance_pac = Number(mPwr[1])

  // === Nb appartements ===
  const mNb = text.match(/Nombre d'appartement\s*:\s*(\d+)/i)
  if (mNb) out.nb_logements = Number(mNb[1])

  // === kWh Cumac (volume estimé du devis) ===
  const mCumac = text.match(/Kwh\s*Cumac\s*:\s*([\d\s]+)/i)
  if (mCumac) out.volume_cee_estime = Number(mCumac[1].replace(/\s/g, ''))

  // === Prime CEE EBS ===
  const mPrime = text.match(/Prime\s*CEE.*?:\s*([\d\s]+),(\d{2})\s*€/i)
  if (mPrime) out.devis.prime_cee = Number(mPrime[1].replace(/\s/g, '')) + Number('0.'+mPrime[2])

  // === ETAS ===
  const mEtas = text.match(/Efficacité énergétique saisonnière[^:]*:\s*(\d+)\s*%/i)
  if (mEtas) out.caracteristiques_techniques.etas = Number(mEtas[1])

  // === Marque & référence PAC ===
  const mPac = text.match(/Marque\s*:\s*([A-Z]+)/i)
  if (mPac) out.caracteristiques_techniques.pac_marque = mPac[1]
  const mRef = text.match(/Référence\s*:\s*([A-Z0-9\s\-]+?)\s+(?:Efficacité|Marque)/i)
  if (mRef) out.caracteristiques_techniques.pac_reference = mRef[1].trim()

  // === Nb unités PAC ===
  const mUnit = text.match(/(\d+)\s*unité.*?\d[\d\s]*\,\d{2}\s*€/i)
  if (mUnit) out.caracteristiques_techniques.pac_unites = Number(mUnit[1])

  // === Montant total HT/TTC ===
  const mHT  = text.match(/Prix\s*Total\s*HT\s+([\d\s]+),(\d{2})\s*€/i)
  if (mHT)  out.devis.montant_ht  = Number(mHT[1].replace(/\s/g, '')) + Number('0.'+mHT[2])
  const mTTC = text.match(/Prix\s*Total\s*TTC\s+([\d\s]+),(\d{2})\s*€/i)
  if (mTTC) out.devis.montant_ttc = Number(mTTC[1].replace(/\s/g, '')) + Number('0.'+mTTC[2])

  // === Reste à payer ===
  const mReste = text.match(/Reste\s*à\s*payer\s+([\d\s]+),(\d{2})\s*€/i)
  if (mReste) out.devis.reste_charge = Number(mReste[1].replace(/\s/g, '')) + Number('0.'+mReste[2])

  // === Type de client (heuristique) ===
  const rs = (out.raison_sociale || '').toUpperCase()
  if (/SYNDICAT|SYNDIC/i.test(rs))     out.type_client = 'Copropriété (Syndic)'
  else if (/CABINET|MAZET|FONCIA|CITYA|LOISELET/i.test(rs)) out.type_client = 'Copropriété (Syndic)'
  else if (/SCI\b/i.test(rs))          out.type_client = 'SCI'
  else if (/ASL\b/i.test(rs))          out.type_client = 'ASL'
  else if (out.siret)                  out.type_client = 'Copropriété (Syndic)'
  else                                 out.type_client = 'Copropriété (Syndic)'

  // === Adresse facturation ≠ chantier (heuristique) ===
  // On cherche une seconde adresse en bas du bloc en-tête
  // Format typique : "RAISON_SOCIALE\nRUE\nCP VILLE\n+33..."
  // Pour rester simple : si on trouve "RUE FALQUE" ou autre adresse différente avant Zone, on l'utilise
  // À défaut : adresse_identique = true
  out.adresse_identique = true
  out.adresse_facturation = { ...out.adresse_chantier }

  // === Contact principal (Nom du correspondant) ===
  const mCorr = text.match(/Nom du correspondant\s*:\s*([A-ZÀ-Ÿ\s\-]+?)\s+(\+33\d{9}|\+33\s\d{8,}|0\d{9})/i)
  if (mCorr) {
    const fullName = mCorr[1].trim().split(/\s+/)
    out.contacts.push({
      ordre: 1,
      civilite: 'M.',
      nom: fullName[0] || null,
      prenom: fullName.slice(1).join(' ') || null,
      fonction: null,
      tel_mobile: mCorr[2].replace(/\s/g, ''),
      email: null
    })
    // Fonction
    const mFct = text.match(/Fonction\s*:\s*([A-ZÉÈÊÀ\s]+?)(?:\s+\+33|\s+E-?mail)/i)
    if (mFct) out.contacts[0].fonction = mFct[1].trim()
    // Email
    const mEmail = text.match(/[Ee]-?mail\s*:\s*([\w.\-]+@[\w.\-]+)/i)
    if (mEmail) out.contacts[0].email = mEmail[1]
  }

  // Notes auto
  out.notes = `Import auto depuis PDF devis ${out.devis.numero || ''}. Format Groupe ELS.`

  return out
}
