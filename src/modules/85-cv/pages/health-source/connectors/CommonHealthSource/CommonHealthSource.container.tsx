/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useCallback } from 'react'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import CommonHealthSource from './CommonHealthSource'
import { createHealthSourceData, createHealthSourcePayload } from './CommonHealthSource.utils'

interface CommonHealthSourceContainer {
  data: any
  onSubmit: (formdata: any, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
  isTemplate?: boolean
  expressions?: string[]
}

export default function CommonHealthSourceContainer(props: CommonHealthSourceContainer): JSX.Element {
  const { data: sourceData, onSubmit, isTemplate, expressions } = props
  const { onPrevious } = useContext(SetupSourceTabsContext)

  const isMetricThresholdEnabled = useFeatureFlag(FeatureFlag.CVNG_METRIC_THRESHOLD) && !isTemplate

  const handleSubmit = useCallback(
    async (value: UpdatedHealthSource) => {
      const healthSourcePayload = createHealthSourcePayload(value, isMetricThresholdEnabled)
      healthSourcePayload && (await onSubmit(sourceData, healthSourcePayload))
    },
    [sourceData]
  )

  return (
    <CommonHealthSource
      // TODO - will be a common method to create the initial data for the form.
      data={createHealthSourceData(sourceData)}
      onSubmit={handleSubmit}
      onPrevious={() => onPrevious(sourceData)}
      isTemplate={isTemplate}
      expressions={expressions}
    />
  )
}
