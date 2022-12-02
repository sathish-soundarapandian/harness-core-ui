/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useCallback, useMemo, useState } from 'react'
import { Container, FormInput, MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'

import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useGetELKIndices, useGetTimeFormat } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { InputWithDynamicModalForJsonMultiType } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJsonMultiType'
import { MapElkToServiceFieldNames } from '@cv/pages/health-source/connectors/ElkHealthSource/components/MapQueriesToHarnessService/constants'

import type { MapElkQueriesToServiceProps } from './MapElkQueriesToService.types'
// eslint-disable-next-line import/no-unresolved
import MultiTextOrSelectInput from './components/MapQueriesToHarnessServiceLayout/MultiTextOrSelectInput'
import css from './ElkMetricNameAndHostIdentifier.module.scss'

export function ElkMetricNameAndHostIdentifier(props: MapElkQueriesToServiceProps): JSX.Element {
  const {
    onChange,
    sampleRecord,
    isQueryExecuted,
    loading,
    serviceInstance,
    messageIdentifier,
    identifyTimestamp,
    isConnectorRuntimeOrExpression,
    isTemplate,
    expressions,
    connectorIdentifier,
    formikProps,
    timeStampFormat,
    logIndexes
  } = props

  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [logIdxMultitype, setLogIdxMultitype] = useState(() => getMultiTypeFromValue(logIndexes))
  const [timeStampMultitype, setTimeStampIdxMultitype] = useState(() => getMultiTypeFromValue(timeStampFormat))
  const isAddingIdentifiersDisabled = !isQueryExecuted || loading

  const { data: elkIndices, loading: indicesLoading } = useGetELKIndices({
    queryParams: { projectIdentifier, orgIdentifier, accountId, connectorIdentifier, tracingId: '' }
  })
  const { data: elkTimeFormat } = useGetTimeFormat({})

  const getIndexItems = useMemo(
    () =>
      elkIndices?.data?.map(item => ({
        label: item,
        value: item
      })) ?? [],
    [elkIndices?.data]
  )

  const getTimeFormatItems = useMemo(
    () =>
      elkTimeFormat?.data?.map(item => ({
        label: item,
        value: item
      })) ?? [],
    [elkTimeFormat?.data]
  )

  const handleSelectChange = useCallback(() => {
    /* istanbul ignore else */ if (formikProps?.values?.logIndexes) {
      onChange(MapElkToServiceFieldNames.IS_STALE_RECORD, true)
    }
  }, [formikProps?.values?.logIndexes, onChange])

  return (
    <Container className={css.main}>
      <FormInput.Text
        label={getString('cv.monitoringSources.queryNameLabel')}
        name={MapElkToServiceFieldNames.METRIC_NAME}
      />

      <MultiTextOrSelectInput
        allowedTypes={
          isConnectorRuntimeOrExpression
            ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
            : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
        }
        label={getString('cv.monitoringSources.elk.logIndexesInputLabel')}
        applicationError={(formikProps?.errors?.logIndexes ? formikProps.errors.logIndexes : '') as string | string[]}
        connectorIdentifier={connectorIdentifier}
        formikAppDynamicsValue={logIndexes}
        appdMultiType={logIdxMultitype}
        setAppdMultiType={setLogIdxMultitype}
        isTemplate={isTemplate}
        expressions={expressions}
        name={MapElkToServiceFieldNames.LOG_INDEXES}
        placeholder={indicesLoading ? getString('loading') : getString('cv.monitoringSources.elk.selectLogIndex')}
        setFieldValue={formikProps.setFieldValue}
        options={getIndexItems}
        handleSelectChange={handleSelectChange}
        value={logIndexes ? { label: logIndexes, value: logIndexes } : undefined}
      />

      <InputWithDynamicModalForJsonMultiType
        onChange={onChange}
        fieldValue={serviceInstance}
        isQueryExecuted={isQueryExecuted}
        isDisabled={isAddingIdentifiersDisabled}
        sampleRecord={sampleRecord}
        inputName={MapElkToServiceFieldNames.SERVICE_INSTANCE}
        dataTooltipId={'GCOLogsServiceInstance'}
        isMultiType={Boolean(isTemplate)}
        expressions={expressions}
        allowableTypes={
          isConnectorRuntimeOrExpression
            ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
            : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
        }
        inputLabel={getString('cv.monitoringSources.gcoLogs.serviceInstance')}
        noRecordModalHeader={getString('cv.monitoringSources.gcoLogs.newGCOLogsServiceInstance')}
        noRecordInputLabel={getString('cv.monitoringSources.gcoLogs.gcoLogsServiceInstance')}
        recordsModalHeader={getString('cv.monitoringSources.gcoLogs.selectPathForServiceInstance')}
      />

      <InputWithDynamicModalForJsonMultiType
        onChange={onChange}
        fieldValue={identifyTimestamp}
        isDisabled={isAddingIdentifiersDisabled}
        isQueryExecuted={isQueryExecuted}
        sampleRecord={sampleRecord}
        inputName={MapElkToServiceFieldNames.IDENTIFY_TIMESTAMP}
        dataTooltipId={'GCOLogsMessageIdentifier'}
        isMultiType={Boolean(isTemplate)}
        expressions={expressions}
        allowableTypes={
          isConnectorRuntimeOrExpression
            ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
            : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
        }
        inputLabel={getString('cv.monitoringSources.elk.identifyTimeStampinputLabel')}
        noRecordModalHeader={getString('cv.monitoringSources.elk.identifyTimeStampnoRecordModalHeader')}
        noRecordInputLabel={getString('cv.monitoringSources.elk.identifyTimeStampnoRecordInputLabel')}
        recordsModalHeader={getString('cv.monitoringSources.elk.identifyTimeStamprecordsModalHeader')}
      />

      <MultiTextOrSelectInput
        setFieldValue={formikProps.setFieldValue}
        allowedTypes={
          isConnectorRuntimeOrExpression
            ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
            : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
        }
        label={getString('cv.monitoringSources.elk.timeStampFormatInputLabel')}
        options={getTimeFormatItems}
        applicationError={
          (formikProps?.errors?.timeStampFormat ? formikProps.errors.timeStampFormat : '') as string | string[]
        }
        connectorIdentifier={connectorIdentifier}
        formikAppDynamicsValue={timeStampFormat}
        appdMultiType={timeStampMultitype}
        setAppdMultiType={setTimeStampIdxMultitype}
        isTemplate={isTemplate}
        expressions={expressions}
        name={MapElkToServiceFieldNames.TIMESTAMP_FORMAT}
        placeholder={getString('cv.monitoringSources.elk.selectTimeStampFormat')}
        handleSelectChange={handleSelectChange}
      />

      <InputWithDynamicModalForJsonMultiType
        onChange={onChange}
        fieldValue={messageIdentifier}
        isDisabled={isAddingIdentifiersDisabled}
        isQueryExecuted={isQueryExecuted}
        sampleRecord={sampleRecord}
        inputName={MapElkToServiceFieldNames.MESSAGE_IDENTIFIER}
        dataTooltipId={'GCOLogsMessageIdentifier'}
        isMultiType={Boolean(isTemplate)}
        expressions={expressions}
        allowableTypes={
          isConnectorRuntimeOrExpression
            ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
            : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
        }
        inputLabel={getString('cv.monitoringSources.gcoLogs.messageIdentifier')}
        noRecordModalHeader={getString('cv.monitoringSources.gcoLogs.newGCOLogsMessageIdentifier')}
        noRecordInputLabel={getString('cv.monitoringSources.gcoLogs.gcoLogsMessageIdentifer')}
        recordsModalHeader={getString('cv.monitoringSources.gcoLogs.selectPathForMessageIdentifier')}
      />
    </Container>
  )
}
