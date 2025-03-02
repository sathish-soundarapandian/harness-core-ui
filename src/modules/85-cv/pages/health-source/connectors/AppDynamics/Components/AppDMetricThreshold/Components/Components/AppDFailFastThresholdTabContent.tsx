/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect } from 'react'
import { Container, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type {
  AppDynamicsFomikFormInterface,
  NonCustomFeildsInterface
} from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import FailFastThresholdsFieldArray from '@cv/pages/health-source/common/MetricThresholds/Components/FailFastThresholdsFieldArray'
import { AppDMetricThresholdContext } from '../../AppDMetricThresholdConstants'

export default function AppDFailFastThresholdTabContent(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { metricPacks, groupedCreatedMetrics, setNonCustomFeilds } = useContext(AppDMetricThresholdContext)

  useEffect(() => {
    setNonCustomFeilds((oldValues: NonCustomFeildsInterface) => ({
      ...oldValues,
      failFastThresholds: formValues.failFastThresholds
    }))
  }, [formValues.failFastThresholds, setNonCustomFeilds])

  return (
    <Container margin={{ top: 'large' }}>
      <Text color={Color.BLACK}>{getString('cv.monitoringSources.appD.failFastThresholdHint')}</Text>

      <Container>
        <FailFastThresholdsFieldArray<AppDynamicsFomikFormInterface>
          formValues={formValues}
          groupedCreatedMetrics={groupedCreatedMetrics}
          metricPacks={metricPacks}
        />
      </Container>
    </Container>
  )
}
