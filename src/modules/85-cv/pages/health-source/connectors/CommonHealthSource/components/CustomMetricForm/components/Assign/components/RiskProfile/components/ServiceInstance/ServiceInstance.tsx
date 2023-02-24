/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import { Container, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useStrings } from 'framework/strings'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { useCommonHealthSource } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/useCommonHealthSource'
import CustomMetricsSectionHeader from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CustomMetricsSectionHeader'
import { ServiceInstanceLabel } from '@cv/pages/health-source/common/ServiceInstanceLabel/ServiceInstanceLabel'
import { CustomMetricFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { getIsConnectorRuntimeOrExpression } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
import { getTypeOfInput } from '@cv/utils/CommonUtils'

interface ServiceInstanceProps {
  serviceInstanceField?: string
  defaultServiceInstance?: string
  continuousVerificationEnabled?: boolean
}

export default function ServiceInstance({
  serviceInstanceField,
  defaultServiceInstance,
  continuousVerificationEnabled
}: ServiceInstanceProps): JSX.Element {
  const { getString } = useStrings()
  const { isQueryRuntimeOrExpression } = useCommonHealthSource()
  const { setFieldValue } = useFormikContext<CommonCustomMetricFormikInterface>()
  const { isTemplate, expressions, sourceData } = useContext(SetupSourceTabsContext)
  const isConnectorRuntimeOrExpression = getIsConnectorRuntimeOrExpression(sourceData.connectorRef)

  const [metricInstanceMultiType, setMetricPathMultiType] = useState<MultiTypeInputType>(() =>
    getMultiTypeFromValue(serviceInstanceField)
  )

  useEffect(() => {
    if (isTemplate && serviceInstanceField && metricInstanceMultiType === MultiTypeInputType.FIXED) {
      setMetricPathMultiType(getTypeOfInput(serviceInstanceField))
    }
  }, [serviceInstanceField])

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
                onChange={(value, _valueType, multiType) => {
                  if (multiType !== metricInstanceMultiType) {
                    setMetricPathMultiType(multiType)
                    if (!value && multiType === MultiTypeInputType.FIXED) {
                      setFieldValue(CustomMetricFormFieldNames.SERVICE_INSTANCE, defaultServiceInstance)
                    }
                  }
                  const isServiceInstanceFixed = getMultiTypeFromValue(value) === MultiTypeInputType.FIXED
                  if (multiType === MultiTypeInputType.EXPRESSION && isServiceInstanceFixed) {
                    setFieldValue(CustomMetricFormFieldNames.SERVICE_INSTANCE, undefined)
                  }
                }}
                multiTextInputProps={{
                  value: serviceInstanceField,
                  expressions,
                  multitypeInputValue: metricInstanceMultiType,
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
