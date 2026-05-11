import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react'
import { extractPdfText, parseGroupeElsDevis } from '../../lib/pdf-parser'
import { useClients } from '../../hooks/useClients'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import { cls, fmtEUR } from '../../lib/utils'

export default function PdfDropZone ({ onDone }) {
  const { create, upsertContacts } = useClients()
  const toast = useToast()
  const [drag, setDrag] = useState(false)
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)

  const processFiles = useCallback(async (files) => {
    setBusy(true)
    const acc = []
    for (const f of Array.from(files)) {
      if (!f.name.toLowerCase().endsWith('.pdf')) {
        acc.push({ name:f.name, status:'error', error:'Pas un PDF' })
        continue
      }
      try {
        const txt = await extractPdfText(f)
        const parsed = parseGroupeElsDevis(txt)
        if (!parsed.raison_sociale) {
          acc.push({ name:f.name, status:'error', error:'Raison sociale non trouvée — format non reconnu' })
          continue
        }
        // Sauvegarder
        const { contacts, ...payload } = parsed
        const created = await create(payload)
        if (contacts?.length) await upsertContacts(created.id, contacts)
        acc.push({
          name:f.name, status:'ok', client_id: created.client_id,
          raison: parsed.raison_sociale, ttc: parsed.devis.montant_ttc,
          prime: parsed.devis.prime_cee
        })
      } catch (err) {
        console.error('PDF parse error', err)
        acc.push({ name:f.name, status:'error', error: err.message || 'Erreur de parsing' })
      }
    }
    setResults(r => [...r, ...acc])
    setBusy(false)
    const ok = acc.filter(x => x.status === 'ok').length
    if (ok) toast.success(`${ok} client(s) importé(s) ✨`)
    if (acc.some(x => x.status === 'error')) toast.warn('Certains PDF n\'ont pas pu être importés (cf. détail)')
    onDone?.()
  }, [create, upsertContacts, toast, onDone])

  const onDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDrag(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  const onPick = (e) => processFiles(e.target.files)

  return (
    <div className="card !p-0 overflow-hidden">
      <motion.label
        htmlFor="pdf-drop-input"
        onDragEnter={e=>{ e.preventDefault(); e.stopPropagation(); setDrag(true) }}
        onDragOver={e=>{ e.preventDefault(); e.stopPropagation(); setDrag(true) }}
        onDragLeave={e=>{ e.preventDefault(); e.stopPropagation(); setDrag(false) }}
        onDrop={onDrop}
        className={cls('block p-8 cursor-pointer transition-colors text-center',
          drag ? 'bg-copper-50 border-2 border-dashed border-copper-300' : 'bg-paper-100/40 border-2 border-dashed border-paper-300 hover:bg-paper-100')}>
        <input id="pdf-drop-input" type="file" multiple accept="application/pdf" className="hidden" onChange={onPick}/>
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-paper-50 border border-paper-300 grid place-items-center">
            {busy
              ? <span className="w-6 h-6 border-2 border-copper-400 border-t-transparent rounded-full animate-spin"/>
              : <UploadCloud className="w-6 h-6 text-copper-400"/>}
          </div>
          <div>
            <div className="font-display text-xl text-deep">Importer un ou plusieurs devis PDF</div>
            <div className="text-sm text-mute mt-1">
              {busy ? 'Lecture en cours…' : 'Glisse-dépose ici, ou clique pour choisir des fichiers. Format Groupe ELS détecté automatiquement.'}
            </div>
          </div>
        </div>
      </motion.label>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            className="border-t border-paper-300/70 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="eyebrow">Résultats de l'import</div>
                <button onClick={()=> setResults([])} className="text-soft hover:text-deep">
                  <X className="w-4 h-4"/>
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {results.map((r,i) => (
                  <div key={i} className={cls('rounded-md border px-3 py-2 flex items-center gap-2 text-sm',
                    r.status==='ok' ? 'bg-forest-50 border-forest-200' : 'bg-brick-50 border-brick-100')}>
                    {r.status==='ok'
                      ? <CheckCircle2 className="w-4 h-4 text-forest-400"/>
                      : <AlertCircle className="w-4 h-4 text-brick-400"/>}
                    <span className="num text-xs text-soft">{r.client_id || '—'}</span>
                    <span className="font-medium text-deep flex-1 truncate">{r.raison || r.name}</span>
                    {r.status==='ok' && r.ttc && <span className="num text-xs">{fmtEUR(r.ttc)}</span>}
                    {r.status==='ok' && r.prime && <span className="inline-flex items-center gap-1 text-[10px] text-copper-500"><Sparkles className="w-3 h-3"/>{fmtEUR(r.prime)}</span>}
                    {r.error && <span className="text-xs text-brick-400 ml-auto">{r.error}</span>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
