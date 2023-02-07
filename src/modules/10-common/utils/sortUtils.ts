import type { SelectOption } from '@harness/uicore'

export const sortByName: SelectOption[] = [
  { label: 'Name, A->Z', value: 'name,ASC' },
  { label: 'Name, Z->A', value: 'name,DESC' }
]

export const sortByEmail: SelectOption[] = [
  { label: 'Email, A->Z', value: 'email,ASC' },
  { label: 'Email, Z->A', value: 'email,DESC' }
]

export const sortByLastModified: SelectOption[] = [
  { label: 'Last Modified, A->Z', value: 'lastModifiedAt,DESC' },
  { label: 'Last Modified, Z->A', value: 'lastModifiedAt,ASC' }
]

export const sortByCreated: SelectOption[] = [
  { label: 'Created, A->Z', value: 'createdAt,DESC' },
  { label: 'Created, Z->A', value: 'createdAt,ASC' }
]
