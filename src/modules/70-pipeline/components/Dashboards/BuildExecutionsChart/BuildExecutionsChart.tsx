/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo } from 'react'
import noop from 'lodash/noop'
import { Container, Text, Layout } from '@wings-software/uicore'
import HighchartsReact from 'highcharts-react-official'
import { FontVariation } from '@harness/design-system'
import Highcharts from 'highcharts'
import moment from 'moment'
import merge from 'lodash-es/merge'
import { Spinner } from '@blueprintjs/core'

import { useParams } from 'react-router-dom'
import type { GetDataError } from 'restful-react'
import { useGetBuildExecution } from 'services/ci'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { FailedStatus, useErrorHandler, useRefetchCall } from '@pipeline/components/Dashboards/shared'
import type { Failure } from 'services/cd-ng'
import NoDeployments from '@pipeline/components/Dashboards/images/NoDeployments.svg'
import NoBuilds from '../images/NoBuilds.svg'
import styles from './BuildExecutionsChart.module.scss'

export interface ExecutionsChartProps {
  titleText: React.ReactNode
  customTitleCls?: string
  data?: Array<{
    time?: number
    success?: number
    failed?: number
    aborted?: number
    expired?: number
  }>
  loading: boolean
  range: number[]
  onRangeChange(val: number[]): void
  yAxisTitle: string
  successColor?: string
  isCIPage?: boolean
}

export default function BuildExecutionsChart(props: any) {
  const { isCIPage, timeRange } = props
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()

  const { data, loading, error, refetch } = useGetBuildExecution({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      startTime: timeRange?.range[0]?.getTime() || 0,
      endTime: timeRange?.range[1]?.getTime() || 0
    }
  })

  useErrorHandler(error as GetDataError<Failure | Error> | null)
  const refetching = useRefetchCall(refetch, loading)

  const chartData = useMemo(() => {
    if (data?.data?.buildExecutionInfoList?.length) {
      return data.data.buildExecutionInfoList.map(val => ({
        time: val.time,
        success: val.builds?.success,
        failed: val.builds?.failed,
        aborted: val.builds?.aborted,
        expired: val.builds?.expired
      }))
    }
  }, [data])

  return (
    <ExecutionsChart
      titleText={getString('buildsText')}
      data={chartData}
      loading={loading && !refetching}
      range={timeRange}
      onRangeChange={noop}
      yAxisTitle="# of builds"
      isCIPage={isCIPage}
    />
  )
}

export function ExecutionsChart({
  titleText,
  data,
  loading,
  range,
  yAxisTitle,
  successColor,
  isCIPage,
  customTitleCls
}: ExecutionsChartProps) {
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>(
    generateEmptyChartData(range[0], range[1], {
      yAxis: {
        title: { text: yAxisTitle }
      }
    })
  )
  const { module = 'cd' } = useModuleInfo()

  const successful: number[] = []
  const failed: number[] = []
  const expired: number[] = []
  const aborted: number[] = []
  const empty: number[] = []
  const xCategories: string[] = []
  useEffect(() => {
    if (data?.length) {
      let totalMax = data.reduce((acc, curr) => {
        return Math.max((curr?.success || 0) + (curr?.failed || 0) + (curr?.aborted || 0) + (curr?.expired || 0), acc)
      }, 0)
      totalMax = Math.ceil(Math.max(totalMax * 1.2, 10))
      const highchartsTime = new Highcharts.Time({})
      data.forEach(val => {
        successful.push(val?.success || 0)
        failed.push(val?.failed || 0)
        aborted.push(val?.aborted || 0)
        expired.push(val?.expired || 0)
        empty.push(totalMax - ((val?.success || 0) + (val?.failed || 0) + (val?.aborted || 0) + (val?.expired || 0)))
        xCategories.push(highchartsTime.dateFormat('%e %B, %Y', val.time))
      })
      setChartOptions(
        merge({}, defaultChartOptions, {
          chart: {
            animation: false
          },
          yAxis: {
            endOnTick: false,
            title: {
              text: yAxisTitle
            }
          },
          xAxis: {
            categories: xCategories
          },
          series: [
            {
              type: 'column',
              name: 'Failed',
              color: 'var(--ci-color-red-500)',
              data: failed,
              legendIndex: 1
            },
            {
              type: 'column',
              name: 'Successful',
              color: successColor || 'var(--ci-color-green-500)',
              data: successful,
              legendIndex: 0
            },
            {
              type: 'column',
              name: FailedStatus.Aborted,
              color: 'var(--grey-500)',
              data: aborted,
              legendIndex: 2
            },
            {
              type: 'column',
              name: FailedStatus.Expired,
              color: 'var(--yellow-900)',
              data: expired,
              legendIndex: 3
            }
          ]
        })
      )
    }
  }, [data])
  const titleCls = customTitleCls ? styles.rangeSelectorHeader : ''
  const { getString } = useStrings()
  const failedData = chartOptions?.series?.find(item => item.name === 'Failed') as any
  const failedCount = failedData?.data?.every((item: any) => item === 0)

  const successData = chartOptions?.series?.find(item => item.name === 'Successful') as any
  const successCount = successData?.data?.every((item: any) => item === 0)

  const abortedData = chartOptions?.series?.find(item => item.name === FailedStatus.Aborted) as any
  const abortedCount = successData?.data?.every((item: any) => item === 0)

  const expiredData = chartOptions?.series?.find(item => item.name === FailedStatus.Expired) as any
  const expiredCount = successData?.data?.every((item: any) => item === 0)

  return (
    <Container className={styles.main}>
      <Layout.Horizontal className={isCIPage ? styles.marginBottom4 : styles.marginBottom2}>
        <Text margin={{ right: 'small' }} className={titleCls} font={{ variation: FontVariation.H5 }}>
          {titleText}
        </Text>
        {loading && <Spinner size={15} />}
      </Layout.Horizontal>

      {isCIPage ? (
        <Container className={styles.chartWrapper}>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </Container>
      ) : (!failedData && !successData && !abortedData && !expiredData) ||
        (failedCount && successCount && abortedCount && expiredCount) ? (
        <Container className={styles.emptyView}>
          <Container className={styles.emptyViewCard}>
            <img src={module === 'ci' ? NoBuilds : NoDeployments} />
            <Text>{module === 'ci' ? getString('pipeline.noBuildsLabel') : getString('common.noDeployments')}</Text>
          </Container>
        </Container>
      ) : (
        <Container className={styles.chartWrapper}>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </Container>
      )}
    </Container>
  )
}

function generateEmptyChartData(start: number, end: number, config: Highcharts.Options): Highcharts.Options {
  let n = moment(end).diff(start, 'days')
  const empty: number[] = []
  const xCategories: string[] = []
  while (n-- > 0) {
    xCategories.push(moment().subtract(n, 'days').format('YYYY-MM-DD'))
    empty.push(10)
  }
  return merge({}, defaultChartOptions, config, {
    xAxis: {
      labels: { enabled: false },
      categories: xCategories
    },
    yAxis: {
      labels: { enabled: false }
    },
    series: [
      {
        type: 'column',
        name: 'nn',
        color: 'var(--ci-color-gray-100)',
        showInLegend: false,
        enableMouseTracking: false,
        data: empty
      }
    ]
  })
}

const defaultChartOptions: Highcharts.Options = {
  chart: {
    type: 'column',
    height: 215
  },
  title: {
    text: ''
  },
  credits: undefined,
  legend: {
    align: 'center',
    verticalAlign: 'bottom',
    symbolHeight: 9,
    symbolWidth: 9,
    symbolRadius: 2,
    squareSymbol: true,
    itemStyle: {
      fontWeight: '400',
      fontSize: '10',
      fontFamily: 'Inter, sans-serif'
    }
  },
  xAxis: {
    title: {
      text: 'Date',
      style: {
        fontSize: '8',
        color: '#9293AB'
      }
    },
    labels: {
      enabled: true,
      // autoRotation: false,
      formatter: lab => moment(lab.value).date() + '',
      style: {
        fontSize: '8',
        color: '#9293AB'
      }
    },
    tickWidth: 0,
    lineWidth: 0
  },
  yAxis: {
    labels: {
      enabled: true,
      style: {
        fontSize: '8',
        color: '#9293AB'
      }
    },
    title: {
      text: '',
      style: {
        fontSize: '8',
        color: '#9293AB'
      }
    },
    lineWidth: 0
  },
  plotOptions: {
    column: {
      stacking: 'normal',
      pointPadding: 0,
      borderWidth: 3,
      borderRadius: 4,
      pointWidth: 6,
      events: {
        legendItemClick: function () {
          return false
        }
      }
    }
  }
}
