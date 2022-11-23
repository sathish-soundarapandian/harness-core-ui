/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './ServiceInstanceLabel.module.scss'

export function ServiceInstanceLabel(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={css.main}>
      <Text className={css.primaryLabel}>{`${getString('cv.monitoringSources.serviceInstanceIdentifier')}`}</Text>
      <Text
        className={css.secondaryLabel}
        tooltipProps={{ dataTooltipId: 'healthSourceMetricsServiceInstanceId' }}
      >{`${getString('cv.monitoringSources.optionalServiceInstanceLabel')}`}</Text>
    </Container>
  )
}
