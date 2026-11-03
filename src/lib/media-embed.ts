export function youtubeVideoId(rawUrl: string | null | undefined): string | null {
  if (!rawUrl?.trim()) return null
  try {
    const url = new URL(rawUrl.trim())
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] ?? null
    }
    if (host.includes('youtube.com')) {
      const id = url.searchParams.get('v')
      if (id) return id
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' && parts[1]) return parts[1]
      if (parts[0] === 'shorts' && parts[1]) return parts[1]
    }
  } catch {
    return null
  }
  return null
}

export function youtubeEmbedUrl(
  rawUrl: string | null | undefined,
  options?: {
    autoplay?: boolean
    mute?: boolean
    loop?: boolean
    controls?: boolean
  },
): string | null {
  const id = youtubeVideoId(rawUrl)
  if (!id) return null

  const params = new URLSearchParams({
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    autoplay: options?.autoplay ? '1' : '0',
    mute: options?.mute === false ? '0' : '1',
    controls: options?.controls === false ? '0' : '1',
  })

  if (options?.loop) {
    params.set('loop', '1')
    params.set('playlist', id)
  }

  return `https://www.youtube.com/embed/${encodeURIComponent(id)}?${params.toString()}`
}

export function vimeoEmbedUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl?.trim()) return null
  try {
    const url = new URL(rawUrl.trim())
    const host = url.hostname.replace(/^www\./, '')
    if (!host.includes('vimeo.com')) return null
    const id = url.pathname.split('/').filter(Boolean)[0]
    return id ? `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1` : null
  } catch {
    return null
  }
}

export function formatCompactCount(value: number | null | undefined): string {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n) || n < 0) return '0'
  if (n < 1000) return String(Math.round(n))
  if (n < 1_000_000) {
    const v = n / 1000
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')} k`
  }
  const v = n / 1_000_000
  return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')} M`
}
