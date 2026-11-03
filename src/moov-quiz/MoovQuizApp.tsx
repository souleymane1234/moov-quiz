import { useLayoutEffect } from 'react'
import bodyHtml from './body.html?raw'
import script from './script.js?raw'
import { moovQuizAuth } from './auth-bridge'
import './moov-quiz.css'

let booted = false

/** Pages de l'artefact Moov Quiz, rendues telles quelles (balisage, styles et script d'origine). */
export function MoovQuizApp({ hash }: { hash: string }) {
  useLayoutEffect(() => {
    if (booted) return
    booted = true
    document.title = 'Moov Quiz — Réponds, cumule tes points, gagne chaque semaine'
    if (hash !== '#/' || !window.location.hash.startsWith('#')) {
      const wanted = hash === '#/' ? window.location.hash || '#/' : hash
      window.history.replaceState(null, '', window.location.pathname + window.location.search + wanted)
    }
    window.mqAuth = moovQuizAuth
    new Function(script)()
  }, [hash])

  return <div className="mq" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
}

const PAGES: Record<string, string> = {
  '/': '#/',
  '/competition': '#/competitions',
  '/concours': '#/competitions',
  '/actualites': '#/actualites',
  '/alertes': '#/alertes',
  '/play': '#/play',
  '/reels': '#/reels',
  '/partenariat': '#/partenariat',
}

export function moovQuizHashFor(pathname: string): string | undefined {
  return PAGES[pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname]
}
