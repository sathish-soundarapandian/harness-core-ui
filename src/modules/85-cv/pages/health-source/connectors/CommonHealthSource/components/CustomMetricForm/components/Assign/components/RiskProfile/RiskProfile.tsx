/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { useGetRiskCategoryForCustomHealthMetric } from 'services/cv'
import CustomMetricsSectionHeader from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CustomMetricsSectionHeader'
import type {
  AssignSectionType,
  HealthSourceConfig
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import type { RecordProps } from '../../../CommonCustomMetricFormContainer/CommonCustomMetricFormContainerLayout/CommonCustomMetricFormContainer.types'
import RiskProfileCategeory from './components/RiskProfileCategeory/RiskProfileCategeory'
import Deviation from './components/Deviation/Deviation'
import ServiceInstance from './components/ServiceInstance/ServiceInstance'
import css from './RiskProfile.module.scss'

interface RiskProfileProps {
  riskProfileResponse?: ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>
  continuousVerificationEnabled?: boolean
  serviceInstanceField?: string
  riskCategory?: string
  defaultServiceInstance?: string
  healthSourceConfig: HealthSourceConfig
  recordProps: RecordProps
}

export function RiskProfile(props: RiskProfileProps): JSX.Element {
  const {
    continuousVerificationEnabled,
    serviceInstanceField,
    riskCategory,
    riskProfileResponse,
    defaultServiceInstance,
    healthSourceConfig,
    recordProps
  } = props
  const { getString } = useStrings()

  const { customMetrics } = healthSourceConfig

  const { assign } = customMetrics as NonNullable<HealthSourceConfig['customMetrics']>

  const { serviceInstance: serviceInstanceConfig } = assign as NonNullable<AssignSectionType>

  return (
    <>
      <CustomMetricsSectionHeader
        sectionTitle={getString('cv.monitoringSources.riskProfile')}
        sectionSubTitle={getString('cv.monitoringSources.commonHealthSource.assign.riskProfileSubHeader')}
      />
      <Layout.Vertical className={css.main}>
        <RiskProfileCategeory riskCategory={riskCategory} riskProfileResponse={riskProfileResponse} />
        <Deviation />
        <ServiceInstance
          serviceInstanceConfig={serviceInstanceConfig}
          serviceInstanceField={serviceInstanceField}
          defaultServiceInstance={defaultServiceInstance}
          continuousVerificationEnabled={continuousVerificationEnabled}
          recordProps={recordProps}
        />
      </Layout.Vertical>
    </>
  )
}
