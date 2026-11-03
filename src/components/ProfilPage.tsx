import { useEffect, useState } from 'react'
import {
  FaBriefcase,
  FaEnvelope,
  FaIdCard,
  FaImage,
  FaTrophy,
  FaArrowRight,
} from 'react-icons/fa6'
import { ApiHttpError } from '../lib/api'
import type { StudentProfileResponseDto } from '../lib/api/modules/profile'
import {
  clearAuthSession,
  getAccessToken,
  getAuthEventName,
  getAuthUser,
  isApiLoggedIn,
  setAuthSession,
} from '../lib/auth-session'
import { isCandidateLoggedIn, logoutCandidate } from '../lib/candidate-auth'
import { profileApi } from '../services/api-client'
import { PageLoader } from './PageLoader'
import { ProfileBanner } from './ProfileBanner'
import {
  ProfileMediaFields,
  socialLinksForApi,
  socialRowsFromApi,
  type SocialLinkRow,
} from './ProfileMediaFields'
import './ProfilPage.css'

type ProfileForm = {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  city: string
  country: string
  gender: string
  nationality: string
  address: string
  dateOfBirth: string
  academicLevel: string
  bio: string
  videoPresentationUrl: string
  profileImage: string
  coverImage: string
  socialLinks: SocialLinkRow[]
  interests: string
}

type ProfileSection = 'infos' | 'medias' | 'contact' | 'participation' | 'interests'

const SECTIONS: {
  id: ProfileSection
  label: string
  title: string
  desc: string
  icon: typeof FaIdCard
}[] = [
  {
    id: 'infos',
    label: 'Infos personnelles',
    title: 'Infos personnelles',
    desc: 'Identité et informations de base pour votre dossier Utilisateur.',
    icon: FaIdCard,
  },
  {
    id: 'medias',
    label: 'Photos & réseaux',
    title: 'Photos & réseaux sociaux',
    desc: 'Photo de profil, photo de couverture et liens affichés dans votre en-tête.',
    icon: FaImage,
  },
  {
    id: 'contact',
    label: 'Contact',
    title: 'Coordonnées',
    desc: 'Comment le comité peut vous joindre rapidement.',
    icon: FaEnvelope,
  },
  {
    id: 'participation',
    label: 'Parcours',
    title: 'Parcours',
    desc: 'Niveau académique et présentation pour la compétition.',
    icon: FaBriefcase,
  },
  {
    id: 'interests',
    label: 'Centres d’intérêt',
    title: 'Centres d’intérêt',
    desc: 'Sujets et compétences qui valorisent votre parcours.',
    icon: FaTrophy,
  },
]

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value)
  return match?.[1] ?? ''
}

function mapGenderToUi(value: string | null | undefined): string {
  if (!value) return ''
  const v = value.trim().toUpperCase()
  if (v === 'M' || v === 'HOMME') return 'M'
  if (v === 'F' || v === 'FEMME') return 'F'
  return value
}

function emptyForm(email = ''): ProfileForm {
  return {
    firstName: '',
    lastName: '',
    email,
    phoneNumber: '',
    city: '',
    country: "Côte d'Ivoire",
    gender: '',
    nationality: 'Ivoirienne',
    address: '',
    dateOfBirth: '',
    academicLevel: '',
    bio: '',
    videoPresentationUrl: '',
    profileImage: '',
    coverImage: '',
    socialLinks: [],
    interests: '',
  }
}

function formFromAuthUser(): ProfileForm {
  const user = getAuthUser()
  return {
    ...emptyForm(user?.email ?? ''),
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    city: user?.city ?? '',
    country: user?.country ?? "Côte d'Ivoire",
    gender: mapGenderToUi(user?.gender),
    nationality: user?.nationality ?? 'Ivoirienne',
    address: user?.address ?? '',
    dateOfBirth: toDateInputValue(user?.dateOfBirth),
    academicLevel: user?.academicLevel ?? '',
    bio: user?.bio ?? '',
    profileImage: user?.profileImage ?? '',
  }
}

function formFromApiProfile(
  profile: StudentProfileResponseDto,
  emailFallback: string,
): ProfileForm {
  return {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    email: emailFallback,
    phoneNumber: profile.phoneNumber ?? '',
    city: profile.city ?? '',
    country: profile.country ?? "Côte d'Ivoire",
    gender: mapGenderToUi(profile.gender),
    nationality: profile.nationality ?? '',
    address: profile.address ?? '',
    dateOfBirth: toDateInputValue(profile.dateOfBirth),
    academicLevel: profile.academicLevel ?? '',
    bio: profile.bio ?? '',
    videoPresentationUrl: profile.videoPresentationUrl ?? '',
    profileImage: profile.profileImage ?? '',
    coverImage: profile.coverImage ?? '',
    socialLinks: socialRowsFromApi(profile.socialLinks),
    interests: (profile.interests ?? []).join('\n'),
  }
}

function computeCompleteness(form: ProfileForm): number {
  const checks = [
    form.firstName,
    form.lastName,
    form.phoneNumber,
    form.city,
    form.dateOfBirth,
    form.gender,
    form.academicLevel,
    form.bio,
    form.address,
    form.interests.trim(),
  ]
  const filled = checks.filter((v) => Boolean(String(v).trim())).length
  return Math.round((filled / checks.length) * 100)
}

function displayName(form: ProfileForm): string {
  const name = `${form.firstName} ${form.lastName}`.trim()
  return name || 'Mon profil'
}

function syncAuthUserFromProfile(profile: StudentProfileResponseDto): void {
  const token = getAccessToken()
  const current = getAuthUser()
  if (!token || !current) return
  setAuthSession({
    accessToken: token,
    user: {
      ...current,
      firstName: profile.firstName ?? current.firstName,
      lastName: profile.lastName ?? current.lastName,
      phoneNumber: profile.phoneNumber ?? current.phoneNumber,
      profileImage: profile.profileImage ?? current.profileImage,
      studentProfileId: profile.id ?? current.studentProfileId,
      bio: profile.bio ?? current.bio,
      city: profile.city ?? current.city,
      country: profile.country ?? current.country,
      address: profile.address ?? current.address,
      gender: profile.gender ?? current.gender,
      nationality: profile.nationality ?? current.nationality,
      dateOfBirth: profile.dateOfBirth ?? current.dateOfBirth,
      academicLevel: profile.academicLevel ?? current.academicLevel,
    },
  })
}

export function ProfilPage() {
  const [loggedIn, setLoggedIn] = useState(
    () => isApiLoggedIn() || isCandidateLoggedIn(),
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState<ProfileSection>('infos')
  const [form, setForm] = useState<ProfileForm | null>(() =>
    isApiLoggedIn() || isCandidateLoggedIn() ? formFromAuthUser() : null,
  )

  useEffect(() => {
    const onChanged = () => {
      const nextLogged = isApiLoggedIn() || isCandidateLoggedIn()
      setLoggedIn(nextLogged)
      if (!nextLogged) {
        setForm(null)
        setLoading(false)
      }
    }
    window.addEventListener(getAuthEventName(), onChanged)
    window.addEventListener('storage', onChanged)
    return () => {
      window.removeEventListener(getAuthEventName(), onChanged)
      window.removeEventListener('storage', onChanged)
    }
  }, [])

  useEffect(() => {
    if (!loggedIn || !isApiLoggedIn()) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    void (async () => {
      try {
        const profile = await profileApi.get()
        if (cancelled) return
        const email = getAuthUser()?.email ?? ''
        setForm(formFromApiProfile(profile, email))
        syncAuthUserFromProfile(profile)
      } catch (err) {
        if (cancelled) return
        // 404 : profil pas encore créé — on garde le formulaire prérempli via auth.
        if (ApiHttpError.isInstance(err) && err.status === 404) {
          setForm((prev) => prev ?? formFromAuthUser())
          return
        }
        setError(
          ApiHttpError.isInstance(err)
            ? err.message
            : 'Impossible de charger le profil.',
        )
        setForm((prev) => prev ?? formFromAuthUser())
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [loggedIn])

  if (!loggedIn || !form) {
    return (
      <main className="profil-page">
        <div className="profil-page__gate">
          <p className="profil-page__eyebrow">Espace Utilisateur</p>
          <h1>Profil candidat</h1>
          <p>Connectez-vous pour consulter et mettre à jour votre profil.</p>
          <a href="/connexion" className="profil-page__btn profil-page__btn--primary">
            Aller à la connexion
          </a>
        </div>
      </main>
    )
  }

  const completeness = computeCompleteness(form)
  const name = displayName(form)
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
  const activeMeta = SECTIONS.find((s) => s.id === activeSection) ?? SECTIONS[0]
  const metaBits = [form.academicLevel, form.city, form.country].filter(Boolean)

  return (
    <main className="profil-page profil-page--banner" aria-labelledby="profil-hero-title">
      <ProfileBanner
        titleId="profil-hero-title"
        eyebrow="Espace Utilisateur"
        name={name}
        coverSrc={form.coverImage}
        avatarSrc={form.profileImage}
        avatarInitials={initials || 'C'}
        socialLinks={form.socialLinks}
        back={{ href: '/', label: 'Accueil', ariaLabel: "Retour à l'accueil" }}
      >
        <p className="showroom-page__edition">
          {metaBits.length > 0
            ? metaBits.join(' · ')
            : 'Complétez votre profil pour préparer votre candidature.'}
        </p>
        <div className="showroom-page__chips">
          {form.email ? <span className="showroom-page__chip">{form.email}</span> : null}
          {form.nationality ? (
            <span className="showroom-page__chip">{form.nationality}</span>
          ) : null}
          {form.gender === 'M' ? (
            <span className="showroom-page__chip showroom-page__chip--accent">Homme</span>
          ) : null}
          {form.gender === 'F' ? (
            <span className="showroom-page__chip showroom-page__chip--accent">Femme</span>
          ) : null}
        </div>
        <div
          className="profil-page__progress"
          role="meter"
          aria-valuenow={completeness}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Complétude du profil"
        >
          <div className="profil-page__progress-label">
            <span>Profil complété</span>
            <span>{completeness}%</span>
          </div>
          <div className="profil-page__progress-track">
            <div
              className="profil-page__progress-fill"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </ProfileBanner>

      <div className="profil-page__inner">

        {loading ? (
          <PageLoader label="Chargement du profil…" />
        ) : null}
        {error ? (
          <p className="profil-page__status profil-page__status--error" role="alert">
            {error}
          </p>
        ) : null}

        <form
          className="profil-page__layout"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!isApiLoggedIn()) {
              setError('Session expirée. Reconnectez-vous pour enregistrer.')
              return
            }
            setSaving(true)
            setSaved(false)
            setError('')
            try {
              const interests = form.interests
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
              const updated = await profileApi.update({
                firstName: form.firstName.trim() || undefined,
                lastName: form.lastName.trim() || undefined,
                phoneNumber: form.phoneNumber.trim() || undefined,
                bio: form.bio.trim() || undefined,
                videoPresentationUrl: form.videoPresentationUrl.trim() || undefined,
                dateOfBirth: form.dateOfBirth || undefined,
                gender: form.gender || undefined,
                nationality: form.nationality.trim() || undefined,
                address: form.address.trim() || undefined,
                city: form.city.trim() || undefined,
                country: form.country.trim() || undefined,
                profileImage: form.profileImage.trim() || undefined,
                coverImage: form.coverImage.trim() || undefined,
                socialLinks: socialLinksForApi(form.socialLinks),
                interests,
                academicLevel: form.academicLevel.trim() || undefined,
              })
              setForm(formFromApiProfile(updated, form.email))
              syncAuthUserFromProfile(updated)
              setSaved(true)
              window.setTimeout(() => setSaved(false), 2200)
            } catch (err) {
              setError(
                ApiHttpError.isInstance(err)
                  ? err.message
                  : 'Impossible d’enregistrer le profil.',
              )
            } finally {
              setSaving(false)
            }
          }}
        >
          <aside className="profil-page__sidebar">
            <p className="profil-page__sidebar-label">Sections</p>
            <nav className="profil-page__menu" aria-label="Sections du profil">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`profil-page__menu-btn${activeSection === id ? ' is-active' : ''}`}
                  onClick={() => setActiveSection(id)}
                >
                  <span className="profil-page__menu-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  {label}
                </button>
              ))}
            </nav>
            <div className="profil-page__sidebar-foot">
              <p>Les métiers et candidatures se gèrent depuis la page Compétition.</p>
              <a href="/competition" className="profil-page__link-comp">
                Voir la compétition <FaArrowRight aria-hidden="true" />
              </a>
            </div>
          </aside>

          <div className="profil-page__content">
            <section className="profil-page__panel" aria-labelledby="profil-panel-title">
              <div className="profil-page__panel-head">
                <h2 id="profil-panel-title">{activeMeta.title}</h2>
                <p>{activeMeta.desc}</p>
              </div>

              {activeSection === 'infos' ? (
                <div className="profil-page__fields">
                  <label className="profil-page__field">
                    <span>Prénoms</span>
                    <input
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                      autoComplete="given-name"
                    />
                  </label>
                  <label className="profil-page__field">
                    <span>Nom</span>
                    <input
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                      autoComplete="family-name"
                    />
                  </label>
                  <label className="profil-page__field">
                    <span>Date de naissance</span>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    />
                  </label>
                  <label className="profil-page__field">
                    <span>Genre</span>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    >
                      <option value="">Sélectionnez</option>
                      <option value="M">Homme</option>
                      <option value="F">Femme</option>
                    </select>
                  </label>
                  <label className="profil-page__field">
                    <span>Pays de nationalité</span>
                    <input
                      value={form.nationality}
                      onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                    />
                  </label>
                  <label className="profil-page__field">
                    <span>Pays de résidence</span>
                    <input
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                    />
                  </label>
                </div>
              ) : null}

              {activeSection === 'medias' ? (
                <ProfileMediaFields
                  form={form}
                  onChange={(patch) => setForm((prev) => (prev ? { ...prev, ...patch } : prev))}
                  initials={initials || 'C'}
                />
              ) : null}

              {activeSection === 'contact' ? (
                <div className="profil-page__fields">
                  <label className="profil-page__field">
                    <span>E-mail</span>
                    <input type="email" value={form.email} disabled readOnly />
                  </label>
                  <label className="profil-page__field">
                    <span>Téléphone</span>
                    <input
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      placeholder="Ex. : +2250102030405"
                      autoComplete="tel"
                    />
                  </label>
                  <label className="profil-page__field">
                    <span>Ville</span>
                    <input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </label>
                  <label className="profil-page__field profil-page__field--full">
                    <span>Adresse</span>
                    <input
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Commune, quartier, rue"
                    />
                  </label>
                </div>
              ) : null}

              {activeSection === 'participation' ? (
                <div className="profil-page__fields">
                  <label className="profil-page__field profil-page__field--full">
                    <span>Niveau académique</span>
                    <input
                      value={form.academicLevel}
                      onChange={(e) => setForm({ ...form, academicLevel: e.target.value })}
                      placeholder="Ex. : Licence 3, BTS, CAP…"
                    />
                  </label>
                  <label className="profil-page__field profil-page__field--full">
                    <span>Présentation personnelle</span>
                    <textarea
                      rows={5}
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      placeholder="Décrivez votre parcours, votre motivation et votre niveau."
                    />
                  </label>
                  <label className="profil-page__field profil-page__field--full">
                    <span>Vidéo de présentation (URL)</span>
                    <input
                      type="url"
                      value={form.videoPresentationUrl}
                      onChange={(e) =>
                        setForm({ ...form, videoPresentationUrl: e.target.value })
                      }
                      placeholder="https://…"
                    />
                  </label>
                </div>
              ) : null}

              {activeSection === 'interests' ? (
                <div className="profil-page__fields">
                  <label className="profil-page__field profil-page__field--full">
                    <span>Centres d’intérêt</span>
                    <textarea
                      rows={7}
                      value={form.interests}
                      onChange={(e) => setForm({ ...form, interests: e.target.value })}
                      placeholder={'Ex. :\nInformatique\nProgrammation\nDesign'}
                    />
                    <p className="profil-page__hint">Une ligne par centre d’intérêt.</p>
                  </label>
                </div>
              ) : null}
            </section>

            <div className="profil-page__actions">
              <button
                type="submit"
                className="profil-page__btn profil-page__btn--primary"
                disabled={saving || loading}
              >
                {saving ? 'Enregistrement…' : 'Enregistrer mon profil'}
              </button>
              <button
                type="button"
                className="profil-page__btn profil-page__btn--ghost"
                onClick={() => {
                  clearAuthSession()
                  logoutCandidate()
                  window.location.href = '/'
                }}
              >
                Se déconnecter
              </button>
              {saved ? (
                <p className="profil-page__toast" role="status">
                  Profil enregistré.
                </p>
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
