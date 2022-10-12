import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import type { CreateGroupName } from './GroupName.types'

export function validate(
  values: CreateGroupName,
  groupNames: SelectOption[],
  getString: UseStringsReturn['getString']
): { [key: string]: string } {
  const errors: { [key: string]: string } = {}
  if (!values.name?.trim().length) {
    errors.name = getString('cv.onboarding.selectProductScreen.validationText.name')
  } else if (groupNames.filter(name => name.value === values.name).length) {
    errors.name = getString('cv.monitoringSources.prometheus.validation.uniqueName', { existingName: values.name })
  }
  return errors
}

function getUniqueGroupName(arr: SelectOption[]): SelectOption[] {
  return [...new Map(arr.map(item => [item.value, item])).values()]
}

export function initializeGroupNames(
  mappedMetrics: Map<string, any>,
  getString: UseStringsReturn['getString']
): SelectOption[] {
  const groupNames = Array.from(mappedMetrics?.entries())
    .map(metric => {
      const { groupName } = metric?.[1] || {}
      return groupName || null
    })
    .filter(groupItem => groupItem !== null) as SelectOption[]

  const uniqueGroupNames = getUniqueGroupName(groupNames)

  return [{ label: getString('cv.addNew'), value: '' }, ...uniqueGroupNames]
}
