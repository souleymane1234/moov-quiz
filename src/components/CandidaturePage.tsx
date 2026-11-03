import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FaCalendarDays,
  FaCheck,
  FaEnvelope,
  FaFlag,
  FaGlobe,
  FaStar,
  FaTrophy,
  FaWrench,
} from 'react-icons/fa6'
import { emissionRequest } from '../lib/emission-request'
import { uploadsApi, profileApi } from '../services/api-client'
import { useEditionApplicationStatus } from '../hooks/use-edition-application-status'
import { getAuthEventName, isApiLoggedIn } from '../lib/auth-session'
import {
  applyProfileSeed,
  buildCompetitorSeedFromProfile,
} from '../lib/map-profile-to-candidature'
import { AlreadyAppliedNotice } from './AlreadyAppliedNotice'
import { PageLoader } from './PageLoader'
import { CaptchaField } from './CaptchaField'
import './CandidaturePage.css'
import './ConcoursPage.css'

const STEPS = [
  'Informations personnelles',
  'Établissement & métier',
  'Parcours & expérience',
  'Documents',
  'Confirmation',
] as const

const GENDER_OPTIONS = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
] as const

type FileState = File | null

type FormState = {
  pseudo: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  nationality: string
  identityNumber: string
  residence: string
  contactEmail: string
  contactPhone: string
  countryId: string
  jobSheetId: string
  specializationJobTagId: string
  secondaryJobSheetIds: string[]
  institutionTypeId: string
  schoolId: string
  schoolCity: string
  levelId: string
  classe: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  experiences: string
  complementarySkills: string
  motivation: string
  identityDocument: FileState
  photo: FileState
  cv: FileState
  diploma: FileState
  video: FileState
  consent: boolean
}

const INITIAL_FORM: FormState = {
  pseudo: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  nationality: '',
  identityNumber: '',
  residence: '',
  contactEmail: '',
  contactPhone: '',
  countryId: '',
  jobSheetId: '',
  specializationJobTagId: '',
  secondaryJobSheetIds: [],
  institutionTypeId: '',
  schoolId: '',
  schoolCity: '',
  levelId: '',
  classe: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  experiences: '',
  complementarySkills: '',
  motivation: '',
  identityDocument: null,
  photo: null,
  cv: null,
  diploma: null,
  video: null,
  consent: false,
}

function FileField({
  label,
  hint,
  accept,
  required,
  file,
  preview,
  onChange,
}: {
  label: string
  hint?: string
  accept: string
  required?: boolean
  file: File | null
  preview?: 'image' | 'video'
  onChange: (file: File | null) => void
}) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  return (
    <label className="candidature-form__file">
      <span>
        {label}
        {required ? <em> *</em> : null}
      </span>
      {hint ? <small>{hint}</small> : null}
      <input
        type="file"
        accept={accept}
        required={required}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      {file ? <p className="candidature-form__file-name">{file.name}</p> : null}
      {url && preview === 'image' ? (
        <img className="candidature-form__preview" src={url} alt="" />
      ) : null}
      {url && preview === 'video' ? (
        <video className="candidature-form__preview candidature-form__preview--video" src={url} controls />
      ) : null}
    </label>
  )
}

export function CandidaturePage() {
  const [loggedIn, setLoggedIn] = useState(isApiLoggedIn)
  const [step, setStep] = useState(0)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [ageBlockOpen, setAgeBlockOpen] = useState(false)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const profilePrefilledRef = useRef(false)

  const onAuthChange = useCallback(() => setLoggedIn(isApiLoggedIn()), [])
  useEffect(() => {
    window.addEventListener(getAuthEventName(), onAuthChange)
    window.addEventListener('storage', onAuthChange)
    return () => {
      window.removeEventListener(getAuthEventName(), onAuthChange)
      window.removeEventListener('storage', onAuthChange)
    }
  }, [onAuthChange])

  useEffect(() => {
    if (!loggedIn) profilePrefilledRef.current = false
  }, [loggedIn])

  const profileQuery = useQuery({
    queryKey: ['student-profile', 'candidature'],
    queryFn: () => profileApi.get(),
    enabled: loggedIn,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const {
    editionId,
    hasApplied,
    appliedAs,
    applicationStatus,
    isLoading: candidatureLoading,
  } = useEditionApplicationStatus(loggedIn)

  const optionsQuery = useQuery({
    queryKey: ['participation-options', editionId],
    queryFn: () => emissionRequest.getParticipationOptions(editionId!),
    enabled: Boolean(editionId),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options = (optionsQuery.data as any)?.data ?? null
  const optionsLoading = optionsQuery.isLoading

  const countries: { id: string; name: string; code: string | null }[] = options?.countries ?? []
  // Use all countries from the API without filtering
  const jobSheets: { id: string; title: string; specializations?: { id: string; name: string }[] }[] = options?.jobSheets ?? []
  const institutionTypes: { id: string; name: string }[] = options?.institutionTypes ?? []
  const schools: { id: string; name: string; city: string }[] = options?.schools ?? []
  const levels: { id: string; label: string }[] = options?.levels ?? []
  const classes: string[] = options?.classes ?? []

  const selectedJobSheet = useMemo(
    () => jobSheets.find((js) => js.id === form.jobSheetId),
    [jobSheets, form.jobSheetId],
  )
  const specializations = selectedJobSheet?.specializations ?? []

  useEffect(() => {
    if (
      profilePrefilledRef.current ||
      !loggedIn ||
      hasApplied ||
      sent ||
      profileQuery.isLoading ||
      optionsLoading
    ) {
      return
    }

    const seed = buildCompetitorSeedFromProfile(profileQuery.data ?? null, {
      countries,
      levels,
    })
    setForm((current) => applyProfileSeed(current, seed))
    profilePrefilledRef.current = true
  }, [
    loggedIn,
    hasApplied,
    sent,
    profileQuery.data,
    profileQuery.isLoading,
    optionsLoading,
    countries,
    levels,
  ])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step, sent])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const setSecondarySlot = (slot: 0 | 1, jobSheetId: string) => {
    setForm((f) => {
      const slots: [string, string] = [
        f.secondaryJobSheetIds[0] ?? '',
        f.secondaryJobSheetIds[1] ?? '',
      ]
      slots[slot] = jobSheetId
      const next = slots
        .filter((id) => id && id !== f.jobSheetId)
        .filter((id, index, arr) => arr.indexOf(id) === index)
      return { ...f, secondaryJobSheetIds: next.slice(0, 2) }
    })
  }

  const secondaryJobOptions = useMemo(
    () => jobSheets.filter((js) => js.id !== form.jobSheetId),
    [jobSheets, form.jobSheetId],
  )

  const getAge = (dob: string) => {
    if (!dob) return null
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1
    return Number.isFinite(age) ? age : null
  }

  const canGoNext = () => {
    if (step === 0) {
      return Boolean(
        form.firstName && form.lastName && form.dateOfBirth && form.gender &&
        form.nationality && form.identityNumber && form.residence &&
        form.contactEmail && form.contactPhone && form.countryId,
      )
    }
    if (step === 1) {
      return Boolean(
        form.jobSheetId && form.institutionTypeId && form.levelId && form.classe &&
        form.emergencyContactName && form.emergencyContactPhone && form.emergencyContactRelation,
      )
    }
    if (step === 2) {
      return Boolean(form.experiences && form.motivation)
    }
    if (step === 3) {
      return Boolean(form.identityDocument && form.photo && form.video)
    }
    return form.consent && captchaChecked
  }

  const goNext = () => {
    if (!canGoNext()) return
    if (step === 0) {
      const age = getAge(form.dateOfBirth)
      if (age !== null && age < 16) {
        setAgeBlockOpen(true)
        return
      }
    }
    setStep((current) => Math.min(current + 1, STEPS.length - 1))
  }

  const goPrev = () => setStep((current) => Math.max(current - 1, 0))

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (hasApplied) {
      setSubmitError(
        appliedAs === 'expert'
          ? 'Vous avez déjà candidaté comme expert pour cette édition.'
          : 'Vous avez déjà candidaté pour cette édition.',
      )
      return
    }
    if (!captchaChecked) {
      setSubmitError('Veuillez confirmer que vous n\'êtes pas un robot.')
      return
    }
    if (!canGoNext() || !editionId) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const [videoRes, photoRes, idDocRes, cvRes, diplomaRes] = await Promise.all([
        form.video ? uploadsApi.uploadVideo(form.video) : null,
        form.photo ? uploadsApi.uploadImage(form.photo) : null,
        form.identityDocument ? uploadsApi.uploadFile(form.identityDocument) : null,
        form.cv ? uploadsApi.uploadFile(form.cv) : null,
        form.diploma ? uploadsApi.uploadFile(form.diploma) : null,
      ])

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: Record<string, any> = {
        pseudo: form.pseudo || undefined,
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        nationality: form.nationality,
        identityNumber: form.identityNumber,
        residence: form.residence,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        countryId: form.countryId,
        jobSheetId: form.jobSheetId,
        institutionTypeId: form.institutionTypeId,
        levelId: form.levelId,
        classe: form.classe,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        emergencyContactRelation: form.emergencyContactRelation,
        experiences: form.experiences,
        motivation: form.motivation,
        age: form.dateOfBirth,
      }

      if (videoRes) body.videoId = videoRes.data.id
      if (photoRes) body.candidatePicture = photoRes.data.url
      if (idDocRes) body.identityDocumentUrl = idDocRes.data.url
      if (cvRes) body.cvUrl = cvRes.data.url
      if (diplomaRes) body.diplomaUrl = diplomaRes.data.url

      if (form.specializationJobTagId) body.specializationJobTagId = form.specializationJobTagId
      if (form.secondaryJobSheetIds.length > 0) body.secondaryJobSheetIds = form.secondaryJobSheetIds
      if (form.schoolId) body.schoolId = form.schoolId
      if (form.schoolCity) body.schoolCity = form.schoolCity
      if (form.complementarySkills) body.complementarySkills = form.complementarySkills

      await emissionRequest.applyCompetitor(editionId, body)
      setSent(true)
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message
        ?? (err as any)?.message
        ?? 'Impossible d\u2019envoyer votre candidature.'
      setSubmitError(String(msg))
    } finally {
      setSubmitting(false)
    }
  }

  const selectedSkillName = jobSheets.find((js) => js.id === form.jobSheetId)?.title ?? '—'

  return (
    <main className="candidature-page" aria-labelledby="candidature-page-title">
      <header className="candidature-page__hero">
        <span className="candidature-page__hero-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3.2" />
            <path d="M5.5 19c1.4-3.4 3.6-5 6.5-5s5.1 1.6 6.5 5" />
          </svg>
        </span>
        <div>
          <h1 id="candidature-page-title">Inscription candidat</h1>
          <p>Côte d&apos;Ivoire Skills 2026</p>
        </div>
      </header>

      <ol className="candidature-page__steps" aria-label="Étapes d'inscription">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`candidature-page__step${index === step ? ' is-current' : ''}${
              index < step ? ' is-done' : ''
            }`}
          >
            <span>{index < step ? '✓' : index + 1}</span>
            <strong>{label}</strong>
          </li>
        ))}
      </ol>

      <div className="candidature-page__layout">
        <section className="candidature-page__panel">
          {!loggedIn ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, padding: '64px 24px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'color-mix(in srgb, #f59e0b 12%, transparent)', display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Connexion requise</h2>
              <p style={{ margin: 0, maxWidth: 440, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Vous devez être connecté pour soumettre votre candidature.
                Connectez-vous ou créez un compte pour continuer.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                <a
                  href="/connexion"
                  className="candidature-form__btn"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minWidth: 180 }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Se connecter
                </a>
                <a
                  href="/inscription"
                  className="candidature-form__btn candidature-form__btn--ghost"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minWidth: 180 }}
                >
                  Créer un compte
                </a>
              </div>
            </div>
          ) : candidatureLoading ? (
            <PageLoader label="Vérification en cours…" fullPage />
          ) : hasApplied ? (
            <AlreadyAppliedNotice
              page="candidate"
              appliedAs={appliedAs}
              applicationStatus={applicationStatus}
            />
          ) : sent ? (
            <div
              className="candidature-page__success"
              role="status"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: '48px 24px' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'color-mix(in srgb, #16a34a 12%, transparent)', display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Candidature envoyée</h2>
              <p style={{ margin: 0, maxWidth: 420, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Merci <strong>{form.firstName}</strong>. Votre dossier sera examiné par
                l&apos;équipe Côte d&apos;Ivoire Skills. Après validation, vous recevrez
                votre badge virtuel par e-mail ou WhatsApp.
              </p>
              <a
                href="/"
                className="candidature-form__btn"
                style={{ marginTop: 8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minWidth: 200 }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9.5L12 4l9 5.5" />
                  <path d="M19 13v6a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-6" />
                </svg>
                Retour à l&apos;accueil
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              {/* ── ÉTAPE 1 : Informations personnelles ── */}
              {step === 0 ? (
                <fieldset className="candidature-form">
                  <legend>1. Informations personnelles</legend>
                  <div className="candidature-form__grid">
                    <label>
                      Pseudo <em>*</em>
                      <input
                        value={form.pseudo}
                        onChange={(e) => update('pseudo', e.target.value)}
                        placeholder="Ex : Competitor2026"
                        required
                      />
                    </label>
                    <label>
                      Prénoms <em>*</em>
                      <input
                        value={form.firstName}
                        onChange={(e) => update('firstName', e.target.value)}
                        placeholder="Entrez vos prénoms"
                        autoComplete="given-name"
                        required
                      />
                    </label>
                    <label>
                      Nom <em>*</em>
                      <input
                        value={form.lastName}
                        onChange={(e) => update('lastName', e.target.value)}
                        placeholder="Entrez votre nom"
                        autoComplete="family-name"
                        required
                      />
                    </label>
                    <label>
                      Date de naissance <em>*</em>
                      <input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => update('dateOfBirth', e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Genre <em>*</em>
                      <select value={form.gender} onChange={(e) => update('gender', e.target.value)} required>
                        <option value="">Sélectionnez</option>
                        {GENDER_OPTIONS.map((g) => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Pays de nationalité <em>*</em>
                      {countries.length > 0 ? (
                        <select
                          value={form.nationality}
                          onChange={(e) => update('nationality', e.target.value)}
                          required
                          disabled={optionsLoading}
                        >
                          <option value="">{optionsLoading ? 'Chargement…' : 'Sélectionnez'}</option>
                          {countries.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={form.nationality}
                          onChange={(e) => update('nationality', e.target.value)}
                          placeholder="Ex : Ivoirienne"
                          required
                        />
                      )}
                    </label>
                    <label>
                      Pays de résidence <em>*</em>
                      {countries.length > 0 ? (
                        <select
                          value={form.countryId}
                          onChange={(e) => update('countryId', e.target.value)}
                          required
                          disabled={optionsLoading}
                        >
                          <option value="">{optionsLoading ? 'Chargement…' : 'Sélectionnez votre pays de résidence'}</option>
                          {countries.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={form.countryId}
                          onChange={(e) => update('countryId', e.target.value)}
                          placeholder="ID du pays"
                          required
                        />
                      )}
                    </label>
                    <label>
                      N° pièce d&apos;identité <em>*</em>
                      <input
                        value={form.identityNumber}
                        onChange={(e) => update('identityNumber', e.target.value)}
                        placeholder="CNI ou passeport"
                        required
                      />
                    </label>
                    <label>
                      Lieu de résidence <em>*</em>
                      <input
                        value={form.residence}
                        onChange={(e) => update('residence', e.target.value)}
                        placeholder="Ex : Yopougon, Abidjan"
                        required
                      />
                    </label>
                    <label>
                      Email <em>*</em>
                      <input
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => update('contactEmail', e.target.value)}
                        placeholder="exemple@email.com"
                        autoComplete="email"
                        required
                      />
                    </label>
                    <label>
                      Téléphone <em>*</em>
                      <input
                        type="tel"
                        value={form.contactPhone}
                        onChange={(e) => update('contactPhone', e.target.value)}
                        placeholder="+225 07 00 00 00 00"
                        autoComplete="tel"
                        required
                      />
                    </label>
                  </div>
                </fieldset>
              ) : null}

              {/* ── ÉTAPE 2 : Établissement & métier ── */}
              {step === 1 ? (
                <div className="candidature-form">
                  <fieldset>
                    <legend>2. Établissement</legend>
                    <div className="candidature-form__grid">
                      <label>
                        Type d&apos;établissement <em>*</em>
                        <select
                          value={form.institutionTypeId}
                          onChange={(e) => update('institutionTypeId', e.target.value)}
                          required
                          disabled={optionsLoading}
                        >
                          <option value="">Sélectionnez</option>
                          {institutionTypes.map((it) => (
                            <option key={it.id} value={it.id}>{it.name}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        École / établissement
                        <select
                          value={form.schoolId}
                          onChange={(e) => {
                            const school = schools.find((s) => s.id === e.target.value)
                            update('schoolId', e.target.value)
                            if (school) update('schoolCity', school.city)
                          }}
                          disabled={optionsLoading}
                        >
                          <option value="">Sélectionnez (optionnel)</option>
                          {schools.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} — {s.city}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Ville de l&apos;établissement
                        <input
                          value={form.schoolCity}
                          onChange={(e) => update('schoolCity', e.target.value)}
                          placeholder="Ex : Abidjan"
                        />
                      </label>
                      <label>
                        Niveau <em>*</em>
                        <select value={form.levelId} onChange={(e) => update('levelId', e.target.value)} required disabled={optionsLoading}>
                          <option value="">Sélectionnez</option>
                          {levels.map((l) => (
                            <option key={l.id} value={l.id}>{l.label}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Classe <em>*</em>
                        <select value={form.classe} onChange={(e) => update('classe', e.target.value)} required disabled={optionsLoading}>
                          <option value="">Sélectionnez</option>
                          {classes.map((c) => (
                            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend>Métier(s) choisi(s)</legend>
                    <div className="candidature-form__grid">
                      <label>
                        Métier principal <em>*</em>
                        <select
                          value={form.jobSheetId}
                          onChange={(e) => {
                            const jobSheetId = e.target.value
                            setForm((f) => ({
                              ...f,
                              jobSheetId,
                              specializationJobTagId: '',
                              secondaryJobSheetIds: f.secondaryJobSheetIds.filter(
                                (id) => id !== jobSheetId,
                              ),
                            }))
                          }}
                          required
                          disabled={optionsLoading}
                        >
                          <option value="">Choisissez le métier</option>
                          {jobSheets.map((js) => (
                            <option key={js.id} value={js.id}>{js.title}</option>
                          ))}
                        </select>
                      </label>
                      {specializations.length > 0 && (
                        <label>
                          Spécialisation
                          <select
                            value={form.specializationJobTagId}
                            onChange={(e) => update('specializationJobTagId', e.target.value)}
                          >
                            <option value="">Sélectionnez (optionnel)</option>
                            {specializations.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>
                    {secondaryJobOptions.length > 0 && (
                      <div className="candidature-form__grid">
                        <label>
                          Métier secondaire 1 (optionnel)
                          <select
                            value={form.secondaryJobSheetIds[0] ?? ''}
                            onChange={(e) => setSecondarySlot(0, e.target.value)}
                            disabled={optionsLoading}
                          >
                            <option value="">Aucun</option>
                            {secondaryJobOptions
                              .filter((js) => js.id !== form.secondaryJobSheetIds[1])
                              .map((js) => (
                                <option key={js.id} value={js.id}>{js.title}</option>
                              ))}
                          </select>
                        </label>
                        <label>
                          Métier secondaire 2 (optionnel)
                          <select
                            value={form.secondaryJobSheetIds[1] ?? ''}
                            onChange={(e) => setSecondarySlot(1, e.target.value)}
                            disabled={optionsLoading}
                          >
                            <option value="">Aucun</option>
                            {secondaryJobOptions
                              .filter((js) => js.id !== form.secondaryJobSheetIds[0])
                              .map((js) => (
                                <option key={js.id} value={js.id}>{js.title}</option>
                              ))}
                          </select>
                        </label>
                      </div>
                    )}
                  </fieldset>

                  <fieldset>
                    <legend>Contact en cas d&apos;urgence</legend>
                    <div className="candidature-form__grid">
                      <label>
                        Nom et prénom <em>*</em>
                        <input
                          value={form.emergencyContactName}
                          onChange={(e) => update('emergencyContactName', e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        Téléphone <em>*</em>
                        <input
                          type="tel"
                          value={form.emergencyContactPhone}
                          onChange={(e) => update('emergencyContactPhone', e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        Lien de parenté <em>*</em>
                        <input
                          value={form.emergencyContactRelation}
                          onChange={(e) => update('emergencyContactRelation', e.target.value)}
                          placeholder="Ex : Mère, Père, Tuteur…"
                          required
                        />
                      </label>
                    </div>
                  </fieldset>
                </div>
              ) : null}

              {/* ── ÉTAPE 3 : Parcours & expérience ── */}
              {step === 2 ? (
                <fieldset className="candidature-form">
                  <legend>3. Parcours &amp; expérience</legend>
                  <label>
                    Expériences / stages <em>*</em>
                    <textarea
                      rows={4}
                      value={form.experiences}
                      onChange={(e) => update('experiences', e.target.value)}
                      placeholder="Stages, apprentissages, expériences liées au métier..."
                      required
                    />
                  </label>
                  <label>
                    Compétences complémentaires
                    <textarea
                      rows={3}
                      value={form.complementarySkills}
                      onChange={(e) => update('complementarySkills', e.target.value)}
                      placeholder="Ex : Soudure TIG, permis B, langues parlées..."
                    />
                  </label>
                  <label>
                    Motivation <em>*</em>
                    <textarea
                      rows={4}
                      value={form.motivation}
                      onChange={(e) => update('motivation', e.target.value)}
                      placeholder="Pourquoi souhaitez-vous participer à WorldSkills Côte d'Ivoire 2026 ?"
                      required
                    />
                  </label>
                </fieldset>
              ) : null}

              {/* ── ÉTAPE 4 : Documents ── */}
              {step === 3 ? (
                <fieldset className="candidature-form">
                  <legend>4. Documents</legend>
                  <p className="candidature-form__hint">
                    Joignez vos pièces (PDF ou image, max. 5 Mo). Ajoutez aussi une photo et une vidéo de présentation.
                  </p>
                  <div className="candidature-form__files">
                    <FileField
                      label="Pièce d'identité (CNI / passeport)"
                      accept="image/*,.pdf"
                      required
                      file={form.identityDocument}
                      onChange={(file) => update('identityDocument', file)}
                    />
                    <FileField
                      label="Photo de présentation"
                      hint="Portrait net, fond clair de préférence."
                      accept="image/*"
                      required
                      preview="image"
                      file={form.photo}
                      onChange={(file) => update('photo', file)}
                    />
                    <FileField
                      label="CV (optionnel)"
                      accept=".pdf,image/*"
                      file={form.cv}
                      onChange={(file) => update('cv', file)}
                    />
                    <FileField
                      label="Attestation / diplôme (optionnel)"
                      accept=".pdf,image/*"
                      file={form.diploma}
                      onChange={(file) => update('diploma', file)}
                    />
                    <FileField
                      label="Vidéo de présentation"
                      hint="MP4 ou WebM, courte présentation de votre talent."
                      accept="video/mp4,video/webm,video/quicktime"
                      required
                      preview="video"
                      file={form.video}
                      onChange={(file) => update('video', file)}
                    />
                  </div>
                </fieldset>
              ) : null}

              {/* ── ÉTAPE 5 : Confirmation ── */}
              {step === 4 ? (
                <fieldset className="candidature-form">
                  <legend>5. Confirmation</legend>
                  <div className="candidature-form__note">
                    Vérifiez vos informations avant d&apos;envoyer votre candidature. Après envoi, votre
                    dossier sera examiné par l&apos;équipe Côte d&apos;Ivoire Skills. À noter : après
                    validation par l&apos;administration, vous recevrez votre badge virtuel par e-mail ou
                    WhatsApp.
                  </div>
                  <dl className="candidature-form__summary">
                    <div>
                      <dt>Candidat</dt>
                      <dd>
                        {form.firstName} {form.lastName}
                        {getAge(form.dateOfBirth) != null ? ` — ${getAge(form.dateOfBirth)} ans` : ''}
                      </dd>
                    </div>
                    <div>
                      <dt>Contact</dt>
                      <dd>{form.contactEmail} · {form.contactPhone}</dd>
                    </div>
                    <div>
                      <dt>Métier</dt>
                      <dd>{selectedSkillName}</dd>
                    </div>
                    <div>
                      <dt>Documents</dt>
                      <dd>
                        Photo : {form.photo?.name ?? 'manquante'} · Vidéo : {form.video?.name ?? 'manquante'}
                      </dd>
                    </div>
                  </dl>
                  <CaptchaField
                    checked={captchaChecked}
                    onChange={setCaptchaChecked}
                    disabled={submitting}
                  />
                  <label className="candidature-form__check">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => update('consent', e.target.checked)}
                      required
                    />
                    <span>
                      J&apos;accepte le règlement de la compétition et certifie l&apos;exactitude des
                      informations fournies. <em>*</em>
                    </span>
                  </label>
                </fieldset>
              ) : null}

              {submitError && (
                <p className="candidature-form__error" role="alert" style={{ color: '#b91c1c', marginTop: 8 }}>
                  {submitError}
                </p>
              )}

              <div className="candidature-form__nav">
                {step > 0 ? (
                  <button type="button" className="candidature-form__btn candidature-form__btn--ghost" onClick={goPrev} disabled={submitting}>
                    ← Précédent
                  </button>
                ) : (
                  <span />
                )}
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    className="candidature-form__btn"
                    onClick={goNext}
                    disabled={!canGoNext()}
                  >
                    Suivant →
                  </button>
                ) : (
                  <button type="submit" className="candidature-form__btn" disabled={!canGoNext() || submitting}>
                    {submitting ? 'Envoi en cours…' : 'Envoyer ma candidature →'}
                  </button>
                )}
              </div>
            </form>
          )}
        </section>

        <aside className="candidature-page__aside">
          <article className="candidature-page__aside-card candidature-page__aside-card--green">
            <h2>Participez et montrez votre talent !</h2>
            <p>
              Vous avez entre 16 et 30 ans ? Inscrivez-vous pour participer à la compétition, développer
              vos compétences et gagner en visibilité.
            </p>
            <ul className="candidature-page__icon-list">
              <li>
                <FaWrench aria-hidden="true" />
                <span>Participez à votre métier</span>
              </li>
              <li>
                <FaStar aria-hidden="true" />
                <span>Valorisez vos compétences</span>
              </li>
              <li>
                <FaTrophy aria-hidden="true" />
                <span>Tentez de remporter des prix</span>
              </li>
            </ul>
          </article>
          <article className="candidature-page__aside-card candidature-page__aside-card--gold">
            <h2>Conditions de participation</h2>
            <ul className="candidature-page__icon-list">
              <li>
                <FaCalendarDays aria-hidden="true" />
                <span>Avoir entre 16 et 30 ans à la date de la compétition</span>
              </li>
              <li>
                <FaFlag aria-hidden="true" />
                <span>Être de nationalité ivoirienne ou résident en Côte d&apos;Ivoire</span>
              </li>
              <li>
                <FaCheck aria-hidden="true" />
                <span>S&apos;engager à respecter le règlement de la compétition</span>
              </li>
            </ul>
          </article>
          <article className="candidature-page__aside-card candidature-page__aside-card--blue">
            <h2>Besoin d&apos;aide ?</h2>
            <p>Notre équipe est à votre disposition pour vous accompagner.</p>
            <ul className="candidature-page__help-list candidature-page__icon-list">
              <li>
                <FaEnvelope aria-hidden="true" />
                <a href="mailto:contact@worldskills.ci">contact@worldskills.ci</a>
              </li>
              <li>
                <FaEnvelope aria-hidden="true" />
                <a href="mailto:worldskills@ongreveletontalent.com">
                  worldskills@ongreveletontalent.com
                </a>
              </li>
              <li>
                <FaGlobe aria-hidden="true" />
                <a href="/">worldskills.ci</a>
              </li>
            </ul>
          </article>
        </aside>
      </div>

      {ageBlockOpen && (
        <div
          className="concours-page__modal"
          role="dialog"
          aria-modal="true"
          aria-label="Âge minimum requis"
          onClick={() => setAgeBlockOpen(false)}
          style={{ zIndex: 1300 }}
        >
          <div
            className="concours-page__success-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 440, textAlign: 'center' }}
          >
            <div style={{ width: 56, height: 56, margin: '0 auto 8px', borderRadius: '50%', background: 'color-mix(in srgb, #ef4444 12%, transparent)', display: 'grid', placeItems: 'center' }}>
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: 'var(--color-text)' }}>
              Âge minimum non atteint
            </h2>
            <p style={{ margin: '0 0 16px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Vous devez avoir au moins <strong>16 ans</strong> pour postuler comme candidat
              Côte d&apos;Ivoire Skills. Vérifiez votre date de naissance ou revenez
              lorsque vous remplirez cette condition.
            </p>
            <button
              type="button"
              className="concours-page__modal-btn concours-page__modal-btn--primary"
              onClick={() => setAgeBlockOpen(false)}
              style={{ margin: '0 auto' }}
            >
              J&apos;ai compris
            </button>
          </div>
        </div>
      )}

      <aside className="candidature-page__secure" aria-label="Protection des données">
        <span className="candidature-page__secure-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <div>
          <h2>Vos données sont sécurisées</h2>
          <p>
            Vos informations personnelles sont protégées et utilisées uniquement dans le cadre de
            la compétition Côte d&apos;Ivoire Skills 2026.
          </p>
        </div>
      </aside>
    </main>
  )
}
