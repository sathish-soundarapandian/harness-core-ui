/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text, Layout, IconName } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ThresholdLegend } from './SLIMetricChartLegend.types'
import css from './SLIMetricChart.module.scss'

interface LegendConfig {
  label: string
  value: string
  icon?: IconName
  color?: string
}

export const SLIMetricChartLegend = ({
  legendData,
  showPercentage = false
}: {
  legendData: ThresholdLegend
  showPercentage?: boolean
}): JSX.Element => {
  const { getString } = useStrings()
  let legendElement = undefined
  const suffix = showPercentage ? '%' : ''

  const { min, max, avg } = legendData as ThresholdLegend

  const legendConfig: LegendConfig[] = [
    { label: getString('cv.minimum'), value: `${min.toFixed(2)} ${suffix}` },
    {
      label: getString('ce.perspectives.nodeDetails.aggregation.maximum'),
      value: `${max.toFixed(2)} ${suffix}`
    },
    {
      label: getString('ce.perspectives.nodeDetails.aggregation.average'),
      value: `${avg.toFixed(2)} ${suffix}`
    }
  ]

  legendElement = legendConfig.map(legendObject => {
    return (
      <Layout.Horizontal spacing={'small'} key={legendObject.label}>
        <Text
          icon={legendObject.icon}
          font={{ variation: FontVariation.SMALL }}
          iconProps={{ color: legendObject.color }}
          color={Color.GREY_300}
        >
          {legendObject.label}:
        </Text>
        <Text inline font={{ variation: FontVariation.FORM_HELP }}>
          {legendObject.value}
        </Text>
      </Layout.Horizontal>
    )
  })

  return (
    <Container>
      <Layout.Horizontal
        width={'fit-content'}
        className={css.sliMetricChart}
        background={Color.PRIMARY_1}
        margin={{ top: 'large' }}
        padding="small"
        spacing="large"
        border={{ radius: 10, width: 0 }}
      >
        {legendElement}
      </Layout.Horizontal>
    </Container>
  )
}
