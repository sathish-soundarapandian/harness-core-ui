import type { SelectOption } from '@harness/uicore'

export function getRegionsDropdownOptions(regions: string[]): SelectOption[] {
  const regionOptions: SelectOption[] = []
  regions.forEach(region => {
    if (region) {
      regionOptions.push({
        value: region,
        label: region
      })
    }
  })

  return regionOptions
}
