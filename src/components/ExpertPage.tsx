import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FaBriefcase,
  FaCheck,
  FaClock,
  FaEnvelope,
  FaGlobe,
  FaScaleBalanced,
  FaUserGraduate,
} from 'react-icons/fa6'
import { emissionRequest } from '../lib/emission-request'
import { uploadsApi, profileApi } from '../services/api-client'
import { useEditionApplicationStatus } from '../hooks/use-edition-application-status'
import { getAuthEventName, isApiLoggedIn } from '../lib/auth-session'
import {
  applyProfileSeed,
  buildExpertSeedFromProfile,
} from '../lib/map-profile-to-candidature'
import { AlreadyAppliedNotice } from './AlreadyAppliedNotice'
import { PageLoader } from './PageLoader'
import { CaptchaField } from './CaptchaField'
import './CandidaturePage.css'
import './ConcoursPage.css'

const STEPS = [
  'Informations personnelles',
  'Profil professionnel & expertise',
  'Disponibilités & engagement',
  'Documents',
  'Confirmation',
] as const

const GENDER_OPTIONS = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
] as const

const DESIRED_ROLES_STATIC = [
  { id: 'JURY_EVALUATION', name: 'Jury / Évaluation' },
  { id: 'COACHING', name: 'Encadrement / Coaching' },
  { id: 'TECHNICAL_EXPERT', name: 'Expert technique' },
  { id: 'SPEAKER_TRAINER', name: 'Conférencier / Formateur' },
  { id: 'OTHER', name: 'Autre' },
]

type FileState = File | null

type FormState = {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  nationality: string
  identityNumber: string
  residence: string
  contactEmail: string
  contactPhone: string
  professionJobSheetId: string
  activitySectorId: string
  levelId: string
  yearsOfExperience: string
  expertiseTagIds: string[]
  interventionJobSheetIds: string[]
  desiredRoles: string[]
  otherRoleDetail: string
  availabilityStart: string
  availabilityEnd: string
  motivation: string
  acceptedCharter: boolean
  confirmed: boolean
  identityDocument: FileState
  photo: FileState
  cv: FileState
  diploma: FileState
}

const INITIAL_FORM: FormState = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  nationality: '',
  identityNumber: '',
  residence: '',
  contactEmail: '',
  contactPhone: '',
  professionJobSheetId: '',
  activitySectorId: '',
  levelId: '',
  yearsOfExperience: '',
  expertiseTagIds: [],
  interventionJobSheetIds: [],
  desiredRoles: [],
  otherRoleDetail: '',
  availabilityStart: '',
  availabilityEnd: '',
  motivation: '',
  acceptedCharter: false,
  confirmed: false,
  identityDocument: null,
  photo: null,
  cv: null,
  diploma: null,
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
  preview?: 'image'
  onChange: (file: File | null) => void
}) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])
  useEffect(() => {
    return () => { if (url) URL.revokeObjectURL(url) }
  }, [url])

  return (
    <label className="candidature-form__file">
      <span>{label}{required ? <em> *</em> : null}</span>
      {hint ? <small>{hint}</small> : null}
      <input type="file" accept={accept} required={required} onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
      {file ? <p className="candidature-form__file-name">{file.name}</p> : null}
      {url && preview === 'image' ? <img className="candidature-form__preview" src={url} alt="" /> : null}
    </label>
  )
}

export function ExpertPage() {
  const [loggedIn, setLoggedIn] = useState(isApiLoggedIn)
  const [step, setStep] = useState(0)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [ageBlockOpen, setAgeBlockOpen] = useState(false)
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
    queryKey: ['student-profile', 'expert-candidature'],
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
  const jobSheets: { id: string; title: string }[] = options?.jobSheets ?? []
  const activitySectors: { id: string; name: string }[] = options?.activitySectors ?? []
  const levels: { id: string; label: string }[] = options?.levels ?? []
  const expertiseTags: { id: string; name: string }[] = options?.expertiseTags ?? []
  const expertRoles: { id: string; name: string }[] = options?.expertRoles ?? DESIRED_ROLES_STATIC

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

    const seed = buildExpertSeedFromProfile(profileQuery.data ?? null, {
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
    setForm((f) => ({ ...f, [key]: value }))
  }

  const onMultiSelect = (
    key: 'desiredRoles' | 'expertiseTagIds' | 'interventionJobSheetIds',
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value)
    update(key, values)
  }

  const canGoNext = () => {
    if (step === 0) {
      return Boolean(
        form.firstName && form.lastName && form.dateOfBirth && form.gender &&
        form.nationality && form.identityNumber && form.residence &&
        form.contactEmail && form.contactPhone,
      )
    }
    if (step === 1) {
      const expertiseOk =
        expertiseTags.length === 0 || form.expertiseTagIds.length > 0
      const interventionOk =
        jobSheets.length === 0 || form.interventionJobSheetIds.length > 0
      return Boolean(
        form.activitySectorId &&
        form.levelId &&
        form.yearsOfExperience &&
        expertiseOk &&
        interventionOk &&
        form.desiredRoles.length > 0 &&
        (form.desiredRoles.includes('OTHER') ? form.otherRoleDetail.trim() : true),
      )
    }
    if (step === 2) {
      return Boolean(form.availabilityStart && form.availabilityEnd && form.motivation && form.acceptedCharter)
    }
    if (step === 3) {
      return Boolean(form.identityDocument && form.photo)
    }
    return form.confirmed && captchaChecked
  }

  const getAge = (dob: string) => {
    if (!dob) return null
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1
    return Number.isFinite(age) ? age : null
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
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const goPrev = () => setStep((s) => Math.max(s - 1, 0))

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (hasApplied) {
      setSubmitError(
        appliedAs === 'candidate'
          ? 'Vous avez déjà candidaté comme candidat pour cette édition.'
          : 'Vous avez déjà postulé comme expert pour cette édition.',
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
      const [photoRes, idDocRes, cvRes, diplomaRes] = await Promise.all([
        form.photo ? uploadsApi.uploadImage(form.photo) : null,
        form.identityDocument ? uploadsApi.uploadFile(form.identityDocument) : null,
        form.cv ? uploadsApi.uploadFile(form.cv) : null,
        form.diploma ? uploadsApi.uploadFile(form.diploma) : null,
      ])

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: Record<string, any> = {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        nationality: form.nationality,
        identityNumber: form.identityNumber,
        residence: form.residence,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        activitySectorId: form.activitySectorId,
        levelId: form.levelId,
        yearsOfExperience: Number(form.yearsOfExperience),
        desiredRoles: form.desiredRoles,
        availabilityStart: form.availabilityStart,
        availabilityEnd: form.availabilityEnd,
        motivation: form.motivation,
        acceptedCharter: form.acceptedCharter,
      }

      if (form.professionJobSheetId) body.professionJobSheetId = form.professionJobSheetId
      if (form.expertiseTagIds.length > 0) body.expertiseTagIds = form.expertiseTagIds
      if (form.interventionJobSheetIds.length > 0) body.interventionJobSheetIds = form.interventionJobSheetIds
      if (form.desiredRoles.includes('OTHER')) body.otherRoleDetail = form.otherRoleDetail
      if (photoRes) body.photoUrl = photoRes.data.url
      if (idDocRes) body.identityDocumentUrl = idDocRes.data.url
      if (cvRes) body.cvUrl = cvRes.data.url
      if (diplomaRes) body.diplomaUrl = diplomaRes.data.url

      await emissionRequest.applyAsExpert(editionId, body)
      setSent(true)
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message
        ?? (err as any)?.message
        ?? 'Impossible d\u2019envoyer votre candidature expert.'
      setSubmitError(String(msg))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="candidature-page" aria-labelledby="expert-page-title">
      <header className="candidature-page__hero">
        <span className="candidature-page__hero-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </span>
        <div>
          <h1 id="expert-page-title">Inscription Expert</h1>
          <p>Côte d&apos;Ivoire Skills 2026</p>
        </div>
      </header>

      <ol className="candidature-page__steps" aria-label="Étapes d'inscription">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`candidature-page__step${index === step ? ' is-current' : ''}${index < step ? ' is-done' : ''}`}
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
                Vous devez être connecté pour soumettre votre candidature expert.
                Connectez-vous ou créez un compte pour continuer.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                <a href="/connexion" className="candidature-form__btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minWidth: 180 }}>
                  Se connecter
                </a>
                <a href="/inscription" className="candidature-form__btn candidature-form__btn--ghost" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minWidth: 180 }}>
                  Créer un compte
                </a>
              </div>
            </div>
          ) : candidatureLoading ? (
            <PageLoader label="Vérification en cours…" fullPage />
          ) : hasApplied ? (
            <AlreadyAppliedNotice
              page="expert"
              appliedAs={appliedAs}
              applicationStatus={applicationStatus}
            />
          ) : sent ? (
            <div className="candidature-page__success" role="status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, padding: '48px 24px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'color-mix(in srgb, #16a34a 12%, transparent)', display: 'grid', placeItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Candidature expert envoyée</h2>
              <p style={{ margin: 0, maxWidth: 420, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Merci <strong>{form.firstName}</strong>. Votre dossier expert sera examiné par
                l&apos;équipe Côte d&apos;Ivoire Skills. Vous recevrez une confirmation par e-mail.
              </p>
              <a href="/" className="candidature-form__btn" style={{ marginTop: 8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minWidth: 200 }}>
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
              {step === 0 && (
                <fieldset className="candidature-form">
                  <legend>1. Informations personnelles</legend>
                  <div className="candidature-form__grid">
                    <label>
                      Prénoms <em>*</em>
                      <input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Entrez vos prénoms" autoComplete="given-name" required />
                    </label>
                    <label>
                      Nom <em>*</em>
                      <input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Entrez votre nom" autoComplete="family-name" required />
                    </label>
                    <label>
                      Date de naissance <em>*</em>
                      <input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} required />
                    </label>
                    <label>
                      Sexe <em>*</em>
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
                        <select value={form.nationality} onChange={(e) => update('nationality', e.target.value)} required disabled={optionsLoading}>
                          <option value="">{optionsLoading ? 'Chargement…' : 'Sélectionnez votre pays de nationalité'}</option>
                          {countries.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input value={form.nationality} onChange={(e) => update('nationality', e.target.value)} placeholder="Ex : Ivoirienne" required />
                      )}
                    </label>
                    <label>
                      Numéro de CNI ou passeport <em>*</em>
                      <input value={form.identityNumber} onChange={(e) => update('identityNumber', e.target.value)} placeholder="Entrez votre numéro" required />
                    </label>
                    <label>
                      Lieu de résidence <em>*</em>
                      <input value={form.residence} onChange={(e) => update('residence', e.target.value)} placeholder="Ex : Cocody, Abidjan" required />
                    </label>
                    <label>
                      Email <em>*</em>
                      <input type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} placeholder="exemple@email.com" autoComplete="email" required />
                    </label>
                    <label>
                      Téléphone <em>*</em>
                      <input type="tel" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} placeholder="+225 07 00 00 00 00" autoComplete="tel" required />
                    </label>
                  </div>
                </fieldset>
              )}

              {/* ── ÉTAPE 2 : Profil professionnel & expertise ── */}
              {step === 1 && (
                <fieldset className="candidature-form">
                  <legend>2. Profil professionnel &amp; expertise</legend>
                  <div className="candidature-form__grid">
                    {jobSheets.length > 0 && (
                      <label>
                        Profession / Métier principal
                        <select value={form.professionJobSheetId} onChange={(e) => update('professionJobSheetId', e.target.value)} disabled={optionsLoading}>
                          <option value="">Sélectionnez (optionnel)</option>
                          {jobSheets.map((js) => (
                            <option key={js.id} value={js.id}>{js.title}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    <label>
                      Secteur d&apos;activité <em>*</em>
                      <select value={form.activitySectorId} onChange={(e) => update('activitySectorId', e.target.value)} required disabled={optionsLoading}>
                        <option value="">Sélectionnez</option>
                        {activitySectors.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Niveau d&apos;études <em>*</em>
                      <select value={form.levelId} onChange={(e) => update('levelId', e.target.value)} required disabled={optionsLoading}>
                        <option value="">Sélectionnez</option>
                        {levels.map((l) => (
                          <option key={l.id} value={l.id}>{l.label}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Années d&apos;expérience <em>*</em>
                      <input type="number" min={0} value={form.yearsOfExperience} onChange={(e) => update('yearsOfExperience', e.target.value)} required />
                    </label>
                  </div>

                  {expertiseTags.length > 0 && (
                    <label className="candidature-form__field--full">
                      <span>
                        Spécialités / domaines d&apos;expertise <em>*</em>
                      </span>
                      <small className="candidature-form__hint-inline">
                        Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs options.
                      </small>
                      <select
                        multiple
                        className="candidature-form__multi-select"
                        value={form.expertiseTagIds}
                        onChange={(e) => onMultiSelect('expertiseTagIds', e)}
                        disabled={optionsLoading}
                        size={Math.min(6, expertiseTags.length)}
                        required
                      >
                        {expertiseTags.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  {jobSheets.length > 0 && (
                    <label className="candidature-form__field--full">
                      <span>
                        Métiers pour lesquels vous souhaitez intervenir <em>*</em>
                      </span>
                      <small className="candidature-form__hint-inline">
                        Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs métiers.
                      </small>
                      <select
                        multiple
                        className="candidature-form__multi-select"
                        value={form.interventionJobSheetIds}
                        onChange={(e) => onMultiSelect('interventionJobSheetIds', e)}
                        disabled={optionsLoading}
                        size={Math.min(6, jobSheets.length)}
                        required
                      >
                        {jobSheets.map((js) => (
                          <option key={js.id} value={js.id}>{js.title}</option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label className="candidature-form__field--full">
                    <span>
                      Rôle souhaité <em>*</em>
                    </span>
                    <small className="candidature-form__hint-inline">
                      Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs rôles.
                    </small>
                    <select
                      multiple
                      className="candidature-form__multi-select"
                      value={form.desiredRoles}
                      onChange={(e) => onMultiSelect('desiredRoles', e)}
                      disabled={optionsLoading}
                      size={Math.min(5, expertRoles.length)}
                      required
                    >
                      {expertRoles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </label>
                  {form.desiredRoles.includes('OTHER') && (
                    <label style={{ marginTop: 8, display: 'block' }}>
                      Précisez votre rôle <em>*</em>
                      <input value={form.otherRoleDetail} onChange={(e) => update('otherRoleDetail', e.target.value)} placeholder="Décrivez le rôle souhaité" required />
                    </label>
                  )}
                </fieldset>
              )}

              {/* ── ÉTAPE 3 : Disponibilités & engagement ── */}
              {step === 2 && (
                <fieldset className="candidature-form">
                  <legend>3. Disponibilités &amp; engagement</legend>
                  <div className="candidature-form__grid">
                    <label>
                      Disponible à partir du <em>*</em>
                      <input type="date" value={form.availabilityStart} onChange={(e) => update('availabilityStart', e.target.value)} required />
                    </label>
                    <label>
                      Disponible jusqu&apos;au <em>*</em>
                      <input type="date" value={form.availabilityEnd} onChange={(e) => update('availabilityEnd', e.target.value)} required />
                    </label>
                  </div>
                  <label style={{ marginTop: 16 }}>
                    Motivation à participer <em>*</em>
                    <textarea rows={5} value={form.motivation} onChange={(e) => update('motivation', e.target.value)} placeholder="Expliquez-nous pourquoi vous souhaitez contribuer à WorldSkills Côte d'Ivoire 2026..." required />
                  </label>
                  <label className="candidature-form__check" style={{ marginTop: 16 }}>
                    <input type="checkbox" checked={form.acceptedCharter} onChange={(e) => update('acceptedCharter', e.target.checked)} required />
                    <span>
                      Je m&apos;engage à respecter le règlement de la compétition et à accomplir ma mission
                      avec intégrité et professionnalisme. <em>*</em>
                    </span>
                  </label>
                </fieldset>
              )}

              {/* ── ÉTAPE 4 : Documents ── */}
              {step === 3 && (
                <fieldset className="candidature-form">
                  <legend>4. Documents</legend>
                  <p className="candidature-form__hint">
                    Joignez vos pièces obligatoires (PDF ou image, max. 5 Mo). Le diplôme reste optionnel.
                  </p>
                  <div className="candidature-form__files">
                    <FileField label="Pièce d'identité (CNI / passeport)" accept="image/*,.pdf" required file={form.identityDocument} onChange={(f) => update('identityDocument', f)} />
                    <FileField label="Photo d'identité" accept="image/*" required preview="image" file={form.photo} onChange={(f) => update('photo', f)} />
                    <FileField label="CV" accept=".pdf,image/*" required file={form.cv} onChange={(f) => update('cv', f)} />
                    <FileField label="Diplôme / attestation (optionnel)" accept=".pdf,image/*" file={form.diploma} onChange={(f) => update('diploma', f)} />
                  </div>
                </fieldset>
              )}

              {/* ── ÉTAPE 5 : Confirmation ── */}
              {step === 4 && (
                <fieldset className="candidature-form">
                  <legend>5. Confirmation</legend>
                  <div className="candidature-form__note">
                    Vérifiez vos informations avant d&apos;envoyer votre candidature d&apos;expert. Après envoi,
                    votre dossier sera examiné par l&apos;équipe Côte d&apos;Ivoire Skills.
                    <br /><br />
                    <strong>À noter :</strong> après validation par l&apos;administration, vous recevrez votre
                    <em> badge virtuel</em> par <strong>e-mail</strong> ou <strong>WhatsApp</strong>.
                  </div>
                  <dl className="candidature-form__summary">
                    <div><dt>Expert</dt><dd>{form.firstName} {form.lastName}</dd></div>
                    <div><dt>Contact</dt><dd>{form.contactEmail} · {form.contactPhone}</dd></div>
                    <div><dt>Expérience</dt><dd>{form.yearsOfExperience} ans</dd></div>
                    <div><dt>Disponibilité</dt><dd>{form.availabilityStart} → {form.availabilityEnd}</dd></div>
                    <div><dt>Documents</dt><dd>
                      CNI : {form.identityDocument?.name ?? '—'} · Photo : {form.photo?.name ?? '—'}
                      {form.cv ? ` · CV : ${form.cv.name}` : ''}
                      {form.diploma ? ` · Diplôme : ${form.diploma.name}` : ''}
                    </dd></div>
                  </dl>
                  <CaptchaField
                    checked={captchaChecked}
                    onChange={setCaptchaChecked}
                    disabled={submitting}
                  />
                  <label className="candidature-form__check" style={{ marginTop: 12 }}>
                    <input type="checkbox" checked={form.confirmed} onChange={(e) => update('confirmed', e.target.checked)} required />
                    <span>
                      Je confirme l&apos;exactitude des informations fournies. <em>*</em>
                    </span>
                  </label>
                </fieldset>
              )}

              {submitError && (
                <p className="candidature-form__error" role="alert" style={{ color: '#b91c1c', marginTop: 8 }}>{submitError}</p>
              )}

              <div className="candidature-form__nav">
                {step > 0 ? (
                  <button type="button" className="candidature-form__btn candidature-form__btn--ghost" onClick={goPrev} disabled={submitting}>
                    ← Précédent
                  </button>
                ) : <span />}
                {step < STEPS.length - 1 ? (
                  <button type="button" className="candidature-form__btn" onClick={goNext} disabled={!canGoNext()}>
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
            <h2>Partagez votre expertise !</h2>
            <p>
              Rejoignez le corps d&apos;experts de Côte d&apos;Ivoire Skills 2026 pour évaluer,
              encadrer et transmettre votre savoir-faire.
            </p>
            <ul className="candidature-page__icon-list">
              <li>
                <FaScaleBalanced aria-hidden="true" />
                <span>Évaluez les candidats</span>
              </li>
              <li>
                <FaCheck aria-hidden="true" />
                <span>Encadrez et accompagnez</span>
              </li>
              <li>
                <FaUserGraduate aria-hidden="true" />
                <span>Contribuez à l&apos;excellence des métiers</span>
              </li>
            </ul>
          </article>
          <article className="candidature-page__aside-card candidature-page__aside-card--gold">
            <h2>Conditions de participation</h2>
            <ul className="candidature-page__icon-list">
              <li>
                <FaBriefcase aria-hidden="true" />
                <span>Être un professionnel ou un expert reconnu dans votre métier</span>
              </li>
              <li>
                <FaUserGraduate aria-hidden="true" />
                <span>Justifier d&apos;une expérience significative dans le domaine</span>
              </li>
              <li>
                <FaClock aria-hidden="true" />
                <span>Être disponible pendant la période de la compétition</span>
              </li>
              <li>
                <FaCheck aria-hidden="true" />
                <span>S&apos;engager à respecter le règlement et l&apos;éthique de la compétition</span>
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
                <a href="mailto:worldskills@ongreveletontalent.com">worldskills@ongreveletontalent.com</a>
              </li>
              <li>
                <FaGlobe aria-hidden="true" />
                <a href="/">worldskills.ci</a>
              </li>
            </ul>
          </article>
        </aside>
      </div>

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
              Vous devez avoir au moins <strong>16 ans</strong> pour postuler comme expert
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
    </main>
  )
}
