import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export const cls = (...xs) => xs.filter(Boolean).join(' ')

export const fmtEUR = (n, opts={}) =>
  new Intl.NumberFormat('fr-FR', { style:'currency', currency:'EUR', maximumFractionDigits:0, ...opts })
    .format(Number(n||0))

export const fmtNum = (n, opts={}) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits:0, ...opts }).format(Number(n||0))

export const fmtPct = (n, opts={}) =>
  new Intl.NumberFormat('fr-FR', { style:'percent', maximumFractionDigits:1, ...opts }).format(Number(n||0))

export const fmtDate = (v, pattern='dd MMM yyyy') => {
  if (!v) return '—'
  const d = typeof v === 'string' ? parseISO(v) : v
  if (Number.isNaN(d?.getTime?.())) return '—'
  return format(d, pattern, { locale: fr })
}

export const fmtRelative = v => {
  if (!v) return '—'
  const d = typeof v === 'string' ? parseISO(v) : v
  return formatDistanceToNow(d, { addSuffix:true, locale:fr })
}

export const safe = (o, path, fb) =>
  path.split('.').reduce((acc,k)=> (acc==null ? acc : acc[k]), o) ?? fb

export const debounce = (fn, ms=250) => {
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(()=> fn(...args), ms) }
}

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(()=> URL.revokeObjectURL(url), 1000)
}

export const exportCSV = (rows, filename='export.csv') => {
  if (!rows?.length) return
  const cols = Object.keys(rows[0])
  const head = cols.join(';')
  const body = rows.map(r => cols.map(c => {
    const v = r[c] == null ? '' : String(r[c]).replace(/"/g,'""')
    return /[;\n"]/.test(v) ? `"${v}"` : v
  }).join(';')).join('\n')
  downloadBlob(new Blob(['﻿'+head+'\n'+body], { type:'text/csv;charset=utf-8' }), filename)
}

export const initials = (s='') =>
  s.trim().split(/\s+/).slice(0,2).map(w=>w[0]?.toUpperCase()||'').join('') || '?'

export const hexToRgba = (hex, a=1) => {
  if (!hex) return `rgba(124,58,237,${a})`
  const h = hex.replace('#','')
  const v = h.length === 3 ? h.split('').map(c=>c+c).join('') : h
  const r = parseInt(v.substr(0,2),16)
  const g = parseInt(v.substr(2,2),16)
  const b = parseInt(v.substr(4,2),16)
  return `rgba(${r},${g},${b},${a})`
}

export const stringHash = s => {
  let h = 0
  for (let i=0; i<s.length; i++) h = (h<<5) - h + s.charCodeAt(i) | 0
  return h
}
