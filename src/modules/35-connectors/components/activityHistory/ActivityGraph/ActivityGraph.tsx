/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import { Container, PageSpinner } from '@harness/uicore'
import HighchartsReact from 'highcharts-react-official'
import { Color } from '@harness/design-system'
import Highcharts, { SeriesColumnOptions } from 'highcharts'
import type { DateRange } from '@blueprintjs/datetime'
import {
  GetActivitiesSummaryQueryParams,
  useGetActivitiesSummary,
  ListActivitiesQueryParams,
  GetConnectivitySummaryQueryParams,
  ResponsePageActivitySummary
} from 'services/cd-ng'
import type { UseGetMockData } from '@common/utils/testUtils'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ActivityGraphDataType } from '../ActivityHistory/ActivityHistory'

interface ActivityGraphProps {
  referredEntityType: GetActivitiesSummaryQueryParams['referredEntityType']
  entityIdentifier: string
  dataFormat: GetActivitiesSummaryQueryParams['timeGroupType']
  dateRange: DateRange
  refetchActivities: (data: { queryParams: ListActivitiesQueryParams }) => Promise<void>
  refetchConnectivitySummary: (data: { queryParams: GetConnectivitySummaryQueryParams }) => Promise<void>
  setShowConnectivityChecks: (val: boolean) => void
  setShowOtherActivity: (val: boolean) => void
  mockData?: UseGetMockData<ResponsePageActivitySummary>
}

const ActivityGraph: React.FC<ActivityGraphProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const {
    data: activitySummary,
    refetch: refetchActivitySummary,
    loading
  } = useGetActivitiesSummary({
    queryParams: {
      referredEntityType: props.referredEntityType,
      identifier: props.entityIdentifier,
      accountIdentifier: accountId,
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      startTime: moment(props.dateRange[0]).startOf('day').valueOf() as number,
      endTime: moment(props.dateRange[1]).endOf('day').valueOf() + 1,
      timeGroupType: props.dataFormat
    },
    lazy: true,
    mock: props.mockData
  })

  const formatActivityForGraph = (): ActivityGraphDataType => {
    const success: Array<Array<number | undefined>> = [],
      failure: Array<Array<number | undefined>> = [],
      heartBeat: Array<Array<number | undefined>> = []
    activitySummary?.data?.content?.forEach(item => {
      success.push([item.startTime, item.successfulActivitiesCount])
      failure.push([item.startTime, item.failedActivitiesCount])
      heartBeat.push([item.startTime, item.heartBeatFailuresCount])
    })
    return {
      Success: success || [],
      Failure: failure || [],
      HeartBeatFailure: heartBeat || []
    }
  }

  const timezone = new Date().getTimezoneOffset()
  Highcharts.setOptions({
    time: {
      timezoneOffset: timezone
    }
  })
  const getConfig = (activityData: ActivityGraphDataType): Highcharts.Options => {
    return {
      chart: {
        type: 'column'
      },
      title: {
        text: undefined
      },
      xAxis: {
        type: 'datetime',

        startOnTick: true,
        endOnTick: true,
        showLastLabel: true
      },
      yAxis: {
        title: {
          text: undefined
        }
      },
      credits: {
        enabled: false
      },

      legend: {
        align: 'right',
        x: -30,
        verticalAlign: 'top',
        y: -15,
        floating: true
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          pointPlacement: 'on',
          pointWidth: 10
        },
        series: {
          cursor: 'pointer',
          point: {
            events: {
              click: function (this) {
                const activityName = this.series.userOptions.name

                if (
                  activityName === getString('activityHistory.successfulActivity') ||
                  activityName == getString('activityHistory.failedActivity')
                ) {
                  props.setShowConnectivityChecks(false)
                  props.setShowOtherActivity(true)
                  props.refetchActivities({
                    queryParams: {
                      referredEntityType: props.referredEntityType,
                      accountIdentifier: accountId,
                      projectIdentifier: projectIdentifier,
                      orgIdentifier: orgIdentifier,
                      identifier: props.entityIdentifier,
                      startTime: moment(this.x).startOf('day').valueOf(),
                      endTime: moment(this.x).endOf('day').valueOf(),
                      status: activityName === getString('activityHistory.successfulActivity') ? 'SUCCESS' : 'FAILED'
                    }
                  })
                } else if (activityName === getString('activityHistory.heartbeatFailure')) {
                  props.setShowOtherActivity(false)
                  props.setShowConnectivityChecks(true)
                  props.refetchConnectivitySummary({
                    queryParams: {
                      accountIdentifier: accountId,
                      projectIdentifier: projectIdentifier,
                      orgIdentifier: orgIdentifier,
                      identifier: props.entityIdentifier,
                      startTime: moment(this.x).startOf('day').valueOf(),
                      endTime: moment(this.x).endOf('day').valueOf()
                    }
                  })
                }
              }
            }
          }
        },
        scatter: {
          marker: {
            radius: 5,
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          }
        }
      },
      series: [
        {
          name: getString('activityHistory.successfulActivity'),
          data: activityData.Success.map(val =>
            Object.assign(
              {},
              {
                x: val[0],
                y: val[1]
              }
            )
          ),
          color: 'var(--green-500)'
        } as SeriesColumnOptions,
        {
          name: getString('activityHistory.failedActivity'),
          data: activityData.Failure.map(val =>
            Object.assign(
              {},
              {
                x: val[0],
                y: val[1]
              }
            )
          ),
          color: 'var(--red-500)'
        } as SeriesColumnOptions,
        {
          type: 'spline',
          name: getString('activityHistory.heartbeatFailure'),
          data: activityData.HeartBeatFailure,
          color: Color.BLACK,
          marker: {
            symbol: 'circle',
            backgroundColor: Color.WHITE,
            radius: 5,
            lineColor: Color.BLACK,
            lineWidth: 1,
            borderColor: Color.BLACK,
            fillColor: Color.WHITE
          }
        }
      ]
    }
  }

  const chartConfig = useMemo(() => {
    const activityData = formatActivityForGraph()
    return getConfig(activityData)
  }, [activitySummary])

  useEffect(() => {
    if (props.dateRange[0] && props.dateRange[1]) {
      refetchActivitySummary()
    }
  }, [props.dateRange])

  return (
    <Container padding={{ bottom: 'large', top: 'small', left: 'small', right: 'small' }}>
      {!loading ? <HighchartsReact highcharts={Highcharts} options={chartConfig} /> : <PageSpinner />}
    </Container>
  )
}

export default ActivityGraph
