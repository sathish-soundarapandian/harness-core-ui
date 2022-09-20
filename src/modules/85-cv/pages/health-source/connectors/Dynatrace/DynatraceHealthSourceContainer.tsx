/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useCallback, useMemo } from 'react'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import DynatraceHealthSource from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource'
import type {
  DynatraceHealthSourceContainerProps,
  DynatraceMetricData
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import {
  mapHealthSourceToDynatraceMetricData,
  mapDynatraceMetricDataToHealthSource
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.utils'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'

export default function DynatraceHealthSourceContainer(props: DynatraceHealthSourceContainerProps): JSX.Element {
  const { data: sourceData, onSubmit, isTemplate, expressions } = props
  const { onPrevious } = useContext(SetupSourceTabsContext)

  const isMetricThresholdEnabled = useFeatureFlag(FeatureFlag.CVNG_METRIC_THRESHOLD) && !isTemplate

  const handleSubmit = useCallback(
    async (dynatraceMetric: DynatraceMetricData) => {
      const dynatracePayload = mapDynatraceMetricDataToHealthSource(dynatraceMetric, isMetricThresholdEnabled)
      await onSubmit(sourceData, dynatracePayload)
    },
    [isMetricThresholdEnabled, onSubmit, sourceData]
  )
  const dynatraceMetricData: DynatraceMetricData = useMemo(() => {
    return mapHealthSourceToDynatraceMetricData(sourceData, isMetricThresholdEnabled)
  }, [isMetricThresholdEnabled, sourceData])
  return (
    <DynatraceHealthSource
      dynatraceFormData={dynatraceMetricData}
      onSubmit={handleSubmit}
      onPrevious={() => onPrevious(sourceData)}
      connectorIdentifier={
        (typeof sourceData?.connectorRef === 'string' ? sourceData?.connectorRef : sourceData?.connectorRef?.value) ||
        ''
      }
      isTemplate={isTemplate}
      expressions={expressions}
    />
  )
}
