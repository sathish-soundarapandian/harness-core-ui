import { getMultiTypeFromValue } from '@harness/uicore'
import type { GetMultiTypeRecordInitialValueParams, LogFieldsMultiTypeState } from '../../../CustomMetricForm.types'

export const getMultiTypeRecordInitialValue = ({
  filteredFieldsMapping,
  isTemplate,
  formValues
}: GetMultiTypeRecordInitialValueParams): LogFieldsMultiTypeState | null => {
  if (!filteredFieldsMapping || !isTemplate || !formValues) {
    return null
  }

  const logFieldsMultiType: LogFieldsMultiTypeState = {} as LogFieldsMultiTypeState

  filteredFieldsMapping.forEach(field => {
    logFieldsMultiType[field.identifier] = getMultiTypeFromValue(formValues[field.identifier])
  })

  return logFieldsMultiType
}
