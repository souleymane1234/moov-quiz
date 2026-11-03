import { useRef, useState } from 'react'
import {
  FaCamera,
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaPlus,
  FaTiktok,
  FaTrashCan,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'
import { ApiHttpError } from '../lib/api'
import type { ProfileSocialLinkDto } from '../lib/api/modules/profile'
import { uploadsApi } from '../services/api-client'

export type SocialLinkRow = {
  id: string
  platform: string
  url: string
  logoUrl?: string | null
}

type MediaFormSlice = {
  profileImage: string
  coverImage: string
  socialLinks: SocialLinkRow[]
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: FaFacebookF, placeholder: 'https://facebook.com/…' },
  { id: 'instagram', label: 'Instagram', icon: FaInstagram, placeholder: 'https://instagram.com/…' },
  { id: 'linkedin', label: 'LinkedIn', icon: FaLinkedinIn, placeholder: 'https://linkedin.com/in/…' },
  { id: 'tiktok', label: 'TikTok', icon: FaTiktok, placeholder: 'https://tiktok.com/@…' },
  { id: 'youtube', label: 'YouTube', icon: FaYoutube, placeholder: 'https://youtube.com/@…' },
  { id: 'x', label: 'X (Twitter)', icon: FaXTwitter, placeholder: 'https://x.com/…' },
  { id: 'website', label: 'Site web', icon: FaGlobe, placeholder: 'https://…' },
] as const

function platformMeta(platform: string) {
  return PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[PLATFORMS.length - 1]
}

function newRowId(): string {
  return `social-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function normalizePlatform(platform: string | null | undefined): string {
  const key = (platform ?? '').trim().toLowerCase()
  if (key.includes('facebook') || key === 'fb') return 'facebook'
  if (key.includes('instagram') || key === 'ig') return 'instagram'
  if (key.includes('linkedin')) return 'linkedin'
  if (key.includes('tiktok')) return 'tiktok'
  if (key.includes('youtube') || key === 'yt') return 'youtube'
  if (key.includes('twitter') || key === 'x') return 'x'
  return 'website'
}

export function socialRowsFromApi(
  links: ProfileSocialLinkDto[] | null | undefined,
): SocialLinkRow[] {
  return (links ?? []).map((link) => ({
    id: newRowId(),
    platform: normalizePlatform(link.platform),
    url: link.url ?? '',
    logoUrl: link.logoUrl,
  }))
}

export function socialLinksForApi(rows: SocialLinkRow[]): ProfileSocialLinkDto[] {
  return rows
    .map((row) => ({ ...row, url: row.url.trim() }))
    .filter((row) => row.url)
    .map((row) => ({
      platform: row.platform,
      url: /^https?:\/\//i.test(row.url) ? row.url : `https://${row.url}`,
      ...(row.logoUrl ? { logoUrl: row.logoUrl } : {}),
    }))
}

function ImageUploadField({
  kind,
  label,
  hint,
  value,
  initials,
  onChange,
}: {
  kind: 'avatar' | 'cover'
  label: string
  hint: string
  value: string
  initials?: string
  onChange: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError('')
    if (!file.type.startsWith('image/')) {
      setError('Choisissez un fichier image (JPG, PNG, WebP…).')
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Image trop lourde (5 Mo maximum).')
      return
    }
    setUploading(true)
    try {
      const res = await uploadsApi.uploadImage(file)
      const url = res.data?.url?.trim()
      if (!url) throw new Error('missing url')
      onChange(url)
    } catch (err) {
      setError(
        ApiHttpError.isInstance(err)
          ? err.message
          : 'Impossible d’envoyer l’image. Réessayez.',
      )
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={`profil-media__upload profil-media__upload--${kind}`}>
      <div className="profil-media__upload-head">
        <span className="profil-media__label">{label}</span>
        <span className="profil-media__hint">{hint}</span>
      </div>

      <button
        type="button"
        className={`profil-media__preview profil-media__preview--${kind}${uploading ? ' is-uploading' : ''}`}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label={`${value ? 'Changer' : 'Ajouter'} : ${label}`}
      >
        {value ? (
          <img src={value} alt="" />
        ) : kind === 'avatar' ? (
          <span className="profil-media__initials" aria-hidden="true">
            {initials}
          </span>
        ) : null}
        <span className="profil-media__overlay" aria-hidden="true">
          {uploading ? (
            <span className="profil-media__spinner" />
          ) : (
            <>
              <FaCamera />
              <span>{value ? 'Changer' : 'Ajouter'}</span>
            </>
          )}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      <div className="profil-media__upload-actions">
        <button
          type="button"
          className="profil-media__btn"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <FaCamera aria-hidden="true" />
          {uploading ? 'Envoi…' : value ? 'Changer' : 'Choisir une image'}
        </button>
        {value && !uploading ? (
          <button
            type="button"
            className="profil-media__btn profil-media__btn--danger"
            onClick={() => onChange('')}
          >
            <FaTrashCan aria-hidden="true" />
            Retirer
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="profil-media__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function ProfileMediaFields({
  form,
  onChange,
  initials,
}: {
  form: MediaFormSlice
  onChange: (patch: Partial<MediaFormSlice>) => void
  initials: string
}) {
  const rows = form.socialLinks
  const usedPlatforms = new Set(rows.map((r) => r.platform))
  const nextPlatform =
    PLATFORMS.find((p) => !usedPlatforms.has(p.id))?.id ?? 'website'

  function updateRow(id: string, patch: Partial<SocialLinkRow>) {
    onChange({
      socialLinks: rows.map((row) =>
        row.id === id
          ? {
              ...row,
              ...patch,
              ...(patch.platform && patch.platform !== row.platform ? { logoUrl: null } : {}),
            }
          : row,
      ),
    })
  }

  return (
    <div className="profil-media">
      <div className="profil-media__images">
        <ImageUploadField
          kind="avatar"
          label="Photo de profil"
          hint="Format carré conseillé."
          value={form.profileImage}
          initials={initials}
          onChange={(url) => onChange({ profileImage: url })}
        />
        <ImageUploadField
          kind="cover"
          label="Photo de couverture"
          hint="Format paysage conseillé (1600 × 600)."
          value={form.coverImage}
          onChange={(url) => onChange({ coverImage: url })}
        />
      </div>

      <div className="profil-media__socials">
        <div className="profil-media__upload-head">
          <span className="profil-media__label">Réseaux sociaux</span>
          <span className="profil-media__hint">
            Les icônes apparaissent sous votre nom dans l’en-tête.
          </span>
        </div>

        {rows.length === 0 ? (
          <p className="profil-media__empty">Aucun réseau social ajouté.</p>
        ) : (
          <ul className="profil-media__social-list">
            {rows.map((row) => {
              const meta = platformMeta(row.platform)
              const Icon = meta.icon
              return (
                <li
                  key={row.id}
                  className={`profil-media__social-row profil-media__social-row--${meta.id}`}
                >
                  <span className="profil-media__social-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <select
                    value={meta.id}
                    onChange={(e) => updateRow(row.id, { platform: e.target.value })}
                    aria-label="Réseau social"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="url"
                    inputMode="url"
                    value={row.url}
                    onChange={(e) => updateRow(row.id, { url: e.target.value })}
                    placeholder={meta.placeholder}
                    aria-label={`Lien ${meta.label}`}
                  />
                  <button
                    type="button"
                    className="profil-media__social-remove"
                    onClick={() =>
                      onChange({ socialLinks: rows.filter((r) => r.id !== row.id) })
                    }
                    aria-label={`Supprimer le lien ${meta.label}`}
                    title="Supprimer"
                  >
                    <FaTrashCan aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <button
          type="button"
          className="profil-media__btn profil-media__btn--add"
          onClick={() =>
            onChange({
              socialLinks: [...rows, { id: newRowId(), platform: nextPlatform, url: '' }],
            })
          }
        >
          <FaPlus aria-hidden="true" />
          Ajouter un réseau
        </button>
      </div>

      <p className="profil-media__note">
        Pensez à cliquer sur « Enregistrer mon profil » pour valider vos modifications.
      </p>
    </div>
  )
}
