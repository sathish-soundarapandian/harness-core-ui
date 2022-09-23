/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect } from 'react'
import { useFormikContext } from 'formik'

import IgnoreThresholdsFieldArray from '@cv/pages/health-source/common/MetricThresholds/Components/IgnoreThresholdsFieldArray'
import { updateThresholdState } from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.utils'
import { MetricThresholdContext } from '../MetricThresholds.constants'
import type { DatadogMetricInfo } from '../../../DatadogMetricsHealthSource.type'

export default function IgnoreThresholdContent(): JSX.Element {
  const { values: formValues } = useFormikContext<DatadogMetricInfo>()

  const { groupedCreatedMetrics, setThresholdState } = useContext(MetricThresholdContext)

  useEffect(() => {
    /* istanbul ignore next */
    setThresholdState(previousValues => {
      return updateThresholdState(previousValues, {
        ignoreThresholds: formValues.ignoreThresholds
      })
    })
  }, [formValues.ignoreThresholds, setThresholdState])

  return (
    <IgnoreThresholdsFieldArray
      formValues={formValues}
      groupedCreatedMetrics={groupedCreatedMetrics}
      isOnlyCustomMetricHealthSource
    />
  )
}
