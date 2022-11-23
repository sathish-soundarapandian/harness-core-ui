import type { SelectOption } from '@harness/uicore'
import type { Target } from 'services/cf'

export default function targetToSelectOption({ name, identifier }: Target): SelectOption {
  return { label: name, value: identifier }
}
