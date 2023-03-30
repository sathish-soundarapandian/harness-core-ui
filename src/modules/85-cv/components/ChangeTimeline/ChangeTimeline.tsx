/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { getErrorMessage, getMonitoredServiceIdentifierProp } from '@cv/utils/CommonUtils'
import type { TimePeriodEnum } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.constants'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import {
  useChangeEventTimeline,
  useChangeEventTimelineForAccount,
  useGetMonitoredServiceChangeTimeline
} from 'services/cv'
import type { ChangeTimelineProps } from './ChangeTimeline.types'
import { Timeline } from './components/Timeline/Timeline'
import {
  ChangeSourceTypes,
  defaultCategoryTimeline,
  defaultCategoryTimelineWithChaos
} from './ChangeTimeline.constants'
import {
  createChangeInfoCardData,
  createTimelineSeriesData,
  getStartAndEndTime,
  labelByCategory
} from './ChangeTimeline.utils'
import ChangeTimelineError from './components/ChangeTimelineError/ChangeTimelineError'

export default function ChangeTimeline(props: ChangeTimelineProps): JSX.Element {
  const { getString } = useStrings()
  const { SRM_ENABLE_REQUEST_SLO: enableRequestSLO } = useFeatureFlags()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId
  const {
    useMonitoredServiceChangeTimeline,
    monitoredServiceIdentifier,
    serviceIdentifier,
    environmentIdentifier,
    startTime,
    endTime,
    selectedTimePeriod,
    selectedTimeRange,
    onSliderMoved,
    changeCategories,
    changeSourceTypes,
    hideTimeline,
    duration,
    monitoredServiceIdentifiers,
    addAnnotation,
    sloWidgetsData,
    sloWidgetsDataLoading,
    fetchSecondaryEvents,
    isSLOChartTimeline
  } = props

  const {
    data: monitoredServiceChangeTimelineData,
    refetch: monitoredServiceChangeTimelineRefetch,
    loading: monitoredServiceChangeTimelineLoading,
    error: monitoredServiceChangeTimelineError,
    cancel: monitoredServiceChangeTimelineCancel
  } = useGetMonitoredServiceChangeTimeline({
    lazy: true
  })

  const {
    data: projectLevelChangeEventTimelineData,
    refetch: projectLevelChangeEventTimelineRefetch,
    loading: projectLevelChangeEventTimelineLoading,
    error: projectLevelChangeEventTimelineError,
    cancel: projectLevelChangeEventTimelineCancel
  } = useChangeEventTimeline({
    lazy: true,
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  })

  const {
    data: accountLevelChangeEventTimelineData,
    refetch: accountLevelChangeEventTimelineRefetch,
    loading: accountLevelChangeEventTimelineLoading,
    error: accountLevelChangeEventTimelineError,
    cancel: accountLevelChangeEventTimelineCancel
  } = useChangeEventTimelineForAccount({
    lazy: true,
    accountIdentifier: accountId
  })

  const {
    data: changeEventTimelineData,
    refetch: changeEventTimelineRefetch,
    loading: changeEventTimelineLoading,
    error: changeEventTimelineError,
    cancel: changeEventTimelineCancel
  } = {
    data: isAccountLevel ? accountLevelChangeEventTimelineData : projectLevelChangeEventTimelineData,
    refetch: isAccountLevel ? accountLevelChangeEventTimelineRefetch : projectLevelChangeEventTimelineRefetch,
    loading: isAccountLevel ? accountLevelChangeEventTimelineLoading : projectLevelChangeEventTimelineLoading,
    error: isAccountLevel ? accountLevelChangeEventTimelineError : projectLevelChangeEventTimelineError,
    cancel: isAccountLevel ? accountLevelChangeEventTimelineCancel : projectLevelChangeEventTimelineCancel
  }

  const { startTimeRoundedOffToNearest30min, endTimeRoundedOffToNearest30min } = useMemo(() => {
    if (selectedTimeRange) {
      return {
        startTimeRoundedOffToNearest30min: selectedTimeRange.startTime,
        endTimeRoundedOffToNearest30min: selectedTimeRange.endTime
      }
    }

    return getStartAndEndTime((selectedTimePeriod?.value as string) || '')
  }, [selectedTimePeriod?.value, selectedTimeRange])

  useEffect(() => {
    changeEventTimelineCancel()
    /* istanbul ignore else */ if (!useMonitoredServiceChangeTimeline) {
      const monitoredServiceIdentifierProp = getMonitoredServiceIdentifierProp(
        isAccountLevel,
        monitoredServiceIdentifiers,
        monitoredServiceIdentifier
      )
      changeEventTimelineRefetch({
        queryParams: {
          ...monitoredServiceIdentifierProp,
          ...(serviceIdentifier
            ? { serviceIdentifiers: Array.isArray(serviceIdentifier) ? serviceIdentifier : [serviceIdentifier] }
            : {}),
          ...(environmentIdentifier
            ? { envIdentifiers: Array.isArray(environmentIdentifier) ? environmentIdentifier : [environmentIdentifier] }
            : {}),
          changeCategories: changeCategories || [],
          changeSourceTypes: changeSourceTypes || [],
          startTime: startTimeRoundedOffToNearest30min,
          endTime: endTimeRoundedOffToNearest30min
        },
        queryParamStringifyOptions: {
          arrayFormat: 'repeat'
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    startTimeRoundedOffToNearest30min,
    endTimeRoundedOffToNearest30min,
    changeCategories,
    changeSourceTypes,
    serviceIdentifier,
    environmentIdentifier,
    useMonitoredServiceChangeTimeline,
    monitoredServiceIdentifier
  ])

  useEffect(() => {
    monitoredServiceChangeTimelineCancel()
    /* istanbul ignore else */ if (useMonitoredServiceChangeTimeline) {
      monitoredServiceChangeTimelineRefetch({
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          monitoredServiceIdentifier,
          changeSourceTypes: changeSourceTypes || [],
          duration: duration?.value as TimePeriodEnum,
          endTime: Date.now()
        }
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accountId,
    orgIdentifier,
    projectIdentifier,
    monitoredServiceIdentifier,
    useMonitoredServiceChangeTimeline,
    changeSourceTypes,
    duration
  ])

  const { data, error, loading } = useMonitoredServiceChangeTimeline
    ? {
        data: monitoredServiceChangeTimelineData,
        error: monitoredServiceChangeTimelineError,
        loading: monitoredServiceChangeTimelineLoading
      }
    : {
        data: changeEventTimelineData,
        error: changeEventTimelineError,
        loading: changeEventTimelineLoading
      }

  const { categoryTimeline } = data?.resource || {}

  useEffect(() => {
    const changeInfoCardData = createChangeInfoCardData(getString, startTime, endTime, categoryTimeline)
    if (changeInfoCardData.length) {
      onSliderMoved?.(changeInfoCardData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime, categoryTimeline])

  if (error) {
    return <ChangeTimelineError error={getErrorMessage(error) || ''} />
  }

  const skeletenLoadingCategory = enableRequestSLO ? defaultCategoryTimelineWithChaos : defaultCategoryTimeline

  return (
    <Timeline
      isLoading={loading}
      rowOffset={90}
      timelineRows={Object.entries(categoryTimeline || skeletenLoadingCategory).map(timeline => ({
        labelName: labelByCategory(timeline[0], getString),
        data: createTimelineSeriesData(timeline[0] as ChangeSourceTypes, getString, timeline[1])
      }))}
      timestamps={[startTimeRoundedOffToNearest30min, endTimeRoundedOffToNearest30min]}
      labelWidth={115}
      hideTimeline={hideTimeline}
      addAnnotation={addAnnotation}
      sloWidgetsData={sloWidgetsData}
      sloWidgetsDataLoading={sloWidgetsDataLoading}
      fetchSecondaryEvents={fetchSecondaryEvents}
      isSLOChartTimeline={isSLOChartTimeline}
    />
  )
}
