import type { FormikTouched } from 'formik'
import { isEmpty } from 'lodash-es'
import type { GroupedMetric } from './GroupedSideNav.types'

export function showWarningIcon({
  touched,
  isValid,
  selectedApp,
  selectedItem
}: {
  touched: FormikTouched<unknown>
  isValid?: boolean
  selectedApp: GroupedMetric
  selectedItem?: string
}): boolean {
  return !isEmpty(touched) && !isValid && selectedApp?.metricName === selectedItem
}
