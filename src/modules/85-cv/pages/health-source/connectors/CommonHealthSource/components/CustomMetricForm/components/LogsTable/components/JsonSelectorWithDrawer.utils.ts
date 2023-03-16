import { getMultiTypeFromValue } from '@harness/uicore'
import {
  formatJSONPath,
  wrapJsonKeysWithBrackets
} from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJson.utils'
import type { JsonRawSelectedPathType } from '@cv/components/JsonSelector/JsonSelectorType'
import type { GetMultiTypeRecordInitialValueParams, LogFieldsMultiTypeState } from '../../../CustomMetricForm.types'

export const getMultiTypeRecordInitialValue = ({
  jsonSelectorFields,
  isTemplate,
  formValues
}: GetMultiTypeRecordInitialValueParams): LogFieldsMultiTypeState | null => {
  if (!jsonSelectorFields || !isTemplate || !formValues) {
    return null
  }

  const logFieldsMultiType: LogFieldsMultiTypeState = {} as LogFieldsMultiTypeState

  jsonSelectorFields.forEach(field => {
    logFieldsMultiType[field.identifier] = getMultiTypeFromValue(formValues[field.identifier])
  })

  return logFieldsMultiType
}

export function getSelectedPath(
  selectOnlyLastKey: boolean | undefined,
  pathSelected: JsonRawSelectedPathType,
  showExactJsonPath: boolean | undefined
): string {
  let path = ''
  if (selectOnlyLastKey) {
    path = pathSelected.key
  } else {
    const pathArray = [...pathSelected.path, pathSelected.key]
    path = showExactJsonPath ? formatJSONPath(pathArray) : wrapJsonKeysWithBrackets(pathArray)
  }
  return path
}
