export const APK_FILE_NAME = 'WORLDSKILLS CI.apk'
export const APK_HREF = `/upload/${encodeURIComponent(APK_FILE_NAME)}`
export const APK_DOWNLOAD_NAME = 'WORLDSKILLS CI.apk'

/** Logo Google Play officiel (triangle multicolore). */
export function GooglePlayLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M3.6 2.3c-.4.2-.6.6-.6 1.1v17.2c0 .5.2.9.6 1.1l9.2-9.7L3.6 2.3z"
      />
      <path
        fill="#FBBC04"
        d="m13.6 12.4 2.4-2.5-9.5-5.5 7.1 8z"
      />
      <path
        fill="#4285F4"
        d="m13.6 12.4 2.4 2.5 3.4-1.9c.7-.4.7-1.1 0-1.5l-3.4-1.9-2.4 2.8z"
      />
      <path
        fill="#34A853"
        d="m13.6 12.4-7.1 8 9.5-5.5-2.4-2.5z"
      />
    </svg>
  )
}

type PlayStoreDownloadButtonProps = {
  className?: string
  compact?: boolean
}

export function PlayStoreDownloadButton({
  className = '',
  compact = false,
}: PlayStoreDownloadButtonProps) {
  return (
    <a
      className={`ws-play-btn${compact ? ' ws-play-btn--compact' : ''}${className ? ` ${className}` : ''}`}
      href={APK_HREF}
      download={APK_DOWNLOAD_NAME}
      aria-label="Télécharger l'application Android WorldSkills Côte d'Ivoire"
    >
      <span className="ws-play-btn__icon">
        <GooglePlayLogo />
      </span>
      <span className="ws-play-btn__text">
        <span className="ws-play-btn__caption">Télécharger sur</span>
        <span className="ws-play-btn__label">Google Play</span>
      </span>
    </a>
  )
}
