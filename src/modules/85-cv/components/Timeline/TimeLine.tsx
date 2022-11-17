/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Container } from '@harness/uicore'
import {
  calculateStartAndEndTimes,
  getDimensionsAsPerContainerWidth,
  getTimeFormat,
  getTimestampsForPeriodWithoutRiskData,
  limitMaxSliderWidth
} from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.utils'
import {
  DEFAULT_MAX_SLIDER_WIDTH,
  DEFAULT_MIN_SLIDER_WIDTH
} from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.constants'
import AnomaliesCard from '@cv/pages/monitored-service/components/ServiceHealth/components/AnomaliesCard/AnomaliesCard'
import ChangeTimeline from '../ChangeTimeline/ChangeTimeline'
import type { ChangesInfoCardData } from '../ChangeTimeline/ChangeTimeline.types'
import TimelineSlider from '../ChangeTimeline/components/TimelineSlider/TimelineSlider'
import type { TimelineProps } from './TimeLine.types'
import css from '../../pages/monitored-service/components/ServiceHealth/ServiceHealth.module.scss'

export const TimeLine = ({
  serviceIdentifier,
  environmentIdentifier,
  selectedTimePeriod,
  timestamps,
  setTimestamps,
  timeRange,
  setTimeRange,
  showTimelineSlider,
  setShowTimelineSlider,
  changeCategories,
  changeSourceTypes,
  resetFilter
}: TimelineProps): JSX.Element => {
  const [changeTimelineSummary, setChangeTimelineSummary] = useState<ChangesInfoCardData[] | null>(null)
  const containerRef = useRef<HTMLElement>(null)

  const resetSlider = useCallback(() => {
    setTimeRange({ startTime: 0, endTime: 0 })
    setShowTimelineSlider(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (showTimelineSlider) {
      setShowTimelineSlider(false)
    }
  }, [resetFilter])

  useEffect(() => {
    //changing timeperiod in dropdown should reset the timerange and remove the slider.
    if (showTimelineSlider) {
      resetSlider()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimePeriod?.value])

  // calculating the min and max width for the the timeline slider
  const sliderDimensions = useMemo(() => {
    // This is temporary change , will be removed once BE fix is done.
    const defaultMaxSliderWidth = limitMaxSliderWidth(selectedTimePeriod?.value as string)
      ? DEFAULT_MIN_SLIDER_WIDTH
      : DEFAULT_MAX_SLIDER_WIDTH

    return getDimensionsAsPerContainerWidth(
      defaultMaxSliderWidth,
      selectedTimePeriod,
      containerRef?.current?.offsetWidth
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef?.current, selectedTimePeriod?.value])

  const timeFormat = useMemo(() => {
    return getTimeFormat(selectedTimePeriod?.value as string)
  }, [selectedTimePeriod?.value])

  useEffect(() => {
    // getTimestampsForPeriod(healthScoreData)
    setTimestamps(getTimestampsForPeriodWithoutRiskData(selectedTimePeriod.value as string))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimePeriod])

  const onFocusTimeRange = useCallback((startTime: number, endTime: number) => {
    setTimeRange({ startTime, endTime })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSliderDragEnd = useCallback(
    ({ startXPercentage, endXPercentage }) => {
      if (!showTimelineSlider) {
        setShowTimelineSlider(true)
      }
      const startAndEndtime = calculateStartAndEndTimes(startXPercentage, endXPercentage, timestamps)
      if (startAndEndtime) {
        onFocusTimeRange?.(startAndEndtime[0], startAndEndtime[1])
      }
    },
    [onFocusTimeRange, timestamps]
  )

  const renderInfoCard = useCallback(() => {
    return (
      <AnomaliesCard
        changeTimelineSummary={changeTimelineSummary || []}
        timeFormat={timeFormat}
        timeRange={timeRange}
        monitoredServiceIdentifier={''}
      />
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFormat, changeTimelineSummary, timeRange])

  return (
    <>
      <Container
        onClick={() => {
          if (!showTimelineSlider) {
            setShowTimelineSlider(true)
          }
        }}
        height={150}
        className={css.main}
        data-testid={'TimelineChartContainer'}
        ref={containerRef}
      >
        <TimelineSlider
          resetFocus={resetSlider}
          initialSliderWidth={sliderDimensions.minWidth}
          leftContainerOffset={90}
          hideSlider={!showTimelineSlider}
          className={css.slider}
          minSliderWidth={sliderDimensions.minWidth}
          maxSliderWidth={sliderDimensions.maxWidth}
          infoCard={renderInfoCard()}
          onSliderDragEnd={onSliderDragEnd}
        />
        <ChangeTimeline
          serviceIdentifier={serviceIdentifier}
          environmentIdentifier={environmentIdentifier}
          timeFormat={timeFormat}
          startTime={timeRange?.startTime as number}
          endTime={timeRange?.endTime as number}
          selectedTimePeriod={selectedTimePeriod}
          changeCategories={changeCategories}
          changeSourceTypes={changeSourceTypes}
          onSliderMoved={setChangeTimelineSummary}
        />
      </Container>
    </>
  )
}
