import React, { useContext, useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import { isEmpty } from 'lodash-es'
import { useCommonHealthSource } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/useCommonHealthSource'
import {
  getFieldsDefaultValuesFromConfig,
  getIsConnectorRuntimeOrExpression
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
import type {
  CommonCustomMetricFormikInterface,
  AssignSectionType
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import JsonSelectorWithDrawer from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/LogsTable/components/JsonSelectorWithDrawer'
import type { LogFieldsMultiTypeState } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/CustomMetricForm.types'
import { getMultiTypeRecordInitialValue } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/LogsTable/components/JsonSelectorWithDrawer.utils'
import type { RecordProps } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonCustomMetricFormContainer/CommonCustomMetricFormContainerLayout/CommonCustomMetricFormContainer.types'

interface ServiceInstanceJSONSelectorProps {
  serviceInstanceConfig?: AssignSectionType['serviceInstance']
  recordProps: RecordProps
}

export function ServiceInstanceJSONSelector({
  serviceInstanceConfig,
  recordProps
}: ServiceInstanceJSONSelectorProps): JSX.Element {
  const { isTemplate, sourceData } = useContext(SetupSourceTabsContext)

  const { sampleRecords, isQueryRecordsAvailable, isRecordsLoading } = recordProps

  const { isQueryRuntimeOrExpression } = useCommonHealthSource()
  const isConnectorRuntimeOrExpression = getIsConnectorRuntimeOrExpression(sourceData.connectorRef)

  const { values, setValues } = useFormikContext<CommonCustomMetricFormikInterface>()

  const { query } = values

  const isJsonFieldsDisabled = !isQueryRecordsAvailable || !query || isEmpty(sampleRecords) || isRecordsLoading

  const [multiTypeRecord, setMultiTypeRecord] = useState<LogFieldsMultiTypeState | null>(
    (): LogFieldsMultiTypeState | null => {
      return getMultiTypeRecordInitialValue({
        jsonSelectorFields: serviceInstanceConfig,
        isTemplate,
        formValues: values
      })
    }
  )

  useEffect(() => {
    if (!isTemplate || (isTemplate && (!isQueryRuntimeOrExpression || !isConnectorRuntimeOrExpression))) {
      const defaultValuesToUpdateFormik = getFieldsDefaultValuesFromConfig({
        values,
        multiTypeRecord,
        fieldMappings: serviceInstanceConfig,
        isTemplate
      })
      if (!isEmpty(defaultValuesToUpdateFormik)) {
        setValues({ ...values, ...defaultValuesToUpdateFormik })
      }
    }
  }, [values, isQueryRuntimeOrExpression, isConnectorRuntimeOrExpression, multiTypeRecord])

  return (
    <JsonSelectorWithDrawer
      fieldMappings={serviceInstanceConfig}
      jsonData={sampleRecords[0]}
      disableFields={isJsonFieldsDisabled}
      multiTypeRecord={multiTypeRecord}
      setMultiTypeRecord={setMultiTypeRecord}
      selectOnlyLastKey
    />
  )
}
