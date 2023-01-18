import type { ScopeAndIdentifier } from '../MultiSelectEntityReference/MultiSelectEntityReference'

export const getCountOfSelectedRecordsInGivenScope = (
  scope: string | undefined,
  selectedRecords: ScopeAndIdentifier[]
): number => {
  if (typeof scope !== 'string') {
    return selectedRecords.length
  }
  let countInScope = 0
  selectedRecords.forEach((item: any) => {
    if (item.scope === scope) {
      countInScope = countInScope + 1
    }
  })
  return countInScope
}
