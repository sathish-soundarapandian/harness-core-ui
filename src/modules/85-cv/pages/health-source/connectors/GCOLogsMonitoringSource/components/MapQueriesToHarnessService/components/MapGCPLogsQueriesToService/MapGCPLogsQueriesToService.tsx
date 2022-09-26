/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, FormInput, MultiTypeInputType } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { InputWithDynamicModalForJsonMultiType } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJsonMultiType'
import { MapGCPLogsToServiceFieldNames } from '../../constants'
import type { MapGCPLogsQueriesToServiceProps } from './types'
import css from './MapGCPLogsQueriesToService.module.scss'

export function MapGCPLogsQueriesToService(props: MapGCPLogsQueriesToServiceProps): JSX.Element {
  const {
    onChange,
    sampleRecord,
    isQueryExecuted,
    loading,
    serviceInstance,
    messageIdentifier,
    isTemplate,
    expressions,
    isConnectorRuntimeOrExpression
  } = props
  const { getString } = useStrings()
  const isAddingIdentifiersDisabled = !isQueryExecuted || loading

  return (
    <Container className={css.main}>
      <FormInput.Text
        label={getString('cv.monitoringSources.queryNameLabel')}
        name={MapGCPLogsToServiceFieldNames.METRIC_NAME}
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
        inputName={MapGCPLogsToServiceFieldNames.MESSAGE_IDENTIFIER}
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
