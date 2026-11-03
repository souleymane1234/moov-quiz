import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { emissionRequest } from '../lib/emission-request'
import { profileApi } from '../services/api-client'
import {
  applyProfileSeed,
  buildExpertSeedFromProfile,
} from '../lib/map-profile-to-candidature'
import { CaptchaField } from './CaptchaField'
import './CandidaturePage.css'

const STEPS = [
  'Identité',
  'Profil professionnel',
  'Disponibilités',
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

type ExpertForm = {
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

const INITIAL: ExpertForm = {
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

type Props = {
  open: boolean
  editionId: string | null
  onClose: () => void
  onSuccess: () => void
}

export function ExpertFormModal({ open, editionId, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<ExpertForm>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const profilePrefilledRef = useRef(false)

  const optionsQuery = useQuery({
    queryKey: ['participation-options', editionId],
    queryFn: () => emissionRequest.getParticipationOptions(editionId!),
    enabled: open && Boolean(editionId),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  })

  const options = optionsQuery.data?.data ?? null

  const jobSheets = Array.isArray(options?.jobSheets)
    ? (options.jobSheets as Array<{ id: string; title: string }>)
    : []
  const activitySectors = Array.isArray(options?.activitySectors)
    ? (options.activitySectors as Array<{ id: string; name: string }>)
    : []
  const levels = Array.isArray(options?.levels)
    ? (options.levels as Array<{ id: string; label: string }>)
    : []
  const expertiseTags = Array.isArray(options?.expertiseTags)
    ? (options.expertiseTags as Array<{ id: string; name: string }>)
    : []
  const expertRoles = Array.isArray(options?.expertRoles)
    ? (options.expertRoles as Array<{ id: string; name: string }>)
    : DESIRED_ROLES_STATIC
  const countries = Array.isArray(options?.countries)
    ? (options.countries as Array<{ id: string; name: string }>)
    : []

  const profileQuery = useQuery({
    queryKey: ['student-profile', 'expert-modal'],
    queryFn: () => profileApi.get(),
    enabled: open,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const reset = useCallback(() => {
    setStep(0)
    setForm(INITIAL)
    setError(null)
    setSubmitting(false)
    setCaptchaChecked(false)
    profilePrefilledRef.current = false
  }, [])

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (
      !open ||
      profilePrefilledRef.current ||
      profileQuery.isLoading ||
      optionsQuery.isLoading
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
    open,
    profileQuery.data,
    profileQuery.isLoading,
    optionsQuery.isLoading,
    countries,
    levels,
  ])

  const update = <K extends keyof ExpertForm>(key: K, value: ExpertForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const onMultiSelect = (
    key: 'desiredRoles' | 'expertiseTagIds' | 'interventionJobSheetIds',
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value)
    update(key, values)
  }

  const canNext = useMemo(() => {
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
      return Boolean(form.availabilityStart && form.availabilityEnd && form.motivation)
    }
    if (step === 3) {
      return Boolean(form.identityDocument && form.photo)
    }
    return form.acceptedCharter && form.confirmed && captchaChecked
  }, [step, form, expertiseTags.length, jobSheets.length, captchaChecked])

  const goNext = () => { if (canNext) setStep((s) => Math.min(s + 1, STEPS.length - 1)) }
  const goPrev = () => setStep((s) => Math.max(s - 1, 0))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!captchaChecked) {
      setError('Veuillez confirmer que vous n\'êtes pas un robot.')
      return
    }
    if (!canNext || !editionId) return
    setSubmitting(true)
    setError(null)
    try {
      await new Promise((r) => setTimeout(r, 600))
      onClose()
      onSuccess()
    } catch {
      setError('Impossible d\u2019envoyer votre candidature expert.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="concours-page__modal"
      role="dialog"
      aria-modal="true"
      aria-label="Devenir expert"
      onClick={onClose}
    >
      <div
        className="concours-page__modal-card"
        style={{ maxWidth: 680, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="concours-page__modal-header">
          <h2>Devenir expert</h2>
          <button
            type="button"
            className="concours-page__modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <ol className="candidature-page__steps" aria-label="Étapes" style={{ margin: '0 0 12px', padding: '0 8px' }}>
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`candidature-page__step${i === step ? ' is-current' : ''}${i < step ? ' is-done' : ''}`}
            >
              <span>{i < step ? '✓' : i + 1}</span>
              <strong>{label}</strong>
            </li>
          ))}
        </ol>

        <form className="concours-page__modal-form" onSubmit={onSubmit}>
          <div className="concours-page__modal-body">
            {/* STEP 0 — Identité */}
            {step === 0 && (
              <div className="concours-page__modal-grid">
                <label>
                  Prénoms <em>*</em>
                  <input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
                </label>
                <label>
                  Nom <em>*</em>
                  <input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
                </label>
                <label>
                  Date de naissance <em>*</em>
                  <input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} required />
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
                  <input value={form.nationality} onChange={(e) => update('nationality', e.target.value)} required />
                </label>
                <label>
                  N° pièce d&apos;identité <em>*</em>
                  <input value={form.identityNumber} onChange={(e) => update('identityNumber', e.target.value)} required />
                </label>
                <label>
                  Lieu de résidence <em>*</em>
                  <input value={form.residence} onChange={(e) => update('residence', e.target.value)} required />
                </label>
                <label>
                  Email <em>*</em>
                  <input type="email" value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} required />
                </label>
                <label>
                  Téléphone <em>*</em>
                  <input type="tel" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} required />
                </label>
              </div>
            )}

            {/* STEP 1 — Profil professionnel */}
            {step === 1 && (
              <div className="concours-page__modal-grid">
                {jobSheets.length > 0 && (
                  <label>
                    Métier / fiche métier
                    <select value={form.professionJobSheetId} onChange={(e) => update('professionJobSheetId', e.target.value)}>
                      <option value="">Sélectionnez (optionnel)</option>
                      {jobSheets.map((js: { id: string; title: string }) => (
                        <option key={js.id} value={js.id}>{js.title}</option>
                      ))}
                    </select>
                  </label>
                )}
                <label>
                  Secteur d&apos;activité <em>*</em>
                  <select value={form.activitySectorId} onChange={(e) => update('activitySectorId', e.target.value)} required>
                    <option value="">Sélectionnez</option>
                    {activitySectors.map((s: { id: string; name: string }) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Niveau <em>*</em>
                  <select value={form.levelId} onChange={(e) => update('levelId', e.target.value)} required>
                    <option value="">Sélectionnez</option>
                    {levels.map((l: { id: string; label: string }) => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Années d&apos;expérience <em>*</em>
                  <input
                    type="number"
                    min={0}
                    value={form.yearsOfExperience}
                    onChange={(e) => update('yearsOfExperience', e.target.value)}
                    required
                  />
                </label>

                {expertiseTags.length > 0 && (
                  <label style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontWeight: 600 }}>Tags d&apos;expertise <em>*</em></span>
                    <small className="candidature-form__hint-inline">
                      Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs options.
                    </small>
                    <select
                      multiple
                      className="candidature-form__multi-select"
                      value={form.expertiseTagIds}
                      onChange={(e) => onMultiSelect('expertiseTagIds', e)}
                      size={Math.min(6, expertiseTags.length)}
                      required
                    >
                      {expertiseTags.map((t: { id: string; name: string }) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </label>
                )}

                {jobSheets.length > 0 && (
                  <label style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontWeight: 600 }}>
                      Fiches métier d&apos;intervention <em>*</em>
                    </span>
                    <small className="candidature-form__hint-inline">
                      Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs métiers.
                    </small>
                    <select
                      multiple
                      className="candidature-form__multi-select"
                      value={form.interventionJobSheetIds}
                      onChange={(e) => onMultiSelect('interventionJobSheetIds', e)}
                      size={Math.min(6, jobSheets.length)}
                      required
                    >
                      {jobSheets.map((js: { id: string; title: string }) => (
                        <option key={js.id} value={js.id}>{js.title}</option>
                      ))}
                    </select>
                  </label>
                )}

                <div style={{ gridColumn: '1 / -1' }}>
                  <label>
                    <span style={{ fontWeight: 600 }}>Rôles souhaités <em>*</em></span>
                    <small className="candidature-form__hint-inline">
                      Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs rôles.
                    </small>
                    <select
                      multiple
                      className="candidature-form__multi-select"
                      value={form.desiredRoles}
                      onChange={(e) => onMultiSelect('desiredRoles', e)}
                      size={Math.min(5, expertRoles.length)}
                      required
                    >
                      {expertRoles.map((r: { id: string; name: string }) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </label>
                  {form.desiredRoles.includes('OTHER') && (
                    <label style={{ marginTop: 8, display: 'block' }}>
                      Précisez <em>*</em>
                      <input
                        value={form.otherRoleDetail}
                        onChange={(e) => update('otherRoleDetail', e.target.value)}
                        required
                        placeholder="Décrivez le rôle souhaité"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2 — Disponibilités */}
            {step === 2 && (
              <div className="concours-page__modal-grid">
                <label>
                  Disponible à partir du <em>*</em>
                  <input type="date" value={form.availabilityStart} onChange={(e) => update('availabilityStart', e.target.value)} required />
                </label>
                <label>
                  Disponible jusqu&apos;au <em>*</em>
                  <input type="date" value={form.availabilityEnd} onChange={(e) => update('availabilityEnd', e.target.value)} required />
                </label>
                <label style={{ gridColumn: '1 / -1' }}>
                  Motivation <em>*</em>
                  <textarea
                    rows={4}
                    value={form.motivation}
                    onChange={(e) => update('motivation', e.target.value)}
                    required
                    placeholder="Pourquoi souhaitez-vous devenir expert WorldSkills Côte d'Ivoire ?"
                  />
                </label>
              </div>
            )}

            {/* STEP 3 — Documents */}
            {step === 3 && (
              <div style={{ display: 'grid', gap: 14 }}>
                <label className="candidature-form__file">
                  <span>Pièce d&apos;identité <em>*</em></span>
                  <input type="file" accept="image/*,.pdf" required={!form.identityDocument} onChange={(e) => update('identityDocument', e.target.files?.[0] ?? null)} />
                  {form.identityDocument && <p className="candidature-form__file-name">{form.identityDocument.name}</p>}
                </label>
                <label className="candidature-form__file">
                  <span>Photo <em>*</em></span>
                  <input type="file" accept="image/*" required={!form.photo} onChange={(e) => update('photo', e.target.files?.[0] ?? null)} />
                  {form.photo && <p className="candidature-form__file-name">{form.photo.name}</p>}
                </label>
                <label className="candidature-form__file">
                  <span>CV (optionnel)</span>
                  <input type="file" accept=".pdf,image/*" onChange={(e) => update('cv', e.target.files?.[0] ?? null)} />
                  {form.cv && <p className="candidature-form__file-name">{form.cv.name}</p>}
                </label>
                <label className="candidature-form__file">
                  <span>Diplôme / attestation (optionnel)</span>
                  <input type="file" accept=".pdf,image/*" onChange={(e) => update('diploma', e.target.files?.[0] ?? null)} />
                  {form.diploma && <p className="candidature-form__file-name">{form.diploma.name}</p>}
                </label>
              </div>
            )}

            {/* STEP 4 — Confirmation */}
            {step === 4 && (
              <div>
                <div className="candidature-form__note" style={{ marginBottom: 12 }}>
                  Vérifiez vos informations avant d&apos;envoyer votre candidature expert.
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
                  <input type="checkbox" checked={form.acceptedCharter} onChange={(e) => update('acceptedCharter', e.target.checked)} required />
                  <span>J&apos;accepte la charte des experts WorldSkills Côte d&apos;Ivoire. <em>*</em></span>
                </label>
                <label className="candidature-form__check">
                  <input type="checkbox" checked={form.confirmed} onChange={(e) => update('confirmed', e.target.checked)} required />
                  <span>Je confirme l&apos;exactitude des informations fournies. <em>*</em></span>
                </label>
              </div>
            )}

            {error && (
              <p className="concours-page__modal-error" role="alert">{error}</p>
            )}
          </div>

          <div className="concours-page__modal-actions">
            {step > 0 ? (
              <button type="button" className="concours-page__modal-btn" onClick={goPrev} disabled={submitting}>
                ← Précédent
              </button>
            ) : (
              <button type="button" className="concours-page__modal-btn" onClick={onClose} disabled={submitting}>
                Annuler
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="concours-page__modal-btn concours-page__modal-btn--primary"
                onClick={goNext}
                disabled={!canNext}
              >
                Suivant →
              </button>
            ) : (
              <button
                type="submit"
                className="concours-page__modal-btn concours-page__modal-btn--primary"
                disabled={submitting || !canNext}
              >
                {submitting ? 'Envoi en cours…' : 'Postuler comme expert'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
