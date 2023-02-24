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
import type { RatioSLIMetricSpec } from 'services/cv'
import { SLIEventTypes } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import type { ThresholdLegend, RatioLegend } from './SLIMetricChartLegend.types'
import css from './SLIMetricChart.module.scss'

interface LegendConfig {
  label: string
  value: string
  icon?: IconName
  color?: string
}

export const SLIMetricChartLegend = ({
  hasMultipleMetric,
  legendData,
  eventType
}: {
  hasMultipleMetric: boolean
  legendData: ThresholdLegend | RatioLegend
  eventType?: RatioSLIMetricSpec['eventType']
}): JSX.Element => {
  const { getString } = useStrings()
  let legendElement = undefined
  let legendConfig: LegendConfig[] = []
  if (hasMultipleMetric) {
    legendConfig = [
      {
        label: eventType === SLIEventTypes.GOOD ? getString('cv.slos.goodRequests') : getString('cv.slos.badRequests'),
        value: (legendData as RatioLegend).goodMetric.toFixed(1),
        icon: 'symbol-square' as IconName,
        color: Color.MAGENTA_700
      },
      {
        label: getString('cv.slos.validRequests'),
        value: (legendData as RatioLegend).validMetric.toFixed(1),
        icon: 'symbol-square' as IconName,
        color: Color.GREEN_700
      }
    ]
  } else {
    legendConfig = [
      { label: getString('cv.minimum'), value: (legendData as ThresholdLegend).max.toFixed(1) },
      {
        label: getString('ce.perspectives.nodeDetails.aggregation.maximum'),
        value: (legendData as ThresholdLegend).min.toFixed(1)
      },
      {
        label: getString('ce.perspectives.nodeDetails.aggregation.average'),
        value: (legendData as ThresholdLegend).avg.toFixed(1)
      }
    ]
  }

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
          {legendObject.value}s
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
