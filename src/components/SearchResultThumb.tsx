import { useState } from 'react'
import type { IconType } from 'react-icons'
import {
  FaBook,
  FaBriefcase,
  FaBullhorn,
  FaCartShopping,
  FaClipboardList,
  FaFileLines,
  FaGamepad,
  FaGlobe,
  FaGraduationCap,
  FaMagnifyingGlass,
  FaNewspaper,
  FaPenToSquare,
  FaPlay,
  FaRightLeft,
  FaSchool,
  FaTv,
  FaUser,
  FaCompass,
} from 'react-icons/fa6'

const MODULE_ICONS: Record<string, IconType> = {
  users: FaUser,
  video: FaPlay,
  news: FaNewspaper,
  job_sheet: FaBriefcase,
  emission: FaTv,
  play: FaGamepad,
  quiz: FaPenToSquare,
  school: FaSchool,
  magazine: FaBook,
  scholarship: FaGraduationCap,
  foreign_study: FaGlobe,
  revision: FaClipboardList,
  questionnaire: FaCompass,
  product: FaCartShopping,
  permutation: FaRightLeft,
  orientation: FaBullhorn,
  document_request: FaFileLines,
}

export function SearchModuleIcon({ contentType }: { contentType: string }) {
  const Icon = MODULE_ICONS[contentType] ?? FaMagnifyingGlass
  return <Icon aria-hidden="true" />
}

export function SearchResultThumb({
  contentType,
  image,
  size = 'md',
}: {
  contentType: string
  image: string | null
  size?: 'sm' | 'md' | 'lg'
}) {
  const [failed, setFailed] = useState(false)
  const round = contentType === 'users'
  const className = `search-thumb search-thumb--${size}${round ? ' search-thumb--round' : ''} search-thumb--${contentType}`

  if (image && !failed) {
    return (
      <span className={className}>
        <img src={image} alt="" loading="lazy" onError={() => setFailed(true)} />
      </span>
    )
  }
  return (
    <span className={`${className} search-thumb--icon`}>
      <SearchModuleIcon contentType={contentType} />
    </span>
  )
}
