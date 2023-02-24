import React, { useContext, useEffect, useState } from 'react'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { HealthSourceParamValuesRequest, LogRecord, QueryRecordsRequest, useGetSampleLogData } from 'services/cv'
import { useStrings } from 'framework/strings'
import {
  getFieldsDefaultValuesFromConfig,
  getIsConnectorRuntimeOrExpression,
  getRequestBodyForSampleLogs
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type {
  CommonCustomMetricFormikInterface,
  FieldMapping
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { FIELD_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import JsonSelectorWithDrawer from './components/JsonSelectorWithDrawer'
import LogsTableComponent from './components/LogsTableComponent/LogsTableComponent'
import CustomMetricsSectionHeader from '../CustomMetricsSectionHeader'
import { useCommonHealthSource } from '../CommonHealthSourceContext/useCommonHealthSource'
import { getCanShowSampleLogButton } from '../CommonCustomMetricFormContainer/CommonCustomMetricFormContainerLayout/CommonCustomMetricFormContainer.utils'
import type { LogFieldsMultiTypeState } from '../../CustomMetricForm.types'
import { getMultiTypeRecordInitialValue } from './components/JsonSelectorWithDrawer.utils'
import CommonHealthSourceField from '../CommonCustomMetricFormContainer/CommonCustomMetricFormContainerLayout/components/CommonHealthSourceField/CommonHealthSourceField'

interface CommonHealthSourceLogsTable {
  connectorIdentifier: string
  providerTypeForRecords: QueryRecordsRequest['providerType']
  providerType: HealthSourceParamValuesRequest['providerType']
  fieldMappings?: FieldMapping[]
  queryField?: FieldMapping
  isRecordsLoading?: boolean
  disableLogFields?: boolean
  sampleRecords: Record<string, any>[]
  selectOnlyLastKey?: boolean
  showExactJsonPath?: boolean
}

export default function LogsTableContainer(props: CommonHealthSourceLogsTable): JSX.Element {
  const {
    fieldMappings,
    queryField,
    connectorIdentifier,
    providerType,
    providerTypeForRecords,
    sampleRecords,
    disableLogFields,
    isRecordsLoading,
    selectOnlyLastKey,
    showExactJsonPath
  } = props
  const { values, setValues } = useFormikContext<CommonCustomMetricFormikInterface>()
  const { query } = values
  const [logsSampleData, setLogsSampleData] = useState<LogRecord[] | null>(null)
  const { isTemplate } = useContext(SetupSourceTabsContext)
  const { isQueryRuntimeOrExpression } = useCommonHealthSource()
  const isConnectorRuntimeOrExpression = getIsConnectorRuntimeOrExpression(connectorIdentifier)
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const jsonSelectorFields = fieldMappings?.filter(field => field.type === FIELD_ENUM.JSON_SELECTOR)
  const dropdownFields = fieldMappings?.filter(field => field.type === FIELD_ENUM.DROPDOWN)
  const {
    loading: logsLoading,
    error: logsError,
    mutate: fetchSampleLogs
  } = useGetSampleLogData({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })
  const [multiTypeRecord, setMultiTypeRecord] = useState<LogFieldsMultiTypeState | null>(
    (): LogFieldsMultiTypeState | null => {
      return getMultiTypeRecordInitialValue({
        jsonSelectorFields,
        isTemplate,
        formValues: values
      })
    }
  )
  const isLogFieldsDisabled = disableLogFields || !query || isEmpty(sampleRecords) || logsLoading

  useEffect(() => {
    if (isRecordsLoading || logsLoading) {
      setLogsSampleData(null)
    }
  }, [isRecordsLoading, logsLoading])

  useEffect(() => {
    if (!isTemplate || (isTemplate && (!isQueryRuntimeOrExpression || !isConnectorRuntimeOrExpression))) {
      const defaultValuesToUpdateFormik = getFieldsDefaultValuesFromConfig({
        values,
        multiTypeRecord,
        fieldMappings,
        isTemplate
      })
      if (!isEmpty(defaultValuesToUpdateFormik)) {
        setValues({ ...values, ...defaultValuesToUpdateFormik })
      }
    }
  }, [values, isQueryRuntimeOrExpression, isConnectorRuntimeOrExpression, multiTypeRecord])

  const handleFetchSampleLogs = (): void => {
    const fetchSampleLogsPayload = getRequestBodyForSampleLogs(providerTypeForRecords, {
      connectorIdentifier,
      query,
      fieldMappings,
      queryField,
      formValues: values
    })

    fetchSampleLogs(fetchSampleLogsPayload as QueryRecordsRequest).then(sampleData => {
      if (sampleData?.resource?.logRecords) {
        setLogsSampleData(sampleData.resource.logRecords)
      }
    })
  }

  return (
    <Container margin={{ top: 'medium' }}>
      <CustomMetricsSectionHeader
        sectionTitle={getString('cv.monitoringSources.commonHealthSource.logsTable.title')}
        sectionSubTitle={getString('cv.monitoringSources.commonHealthSource.logsTable.subTitle')}
      />

      <Container width={350}>
        <JsonSelectorWithDrawer
          fieldMappings={jsonSelectorFields}
          jsonData={sampleRecords[0]}
          disableFields={isLogFieldsDisabled}
          multiTypeRecord={multiTypeRecord}
          setMultiTypeRecord={setMultiTypeRecord}
          selectOnlyLastKey={selectOnlyLastKey}
          showExactJsonPath={showExactJsonPath}
        />
      </Container>
      <Container width={350}>
        {dropdownFields?.length
          ? dropdownFields.map(field => {
              return (
                <CommonHealthSourceField
                  key={field?.identifier}
                  field={field}
                  isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
                  connectorIdentifier={connectorIdentifier}
                  providerType={providerType as HealthSourceParamValuesRequest['providerType']}
                />
              )
            })
          : null}
      </Container>
      {getCanShowSampleLogButton({
        isQueryRuntimeOrExpression,
        isConnectorRuntimeOrExpression,
        isTemplate,
        multiTypeRecord
      }) && (
        <Layout.Horizontal spacing="medium" margin={{ bottom: 'medium', top: 'medium' }}>
          <Button
            onClick={handleFetchSampleLogs}
            tooltip={
              isLogFieldsDisabled
                ? getString('cv.monitoringSources.commonHealthSource.logsTable.fetchLogDataButtonDisableMessage')
                : ''
            }
            disabled={isLogFieldsDisabled}
            variation={ButtonVariation.SECONDARY}
          >
            {getString('cv.monitoringSources.commonHealthSource.logsTable.sampleLogButtonText')}
          </Button>

          {logsLoading && <Text icon="spinner">{getString('cv.processing')}</Text>}
        </Layout.Horizontal>
      )}

      <LogsTableComponent
        loading={logsLoading}
        error={logsError}
        fetchSampleRecords={handleFetchSampleLogs}
        sampleData={logsSampleData}
      />
    </Container>
  )
}
