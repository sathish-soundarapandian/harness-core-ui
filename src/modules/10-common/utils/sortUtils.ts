import type { SelectOption } from '@harness/uicore'

export const sortByName: SelectOption[] = [
  { label: 'Name (A->Z, 0->9)', value: 'name,ASC' },
  { label: 'Name (Z->A, 9->0)', value: 'name,DESC' }
]

export const sortByEmail: SelectOption[] = [
  { label: 'Email (A->Z, 0->9)', value: 'email,ASC' },
  { label: 'Email (Z->A, 9->0)', value: 'email,DESC' }
]

export const sortByLastModified: SelectOption[] = [
  { label: 'Last Modified', value: 'lastModifiedAt,DESC' }
  // { label: 'Last Modified, Z->A', value: 'lastModifiedAt,ASC' }
]

export const sortByCreated: SelectOption[] = [
  { label: 'Newest', value: 'createdAt,DESC' },
  { label: 'Oldest', value: 'createdAt,ASC' }
]
