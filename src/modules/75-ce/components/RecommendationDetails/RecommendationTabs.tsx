/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import { RecommendationType } from './constants'

import css from './RecommendationDetails.module.scss'

interface RecommendationTabsProps {
  selectedRecommendation: RecommendationType
  setSelectedRecommendation: (newState: RecommendationType) => void
  setCPUReqVal: React.Dispatch<React.SetStateAction<number>>
  setMemReqVal: React.Dispatch<React.SetStateAction<number>>
  setMemLimitVal?: React.Dispatch<React.SetStateAction<number>>
  costOptimizedSavings?: number
  performanceOptimizedSavings?: number
  currentSavings?: number
  isPerfOptimizedCustomized?: boolean
  isCostOptimizedCustomized?: boolean
}

const RecommendationTabs: React.FC<RecommendationTabsProps> = ({
  selectedRecommendation,
  setSelectedRecommendation,
  setCPUReqVal,
  setMemReqVal,
  setMemLimitVal
}) => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  return (
    <Container padding="small" className={css.recommendationTypeContainer}>
      <Layout.Horizontal className={css.recommendations}>
        <Layout.Horizontal
          className={cx(css.recommendationTypeText, {
            [css.selectedTab]: selectedRecommendation === RecommendationType.CostOptimized
          })}
          spacing="xsmall"
          onClick={() => {
            trackEvent(USER_JOURNEY_EVENTS.RECOMMENDATION_COST_PERFORMANCE_OPTIMISED_CLICK, {
              type: RecommendationType.CostOptimized
            })
            setCPUReqVal(50)
            setMemReqVal(50)
            setMemLimitVal?.(95)
            setSelectedRecommendation(RecommendationType.CostOptimized)
          }}
        >
          <Text
            font={{ variation: FontVariation.SMALL_BOLD, align: 'center' }}
            color={selectedRecommendation === RecommendationType.CostOptimized ? Color.WHITE : Color.PRIMARY_9}
            className={cx({ [css.selectedTab]: selectedRecommendation === RecommendationType.CostOptimized })}
            tooltipProps={{ dataTooltipId: 'costOptimized' }}
          >
            {getString('ce.recommendation.detailsPage.costOptimized')}
          </Text>
        </Layout.Horizontal>

        <Layout.Horizontal
          className={cx(css.recommendationTypeText, {
            [css.selectedTab]: selectedRecommendation === RecommendationType.PerformanceOptimized
          })}
          color={selectedRecommendation === RecommendationType.PerformanceOptimized ? Color.WHITE : Color.PRIMARY_9}
          spacing="xsmall"
          onClick={() => {
            trackEvent(USER_JOURNEY_EVENTS.RECOMMENDATION_COST_PERFORMANCE_OPTIMISED_CLICK, {
              type: RecommendationType.PerformanceOptimized
            })
            setCPUReqVal(95)
            setMemReqVal(95)
            setMemLimitVal?.(95)
            setSelectedRecommendation(RecommendationType.PerformanceOptimized)
          }}
        >
          <Text
            font={{ variation: FontVariation.SMALL_BOLD, align: 'center' }}
            color={selectedRecommendation === RecommendationType.PerformanceOptimized ? Color.WHITE : Color.PRIMARY_9}
            className={cx({ [css.selectedTab]: selectedRecommendation === RecommendationType.PerformanceOptimized })}
            tooltipProps={{ dataTooltipId: 'performanceOptimized' }}
          >
            {getString('ce.recommendation.detailsPage.performanceOptimized')}
          </Text>
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

export default RecommendationTabs
