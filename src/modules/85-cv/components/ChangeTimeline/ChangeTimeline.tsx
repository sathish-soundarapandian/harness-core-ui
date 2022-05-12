/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { TimePeriodEnum } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.constants'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useChangeEventTimeline, useGetMonitoredServiceChangeTimeline } from 'services/cv'
import type { ChangeTimelineProps } from './ChangeTimeline.types'
import { Timeline } from './components/Timeline/Timeline'
import { ChangeSourceTypes } from './ChangeTimeline.constants'

import {
  createChangeInfoCardData,
  createNoDataMessage,
  createTimelineSeriesData,
  getStartAndEndTime
} from './ChangeTimeline.utils'
import ChangeTimelineError from './components/ChangeTimelineError/ChangeTimelineError'

export default function ChangeTimeline(props: ChangeTimelineProps): JSX.Element {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
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
    duration
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
    data: changeEventTimelineData,
    refetch: changeEventTimelineRefetch,
    loading: changeEventTimelineLoading,
    error: changeEventTimelineError,
    cancel: changeEventTimelineCancel
  } = useChangeEventTimeline({
    lazy: true,
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  })

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
      changeEventTimelineRefetch({
        queryParams: {
          ...(monitoredServiceIdentifier ? { monitoredServiceIdentifiers: [monitoredServiceIdentifier] } : {}),
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
  const { Deployment, Infrastructure, Alert } = categoryTimeline || {}

  useEffect(() => {
    const changeInfoCardData = createChangeInfoCardData(
      startTime,
      endTime,
      Deployment,
      Infrastructure,
      Alert,
      getString
    )
    if (changeInfoCardData.length) {
      onSliderMoved?.(changeInfoCardData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime, Deployment, Infrastructure, Alert])

  if (error) {
    return <ChangeTimelineError error={getErrorMessage(error) || ''} />
  }

  return (
    <Timeline
      isLoading={loading}
      rowOffset={90}
      timelineRows={[
        {
          labelName: getString('deploymentsText'),
          data: createTimelineSeriesData(ChangeSourceTypes.Deployments, getString, categoryTimeline?.Deployment),
          noDataMessage: createNoDataMessage(
            categoryTimeline?.Deployment,
            ChangeSourceTypes.Deployments,
            selectedTimePeriod?.label,
            getString
          )
        },
        {
          labelName: getString('infrastructureText'),
          data: createTimelineSeriesData(ChangeSourceTypes.Infrastructure, getString, categoryTimeline?.Infrastructure),
          noDataMessage: createNoDataMessage(
            categoryTimeline?.Infrastructure,
            ChangeSourceTypes.Infrastructure,
            selectedTimePeriod?.label,
            getString
          )
        },
        {
          labelName: getString('cv.changeSource.tooltip.incidents'),
          data: createTimelineSeriesData(ChangeSourceTypes.Incidents, getString, categoryTimeline?.Alert),
          noDataMessage: createNoDataMessage(
            categoryTimeline?.Alert,
            ChangeSourceTypes.Incidents,
            selectedTimePeriod?.label,
            getString
          )
        }
      ]}
      timestamps={[startTimeRoundedOffToNearest30min, endTimeRoundedOffToNearest30min]}
      labelWidth={90}
      hideTimeline={hideTimeline}
    />
  )
}
