/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, FormInput, MultiTypeInputType, Utils } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { InputWithDynamicModalForJson } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJson'

import { MapElkToServiceFieldNames } from '../../constants'
import type { MapElkQueriesToServiceProps } from './types'
import css from './ElkMetricNameAndHostIdentifier.module.scss'
import { useGetELKIndices } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useParams } from 'react-router'
import { InputWithDynamicModalForJsonMultiType } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJsonMultiType'
import { MapGCPLogsToServiceFieldNames } from '@cv/pages/health-source/connectors/GCOLogsMonitoringSource/components/MapQueriesToHarnessService/constants'

export function ElkMetricNameAndHostIdentifier(props: MapElkQueriesToServiceProps): JSX.Element {
  const {
    onChange,
    sampleRecord,
    isQueryExecuted,
    loading,
    serviceInstance,
    messageIdentifier,
    isConnectorRuntimeOrExpression,
    isTemplate,
    expressions,
    connectorIdentifier
  } = props

  console.log('pppppppp', props)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const isAddingIdentifiersDisabled = !isQueryExecuted || loading

  const { data: elkIndices } = useGetELKIndices({
    queryParams: { projectIdentifier, orgIdentifier, accountId, connectorIdentifier, tracingId: '' }
  })
  // .map(val => {label: val, value: val})

  return (
    <Container className={css.main}>
      <FormInput.Text
        label={getString('cv.monitoringSources.queryNameLabel')}
        name={MapElkToServiceFieldNames.METRIC_NAME}
      />

      <FormInput.Select
        label="Log Indexes"
        name={MapElkToServiceFieldNames.LOG_INDEXES}
        placeholder="Select Log Index"
        items={elkIndices || []}
      />

      <InputWithDynamicModalForJsonMultiType
        onChange={onChange}
        fieldValue={serviceInstance}
        isQueryExecuted={isQueryExecuted}
        isDisabled={isAddingIdentifiersDisabled}
        sampleRecord={sampleRecord}
        inputName={MapGCPLogsToServiceFieldNames.SERVICE_INSTANCE}
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
        fieldValue={messageIdentifier}
        isDisabled={isAddingIdentifiersDisabled}
        isQueryExecuted={isQueryExecuted}
        sampleRecord={sampleRecord}
        inputName={MapGCPLogsToServiceFieldNames.IDENTIFY_TIMESTAMP}
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

      {/* {isTemplate ? (
        <FormInput.MultiTextInput
          name={MapElkToServiceFieldNames.SERVICE_INSTANCE}
          label={getString('cv.monitoringSources.gcoLogs.serviceInstance')}
          multiTextInputProps={{
            expressions,
            allowableTypes: isConnectorRuntimeOrExpression
              ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
              : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
            onChange(value) {
              onChange(MapElkToServiceFieldNames.SERVICE_INSTANCE, value as string)
            }
          }}
        />
      ) : (
        <InputWithDynamicModalForJson
          onChange={onChange}
          fieldValue={serviceInstance}
          isQueryExecuted={isQueryExecuted}
          isDisabled={isAddingIdentifiersDisabled}
          sampleRecord={sampleRecord}
          inputName={MapElkToServiceFieldNames.SERVICE_INSTANCE}
          inputLabel={getString('cv.monitoringSources.gcoLogs.serviceInstance')}
          noRecordModalHeader={getString('cv.monitoringSources.gcoLogs.newGCOLogsServiceInstance')}
          noRecordInputLabel={getString('cv.monitoringSources.gcoLogs.gcoLogsServiceInstance')}
          recordsModalHeader={getString('cv.monitoringSources.gcoLogs.selectPathForServiceInstance')}
        />
      )} */}
      <FormInput.Text label="Message" name={MapElkToServiceFieldNames.MESSAGE} />
    </Container>
  )
}
