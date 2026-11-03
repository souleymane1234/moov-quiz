import {
  applicationStatusTone,
  formatApplicationStatusLabel,
  getAlreadyAppliedCopy,
  type ApplicationRole,
} from '../hooks/use-edition-application-status'

type AlreadyAppliedNoticeProps = {
  page: 'candidate' | 'expert'
  appliedAs: ApplicationRole | null
  applicationStatus: string | null
}

export function AlreadyAppliedNotice({
  page,
  appliedAs,
  applicationStatus,
}: AlreadyAppliedNoticeProps) {
  const { title, description } = getAlreadyAppliedCopy(page, appliedAs)
  const showStatus =
    Boolean(applicationStatus) &&
    ((page === 'candidate' && appliedAs === 'candidate') ||
      (page === 'expert' && appliedAs === 'expert') ||
      appliedAs === 'unknown' ||
      appliedAs === null)
  const tone = applicationStatusTone(applicationStatus)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 16,
        padding: '48px 24px',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'color-mix(in srgb, #2563eb 12%, transparent)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>
      <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h2>
      <p
        style={{
          margin: 0,
          maxWidth: 440,
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
      {showStatus ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 999,
            fontSize: '0.95rem',
            fontWeight: 600,
            background: tone.background,
            color: tone.color,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'currentColor',
              opacity: 0.6,
            }}
          />
          {formatApplicationStatusLabel(applicationStatus)}
        </div>
      ) : null}
      <a
        href="/"
        className="candidature-form__btn"
        style={{
          marginTop: 8,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          minWidth: 200,
        }}
      >
        Retour à l&apos;accueil
      </a>
    </div>
  )
}
