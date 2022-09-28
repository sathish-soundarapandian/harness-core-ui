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
import type { MapPrometheusQueryToService } from '@cv/pages/health-source/connectors/PrometheusHealthSource/PrometheusHealthSource.constants'
import { PrometheusMetricThresholdContext } from '../PrometheusMetricThresholdConstants'

export default function IgnoreThresholdContent(): JSX.Element {
  const { values: formValues } = useFormikContext<MapPrometheusQueryToService>()

  const { groupedCreatedMetrics, setMetricThresholds } = useContext(PrometheusMetricThresholdContext)

  useEffect(() => {
    /* istanbul ignore next */
    setMetricThresholds(previousValues => {
      return updateThresholdState(previousValues, {
        ignoreThresholds: formValues.ignoreThresholds
      })
    })
  }, [formValues.ignoreThresholds, setMetricThresholds])

  return (
    <IgnoreThresholdsFieldArray
      formValues={formValues}
      groupedCreatedMetrics={groupedCreatedMetrics}
      isOnlyCustomMetricHealthSource
    />
  )
}
