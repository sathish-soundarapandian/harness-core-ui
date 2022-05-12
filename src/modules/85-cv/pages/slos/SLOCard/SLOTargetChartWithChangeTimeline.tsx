/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { Container } from '@harness/uicore'
import ChangeTimeline from '@cv/components/ChangeTimeline/ChangeTimeline'
import type { ChangesInfoCardData } from '@cv/components/ChangeTimeline/ChangeTimeline.types'
import TimelineSlider from '@cv/components/ChangeTimeline/components/TimelineSlider/TimelineSlider'
import AnomaliesCard from '@cv/pages/monitored-service/components/ServiceHealth/components/AnomaliesCard/AnomaliesCard'
import { calculateStartAndEndTimes } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.utils'
import { SLOTargetChart } from '../components/SLOTargetChart/SLOTargetChart'
import { getDataPointsWithMinMaxXLimit } from '../components/SLOTargetChart/SLOTargetChart.utils'
import { SLOTargetChartWithChangeTimelineProps, SLOCardToggleViews } from '../CVSLOsListingPage.types'
import { getSLOAndErrorBudgetGraphOptions, getTimeFormatForAnomaliesCard } from '../CVSLOListingPage.utils'
import css from '../CVSLOsListingPage.module.scss'

const SLOTargetChartWithChangeTimeline: React.FC<SLOTargetChartWithChangeTimelineProps> = ({
  type,
  isCardView,
  sliderTimeRange,
  setSliderTimeRange,
  serviceLevelObjective,
  filteredServiceLevelObjective,
  chartTimeRange,
  setChartTimeRange,
  resetSlider,
  showTimelineSlider,
  setShowTimelineSlider,
  setCustomTimeFilter
}) => {
  const {
    sloPerformanceTrend,
    errorBudgetBurndown,
    currentPeriodStartTime,
    monitoredServiceIdentifier,
    serviceIdentifier,
    environmentIdentifier
  } = filteredServiceLevelObjective ?? serviceLevelObjective

  const SLOEndTime = sloPerformanceTrend[sloPerformanceTrend.length - 1]?.timestamp
  const errorBudgetEndTime = errorBudgetBurndown[errorBudgetBurndown.length - 1]?.timestamp
  const _endTime = (type === SLOCardToggleViews.SLO ? SLOEndTime : errorBudgetEndTime) ?? currentPeriodStartTime
  const [changeTimelineSummary, setChangeTimelineSummary] = useState<ChangesInfoCardData[] | null>(null)

  const { startTime = currentPeriodStartTime, endTime = _endTime } = chartTimeRange ?? {}

  const onFocusTimeRange = useCallback(
    (xTimeRange: number, yTimeRange: number) => {
      setSliderTimeRange?.({ startTime: xTimeRange, endTime: yTimeRange })
    },
    [setSliderTimeRange]
  )

  const onSliderDragEnd = useCallback(
    ({ startXPercentage, endXPercentage }) => {
      const startAndEndTime = calculateStartAndEndTimes(startXPercentage, endXPercentage, [startTime, endTime])
      /* istanbul ignore else */ if (startAndEndTime) {
        onFocusTimeRange(startAndEndTime[0], startAndEndTime[1])
      }
    },
    [onFocusTimeRange, startTime, endTime]
  )

  const onZoom = useCallback(() => {
    setCustomTimeFilter(true)
    setChartTimeRange?.(sliderTimeRange)
    resetSlider()
  }, [setCustomTimeFilter, setChartTimeRange, sliderTimeRange, resetSlider])

  const { dataPoints, minXLimit, maxXLimit } = useMemo(
    () => getDataPointsWithMinMaxXLimit(type === SLOCardToggleViews.SLO ? sloPerformanceTrend : errorBudgetBurndown),
    [type, sloPerformanceTrend, errorBudgetBurndown]
  )

  return (
    <Container
      style={{ position: 'relative' }}
      onClick={() => {
        if (!showTimelineSlider) {
          setShowTimelineSlider(true)
        }
      }}
      data-testid="timeline-slider-container"
    >
      <Container padding={{ left: isCardView ? 'huge' : 'none' }}>
        <SLOTargetChart
          dataPoints={dataPoints}
          customChartOptions={getSLOAndErrorBudgetGraphOptions({
            type,
            isCardView,
            startTime,
            endTime,
            minXLimit,
            maxXLimit,
            serviceLevelObjective
          })}
        />
      </Container>
      {isCardView && (
        <TimelineSlider
          minSliderWidth={75}
          maxSliderWidth={300}
          initialSliderWidth={75}
          leftContainerOffset={85}
          resetFocus={resetSlider}
          hideSlider={!showTimelineSlider}
          className={css.timelineSlider}
          infoCard={
            <AnomaliesCard
              showOnlyChanges
              timeFormat={getTimeFormatForAnomaliesCard(sliderTimeRange)}
              timeRange={sliderTimeRange}
              changeTimelineSummary={changeTimelineSummary ?? []}
              monitoredServiceIdentifier={monitoredServiceIdentifier}
              serviceIdentifier={serviceIdentifier}
              environmentIdentifier={environmentIdentifier}
            />
          }
          onSliderDragEnd={onSliderDragEnd}
          onZoom={onZoom}
        />
      )}
      <ChangeTimeline
        selectedTimeRange={{ startTime, endTime }}
        startTime={sliderTimeRange?.startTime}
        endTime={sliderTimeRange?.endTime}
        hideTimeline={!isCardView}
        monitoredServiceIdentifier={monitoredServiceIdentifier}
        onSliderMoved={setChangeTimelineSummary}
      />
    </Container>
  )
}

export default SLOTargetChartWithChangeTimeline
