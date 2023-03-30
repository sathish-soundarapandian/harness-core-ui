/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useCallback, useMemo, useState } from 'react'
import { Button, ButtonVariation, Container } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { getMonitoredServiceIdentifiers } from '@cv/utils/CommonUtils'
import ChangeTimeline from '@cv/components/ChangeTimeline/ChangeTimeline'
import type { ChangesInfoCardData } from '@cv/components/ChangeTimeline/ChangeTimeline.types'
import TimelineSlider from '@cv/components/ChangeTimeline/components/TimelineSlider/TimelineSlider'
import AnomaliesCard from '@cv/pages/monitored-service/components/ServiceHealth/components/AnomaliesCard/AnomaliesCard'
import { calculateStartAndEndTimes } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.utils'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import type { AnnotationMessage } from '@cv/components/ChangeTimeline/components/TimelineRow/components/Annotation/Annotation.types'
import { useGetSecondaryEvents } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import annotationsIcon from '@cv/assets/annotationsDark.svg'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useStrings } from 'framework/strings'
import { SLOTargetChart } from '../components/SLOTargetChart/SLOTargetChart'
import { getDataPointsWithMinMaxXLimit } from '../components/SLOTargetChart/SLOTargetChart.utils'
import { SLOTargetChartWithChangeTimelineProps, SLOCardToggleViews } from '../CVSLOsListingPage.types'
import { getSLOAndErrorBudgetGraphOptions, getTimeFormatForAnomaliesCard } from '../CVSLOListingPage.utils'
import AnnotationDetails from './components/AnnotationDetails/AnnotationDetails'
import { addAnnotationsDrawerOptions } from './SLOCard.constants'
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
  setCustomTimeFilter,
  defaultOffSetPercentage
}) => {
  const {
    sloPerformanceTrend,
    errorBudgetBurndown,
    currentPeriodStartTime,
    monitoredServiceIdentifier,
    monitoredServiceDetails,
    serviceIdentifier,
    environmentIdentifier,
    sloIdentifier
  } = filteredServiceLevelObjective ?? serviceLevelObjective
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const SLOEndTime = sloPerformanceTrend[sloPerformanceTrend.length - 1]?.timestamp
  const errorBudgetEndTime = errorBudgetBurndown[errorBudgetBurndown.length - 1]?.timestamp
  const _endTime = (type === SLOCardToggleViews.SLO ? SLOEndTime : errorBudgetEndTime) ?? currentPeriodStartTime
  const [changeTimelineSummary, setChangeTimelineSummary] = useState<ChangesInfoCardData[] | null>(null)
  const monitoredServiceIdentifiers = getMonitoredServiceIdentifiers(true, monitoredServiceDetails)
  const { startTime = currentPeriodStartTime, endTime = _endTime } = chartTimeRange ?? {}
  const isAnnotationsEnabled = useFeatureFlag(FeatureFlag.SRM_SLO_ANNOTATIONS)

  const {
    data: sloWidgetsData,
    loading,
    refetch: fetchSecondaryEvents
  } = useGetSecondaryEvents({
    queryParams: {
      startTime: currentPeriodStartTime,
      endTime: _endTime,
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    identifier: sloIdentifier
  })

  const { showDrawer, hideDrawer } = useDrawer({
    createDrawerContent: props => (
      <AnnotationDetails
        hideDrawer={hideDrawer}
        sloIdentifier={sloIdentifier}
        fetchSecondaryEvents={fetchSecondaryEvents}
        {...props}
      />
    ),
    drawerOptions: addAnnotationsDrawerOptions,
    showConfirmationDuringClose: false
  })

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
    <>
      {isAnnotationsEnabled ? (
        <Container flex={{ justifyContent: 'flex-start' }} padding={{ top: 'small' }} onClick={showDrawer}>
          <svg height={16} width={16} className={css.annotationIcon}>
            <image href={annotationsIcon} height={16} width={16} />
          </svg>
          <Button
            variation={ButtonVariation.LINK}
            text={getString('cv.slos.sloDetailsChart.addAnnotation')}
            className={css.addAnnotationLink}
          />
        </Container>
      ) : null}
      <Container
        className={css.main}
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
            setDefaultSlider={true}
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
            defaultOffSetPercentage={defaultOffSetPercentage}
          />
        )}
        <ChangeTimeline
          sloWidgetsData={sloWidgetsData?.data}
          sloWidgetsDataLoading={loading}
          fetchSecondaryEvents={fetchSecondaryEvents}
          selectedTimeRange={{ startTime, endTime }}
          startTime={sliderTimeRange?.startTime}
          endTime={sliderTimeRange?.endTime}
          hideTimeline={!isCardView}
          monitoredServiceIdentifier={monitoredServiceIdentifier}
          onSliderMoved={setChangeTimelineSummary}
          monitoredServiceIdentifiers={monitoredServiceIdentifiers}
          addAnnotation={(annotationMessage?: AnnotationMessage) => {
            showDrawer({ annotationMessage })
          }}
          isSLOChartTimeline
        />
      </Container>
    </>
  )
}

export default SLOTargetChartWithChangeTimeline
