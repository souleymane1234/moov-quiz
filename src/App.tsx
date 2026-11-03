import { useEffect, type ReactNode } from 'react'
import { Navbar } from './components/Navbar'
import { ActualiteDetailPage } from './components/ActualiteDetailPage'
import { MediaHubPage } from './components/MediaHubPage'
import { AlertesPage } from './components/AlertesPage'
import { AlerteDetailPage } from './components/AlerteDetailPage'
import { PlayPage } from './components/PlayPage'
import { PlayQuizPage } from './components/PlayQuizPage'
import { ReelsPage } from './components/ReelsPage'
import { ConcoursPage } from './components/ConcoursPage'
import { CandidateShowroomPage } from './components/CandidateShowroomPage'
import { VotePage } from './components/VotePage'
import { PartenariatPage } from './components/PartenariatPage'
// import { AcademyPromo } from './components/AcademyPromo'
import { ConnexionPage } from './components/ConnexionPage'
import { CandidaturePage } from './components/CandidaturePage'
import { ExpertPage } from './components/ExpertPage'
import { ProfilPage } from './components/ProfilPage'
import { SearchPage } from './components/SearchPage'
import { Footer } from './components/Footer'
import { MoovQuizApp, moovQuizHashFor } from './moov-quiz/MoovQuizApp'
import { isMediaDetailPath, isMediaListPath } from './lib/media-hubs'
import './App.css'

function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <div className="ticks" />
      <Footer />
    </>
  )
}

function App() {
  const pathname = window.location.pathname

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const hash = window.location.hash
    // Garder le scroll vers une ancre dédiée (#contact, etc.)
    if (hash && hash !== '#' && hash !== '#accueil') return

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  const moovHash = moovQuizHashFor(pathname)
  if (moovHash) return <MoovQuizApp hash={moovHash} />

  if (pathname === '/alertes' || pathname === '/alertes/') {
    return (
      <PageShell>
        <AlertesPage />
      </PageShell>
    )
  }

  if (/^\/alertes\/[^/]+\/?$/.test(pathname)) {
    return (
      <PageShell>
        <AlerteDetailPage />
      </PageShell>
    )
  }

  if (pathname === '/play' || pathname === '/play/') {
    return (
      <PageShell>
        <PlayPage />
      </PageShell>
    )
  }

  if (/^\/play\/[^/]+\/?$/.test(pathname)) {
    return (
      <PageShell>
        <PlayQuizPage />
      </PageShell>
    )
  }

  if (pathname === '/reels' || pathname === '/reels/') {
    return (
      <>
        <Navbar />
        <ReelsPage />
      </>
    )
  }

  if (isMediaDetailPath(pathname)) {
    return (
      <PageShell>
        <ActualiteDetailPage />
      </PageShell>
    )
  }

  if (isMediaListPath(pathname)) {
    return (
      <PageShell>
        <MediaHubPage />
      </PageShell>
    )
  }

  if (pathname.startsWith('/showroom/')) {
    return (
      <PageShell>
        <CandidateShowroomPage />
      </PageShell>
    )
  }

  if (pathname.startsWith('/vote/')) {
    return (
      <PageShell>
        <VotePage />
      </PageShell>
    )
  }

  if (
    pathname.startsWith('/competition') ||
    pathname.startsWith('/concours')
  ) {
    return (
      <PageShell>
        <ConcoursPage />
      </PageShell>
    )
  }

  if (pathname.startsWith('/metiers')) {
    window.location.replace('/competition')
    return null
  }

  if (pathname.startsWith('/contact')) {
    window.location.replace('/partenariat#contact')
    return null
  }

  if (pathname.startsWith('/partenariat')) {
    return (
      <PageShell>
        <PartenariatPage />
      </PageShell>
    )
  }

  if (
    pathname.startsWith('/inscription-candidat') ||
    pathname.startsWith('/candidature')
  ) {
    return (
      <PageShell>
        <CandidaturePage />
      </PageShell>
    )
  }

  if (pathname.startsWith('/inscription-expert')) {
    return (
      <PageShell>
        <ExpertPage />
      </PageShell>
    )
  }

  if (pathname.startsWith('/connexion') || pathname.startsWith('/inscription')) {
    return <ConnexionPage />
  }

  if (pathname === '/recherche' || pathname === '/recherche/') {
    return (
      <PageShell>
        <SearchPage />
      </PageShell>
    )
  }

  if (pathname.startsWith('/profil')) {
    return (
      <PageShell>
        <ProfilPage />
      </PageShell>
    )
  }

  return <MoovQuizApp hash="#/" />
}

export default App
