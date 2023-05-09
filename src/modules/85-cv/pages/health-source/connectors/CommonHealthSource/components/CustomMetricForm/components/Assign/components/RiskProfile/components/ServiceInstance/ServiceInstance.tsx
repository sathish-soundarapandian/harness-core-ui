/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useState } from 'react'
import { Container, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useStrings } from 'framework/strings'
import type { AssignSectionType } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import CustomMetricsSectionHeader from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CustomMetricsSectionHeader'
import { FIELD_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { getTypeOfInput } from '@cv/utils/CommonUtils'
import type { RecordProps } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonCustomMetricFormContainer/CommonCustomMetricFormContainerLayout/CommonCustomMetricFormContainer.types'
import { ServiceInstanceTextInput } from './components/ServiceInstanceTextInput'
import { ServiceInstanceJSONSelector } from './components/ServiceInstanceJSONSelector'

export interface ServiceInstanceProps {
  serviceInstanceField?: string
  defaultServiceInstance?: string
  continuousVerificationEnabled?: boolean
  serviceInstanceConfig?: AssignSectionType['serviceInstance']
  recordProps: RecordProps
}

export default function ServiceInstance({
  serviceInstanceField,
  defaultServiceInstance,
  continuousVerificationEnabled,
  serviceInstanceConfig,
  recordProps
}: ServiceInstanceProps): JSX.Element | null {
  const { getString } = useStrings()

  const { isTemplate } = useContext(SetupSourceTabsContext)

  const [metricInstanceMultiType, setMetricPathMultiType] = useState<MultiTypeInputType>(() =>
    getMultiTypeFromValue(serviceInstanceField)
  )

  /**
   * 💁‍♂️ RULES TO RENDER SERVICE INSTANCE FIELD AS TEXTINPUT
   *
   * 1. serviceInstanceConfig is not present (OR)
   * 2. serviceInstanceConfig is Invalid (OR)
   * 3. serviceInstanceConfig should have "type" as "TextInput"
   *
   */
  const isServiceInstanceTextField =
    !serviceInstanceConfig ||
    !Array.isArray(serviceInstanceConfig) ||
    serviceInstanceConfig[0].type === FIELD_ENUM.TEXT_INPUT

  useEffect(() => {
    if (isTemplate && serviceInstanceField && metricInstanceMultiType === MultiTypeInputType.FIXED) {
      setMetricPathMultiType(getTypeOfInput(serviceInstanceField))
    }
  }, [serviceInstanceField])

  if (!continuousVerificationEnabled) {
    return null
  }

  const getContent = (): JSX.Element => {
    if (isServiceInstanceTextField) {
      return (
        <ServiceInstanceTextInput
          defaultServiceInstance={defaultServiceInstance}
          serviceInstanceField={serviceInstanceField}
        />
      )
    } else {
      return <ServiceInstanceJSONSelector serviceInstanceConfig={serviceInstanceConfig} recordProps={recordProps} />
    }
  }

  return (
    <Container>
      <>
        <CustomMetricsSectionHeader
          sectionTitle={getString('cv.monitoringSources.commonHealthSource.assign.serviceInstance.title')}
          sectionSubTitle={getString('cv.monitoringSources.commonHealthSource.assign.serviceInstance.helptext')}
        />

        <Container width="350px">{getContent()}</Container>
      </>
    </Container>
  )
}
