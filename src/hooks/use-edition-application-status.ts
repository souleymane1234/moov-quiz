import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { emissionRequest } from '../lib/emission-request'
import { useActiveEdition, useResolvedEmission } from './use-emission-queries'

export type ApplicationRole = 'candidate' | 'expert' | 'unknown'

export type EditionApplicationStatus = {
  editionId: string | null
  hasApplied: boolean
  appliedAs: ApplicationRole | null
  applicationStatus: string | null
  myCandidateId: string | null
  myStaffId: string | null
  isLoading: boolean
}

function resolveAppliedAs(
  myCandidateId: string | null,
  myStaffId: string | null,
  hasApplied: boolean,
): ApplicationRole | null {
  if (myStaffId && myCandidateId) return 'unknown'
  if (myStaffId) return 'expert'
  if (myCandidateId) return 'candidate'
  if (hasApplied) return 'unknown'
  return null
}

/** Statut de candidature de l’utilisateur connecté sur l’édition active. */
export function useEditionApplicationStatus(loggedIn: boolean): EditionApplicationStatus {
  const { emission } = useResolvedEmission()
  const emissionId = emission?.id ?? null

  const editionsQuery = useQuery({
    queryKey: ['editions-applied-status', emissionId, loggedIn],
    queryFn: () => emissionRequest.listEditions(emissionId!, { page: 1, limit: 50 }),
    enabled: Boolean(emissionId) && loggedIn,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const activeEditionQuery = useActiveEdition()
  const editionId = activeEditionQuery.data?.id ?? null
  const detail = activeEditionQuery.editionDetail

  const fromList = useMemo(() => {
    if (!editionId || !editionsQuery.data?.data) return null
    return editionsQuery.data.data.find((edition) => edition.id === editionId) ?? null
  }, [editionId, editionsQuery.data])

  const myCandidateId =
    detail?.myCandidateId?.trim() ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((fromList as any)?.myCandidateId as string | null | undefined)?.trim() ||
    null

  const myStaffId =
    detail?.myStaffId?.trim() ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((fromList as any)?.myStaffId as string | null | undefined)?.trim() ||
    null

  const hasAppliedFlag =
    Boolean(detail?.hasApplied) || Boolean(fromList?.hasApplied)

  const hasApplied = hasAppliedFlag || Boolean(myCandidateId) || Boolean(myStaffId)

  const applicationStatus =
    detail?.applicationStatus ?? fromList?.applicationStatus ?? null

  const appliedAs = resolveAppliedAs(myCandidateId, myStaffId, hasApplied)

  const isLoading =
    loggedIn &&
    (editionsQuery.isLoading ||
      activeEditionQuery.editionDetailLoading ||
      (Boolean(emissionId) && !editionId && activeEditionQuery.isLoading))

  return {
    editionId,
    hasApplied,
    appliedAs,
    applicationStatus,
    myCandidateId,
    myStaffId,
    isLoading,
  }
}

export function formatApplicationStatusLabel(status: string | null | undefined): string {
  if (status === 'EN_ATTENTE') return 'En attente de validation'
  if (status === 'VALIDE' || status === 'VALIDEE') return 'Candidature validée'
  if (status === 'REFUSEE' || status === 'REJETEE' || status === 'REJETE') {
    return 'Candidature rejetée'
  }
  return String(status ?? 'En cours de traitement')
}

export function applicationStatusTone(status: string | null | undefined): {
  background: string
  color: string
} {
  if (status === 'EN_ATTENTE') return { background: '#fef3c7', color: '#92400e' }
  if (status === 'VALIDE' || status === 'VALIDEE') {
    return { background: '#dcfce7', color: '#166534' }
  }
  if (status === 'REFUSEE' || status === 'REJETEE' || status === 'REJETE') {
    return { background: '#fee2e2', color: '#991b1b' }
  }
  return { background: '#f3f4f6', color: '#374151' }
}

/** Messages selon le rôle déjà candidaté et la page visitée. */
export function getAlreadyAppliedCopy(
  page: 'candidate' | 'expert',
  appliedAs: ApplicationRole | null,
): { title: string; description: string } {
  if (page === 'candidate') {
    if (appliedAs === 'expert') {
      return {
        title: 'Vous avez déjà candidaté comme expert',
        description:
          'Votre dossier expert a déjà été soumis pour cette édition. Vous ne pouvez pas vous inscrire comme candidat.',
      }
    }
    if (appliedAs === 'candidate') {
      return {
        title: 'Vous avez déjà candidaté comme candidat',
        description:
          'Votre candidature a déjà été soumise pour cette édition. Voici le statut actuel de votre dossier :',
      }
    }
    return {
      title: 'Vous avez déjà candidaté',
      description:
        'Une candidature est déjà associée à votre compte pour cette édition. Vous ne pouvez pas en soumettre une nouvelle.',
    }
  }

  if (appliedAs === 'candidate') {
    return {
      title: 'Vous avez déjà candidaté comme candidat',
      description:
        'Votre candidature candidat a déjà été soumise pour cette édition. Vous ne pouvez pas postuler comme expert.',
    }
  }
  if (appliedAs === 'expert') {
    return {
      title: 'Vous avez déjà postulé comme expert',
      description:
        'Votre candidature expert a déjà été soumise pour cette édition. Voici le statut actuel :',
    }
  }
  return {
    title: 'Vous avez déjà candidaté',
    description:
      'Une candidature est déjà associée à votre compte pour cette édition. Vous ne pouvez pas en soumettre une nouvelle.',
  }
}
