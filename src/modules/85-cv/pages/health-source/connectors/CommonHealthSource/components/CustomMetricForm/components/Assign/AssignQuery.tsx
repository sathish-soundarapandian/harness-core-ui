/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Container } from '@harness/uicore'
import type {
  AssignSectionType,
  HealthSourceConfig
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { RiskProfile } from './components/RiskProfile/RiskProfile'
import type { AssignQueryProps } from './AssignQuery.types'
import AssignSection from './components/AssignSection/AssignSection'
import css from './AssignQuery.module.scss'

export default function AssignQuery({
  values,
  showOnlySLI = false,
  riskProfileResponse,
  healthSourceConfig,
  recordProps
}: AssignQueryProps): JSX.Element {
  const { continuousVerification, healthScore, serviceInstanceField, riskCategory } = values

  const { customMetrics } = healthSourceConfig
  const assign = (customMetrics as NonNullable<HealthSourceConfig['customMetrics']>)
    .assign as NonNullable<AssignSectionType>

  const { hideCV, hideSLIAndHealthScore, defaultServiceInstance, hideServiceIdentifier = false } = assign

  return (
    <Container className={css.main}>
      <AssignSection hideCV={hideCV} showOnlySLI={showOnlySLI} hideSLIAndHealthScore={hideSLIAndHealthScore} />
      {(continuousVerification || healthScore) && (
        <Card className={css.riskProfile}>
          <RiskProfile
            healthSourceConfig={healthSourceConfig}
            continuousVerificationEnabled={continuousVerification && !hideServiceIdentifier}
            serviceInstanceField={
              typeof serviceInstanceField === 'string' ? serviceInstanceField : (serviceInstanceField?.value as string)
            }
            riskCategory={riskCategory}
            riskProfileResponse={riskProfileResponse}
            defaultServiceInstance={defaultServiceInstance}
            recordProps={recordProps}
          />
        </Card>
      )}
    </Container>
  )
}
