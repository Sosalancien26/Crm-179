import { fmtDate, fmtEUR } from './utils'

export const TEMPLATES = {
  convocation_ag: {
    label: 'Convocation AG — vote travaux PAC',
    build: (c) => {
      const ag = c.date_ag_prevue ? fmtDate(c.date_ag_prevue) : '[date AG]'
      const contact = c.crm179_contacts?.[0]
      const civ = (contact?.civilite === 'Mme' ? 'Madame' : 'Monsieur')
      const nom = contact?.nom || '[nom]'
      const adresse = [c.adresse_chantier?.rue, c.adresse_chantier?.cp, c.adresse_chantier?.ville].filter(Boolean).join(' ')
      return {
        subject: `Présentation des travaux de PAC collective — ${c.raison_sociale} — AG du ${ag}`,
        body: `${civ} ${nom},

Faisant suite à nos échanges concernant l'opération de remplacement de la chaufferie ${c.energie_remplacee || ''} par une pompe à chaleur collective air/eau au ${adresse}, je vous confirme ma présence à votre assemblée générale du ${ag}.

Je présenterai le devis n° ${c.devis?.numero || '[N° devis]'} d'un montant TTC de ${c.devis?.montant_ttc ? fmtEUR(c.devis.montant_ttc) : '[montant]'}, financé en partie par la prime CEE BAR-TH-179 d'un montant estimé de ${c.devis?.prime_cee ? fmtEUR(c.devis.prime_cee) : '[prime CEE]'} via notre mandataire EBS ENERGIE.

Je reste à votre disposition pour tout complément d'information en amont.

Cordialement,
Sacha — Groupe ELS`
      }
    }
  },
  relance_devis: {
    label: 'Relance — devis envoyé sans réponse',
    build: (c) => {
      const contact = c.crm179_contacts?.[0]
      const civ = (contact?.civilite === 'Mme' ? 'Madame' : 'Monsieur')
      const nom = contact?.nom || '[nom]'
      return {
        subject: `Devis ${c.devis?.numero || ''} — PAC collective — Relance`,
        body: `${civ} ${nom},

Je me permets de revenir vers vous concernant le devis n° ${c.devis?.numero || '[N° devis]'} envoyé le ${c.devis?.date_envoi ? fmtDate(c.devis.date_envoi) : '[date]'} pour l'installation de la pompe à chaleur collective au ${c.adresse_chantier?.ville || ''}.

Je reste à votre disposition pour répondre à vos questions techniques, financières, ou pour planifier une visite technique complémentaire si nécessaire.

Pour rappel, ce devis prévoit une prime CEE BAR-TH-179 de ${c.devis?.prime_cee ? fmtEUR(c.devis.prime_cee) : '[prime]'} et un reste à charge de ${c.devis?.reste_charge != null ? fmtEUR(c.devis.reste_charge) : '[reste]'}.

Cordialement,
Sacha — Groupe ELS`
      }
    }
  },
  rappel_signature: {
    label: 'Rappel — signature après AG validée',
    build: (c) => {
      const contact = c.crm179_contacts?.[0]
      const civ = (contact?.civilite === 'Mme' ? 'Madame' : 'Monsieur')
      const nom = contact?.nom || '[nom]'
      return {
        subject: `Suite favorable AG — Signature devis ${c.devis?.numero || ''}`,
        body: `${civ} ${nom},

Je suis ravi d'apprendre que votre assemblée générale a validé l'opération de pompe à chaleur collective.

Pour démarrer le dossier CEE auprès d'EBS ENERGIE et planifier les travaux, je vous prie de bien vouloir me retourner le devis n° ${c.devis?.numero || '[N° devis]'} signé, accompagné de la mention manuscrite "Lu et approuvé, bon pour accord" ainsi que la date de signature.

Documents complémentaires nécessaires :
- Attestation sur l'honneur signée
- PV d'assemblée générale validant les travaux
- Cadre de contribution

Cordialement,
Sacha — Groupe ELS`
      }
    }
  }
}
