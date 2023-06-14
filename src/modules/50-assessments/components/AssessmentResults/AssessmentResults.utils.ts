import type { SelectOption } from '@harness/uicore'
import type { SectionScore } from 'services/assessments'

export function getFilteredResultsForLevel(
  selectedLevels: SelectOption[] | null,
  responses?: SectionScore[]
): SectionScore[] {
  if (!responses) return []
  let filteredResults: SectionScore[] = []
  if (!selectedLevels || selectedLevels?.length === 3 || selectedLevels?.length === 0) {
    return responses
  } else {
    const selectedLevelKeys = selectedLevels.map(level => level.value)
    filteredResults = responses.filter(currentResponse =>
      selectedLevelKeys.includes(currentResponse?.sectionScore?.maturityLevel || '')
    )
  }

  return filteredResults
}

export function getFilteredResultsForSearch(
  responses: SectionScore[] | undefined,
  search: string | null
): SectionScore[] {
  if (!responses) return []
  if (!search) {
    return responses
  }
  let filteredResults: SectionScore[] = []
  filteredResults = responses.filter(response =>
    response?.sectionText?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase() as string)
  )
  return filteredResults
}
