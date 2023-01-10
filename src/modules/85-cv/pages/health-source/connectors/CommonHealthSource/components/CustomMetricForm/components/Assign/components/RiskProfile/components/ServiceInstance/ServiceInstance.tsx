/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext } from 'react'
import { Container, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useStrings } from 'framework/strings'
import { useCommonHealthSource } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/useCommonHealthSource'
import CustomMetricsSectionHeader from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CustomMetricsSectionHeader'
import { ServiceInstanceLabel } from '@cv/pages/health-source/common/ServiceInstanceLabel/ServiceInstanceLabel'
import { CustomMetricFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { getIsConnectorRuntimeOrExpression } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
interface ServiceInstanceProps {
  serviceInstance?: string
  continuousVerificationEnabled?: boolean
}

export default function ServiceInstance({
  serviceInstance,
  continuousVerificationEnabled
}: ServiceInstanceProps): JSX.Element {
  const { getString } = useStrings()
  const { isQueryRuntimeOrExpression } = useCommonHealthSource()
  const { isTemplate, expressions, sourceData } = useContext(SetupSourceTabsContext)
  const isConnectorRuntimeOrExpression = getIsConnectorRuntimeOrExpression(sourceData.connectorRef)

  return (
    <Container>
      {continuousVerificationEnabled ? (
        <>
          <CustomMetricsSectionHeader
            sectionTitle={getString('cv.monitoringSources.commonHealthSource.assign.serviceInstance.title')}
            sectionSubTitle={getString('cv.monitoringSources.commonHealthSource.assign.serviceInstance.helptext')}
          />
          {isTemplate ? (
            <Container width="350px">
              <FormInput.MultiTextInput
                label={<ServiceInstanceLabel />}
                name={CustomMetricFormFieldNames.SERVICE_INSTANCE}
                multiTextInputProps={{
                  value: serviceInstance,
                  expressions,
                  multitypeInputValue:
                    (isConnectorRuntimeOrExpression || isQueryRuntimeOrExpression) && !serviceInstance
                      ? MultiTypeInputType.EXPRESSION
                      : getMultiTypeFromValue(serviceInstance),
                  allowableTypes:
                    isConnectorRuntimeOrExpression || isQueryRuntimeOrExpression
                      ? [MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
                      : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                }}
              />
            </Container>
          ) : (
            <Container width="350px">
              <FormInput.Text name={CustomMetricFormFieldNames.SERVICE_INSTANCE} label={<ServiceInstanceLabel />} />
            </Container>
          )}
        </>
      ) : null}
    </Container>
  )
}
