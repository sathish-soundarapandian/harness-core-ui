/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Container, Text, Icon } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Classes } from '@blueprintjs/core'
import classnames from 'classnames'
import { useParams } from 'react-router-dom'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import type { GetDataError } from 'restful-react'
import type { TimeRangeSelectorProps } from '@common/components/TimeRangeSelector/TimeRangeSelector'
import type { Failure } from 'services/cd-ng'
import { useGetBuildHealth } from 'services/ci'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { roundNumber, formatDuration, useErrorHandler, useRefetchCall } from '../shared'
import styles from './CIDashboardSummaryCards.module.scss'

export interface SummaryCardProps {
  title: string | JSX.Element
  text?: string | number | JSX.Element
  subContent?: React.ReactNode
  rate?: number
  rateDuration?: number
  isLoading?: boolean
  invertColor?: boolean
}

export default function CIDashboardSummaryCards(props: { timeRange?: TimeRangeSelectorProps }) {
  const { timeRange } = props
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [chartOptions, setChartOptions] = useState<any>(null)

  const { data, loading, error, refetch } = useGetBuildHealth({
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
  const showLoader = loading && !refetching

  useEffect(() => {
    const success = data?.data?.builds?.success?.count
    const failed = data?.data?.builds?.failed?.count
    if (typeof success === 'number' && typeof failed === 'number') {
      setChartOptions({
        ...defaultChartOptions,
        series: [
          {
            name: 'Failed',
            type: 'bar',
            color: 'var(--ci-color-red-500)',
            data: [failed]
          },
          {
            name: 'Success',
            type: 'bar',
            color: 'var(--ci-color-green-500)',
            data: [success]
          }
        ]
      })
    }
  }, [data?.data?.builds])

  return (
    <Container>
      <Container className={styles.marginBottom4}>
        <Text font={{ variation: FontVariation.H5 }}>{getString('pipeline.dashboards.buildHealth')}</Text>
      </Container>
      <Container className={styles.summaryCards}>
        <SummaryCard
          title={getString('pipeline.dashboards.totalBuilds')}
          text={data?.data?.builds?.total?.count}
          subContent={chartOptions && <HighchartsReact highcharts={Highcharts} options={chartOptions} />}
          rate={data?.data?.builds?.total?.rate}
          isLoading={showLoader}
        />
        <SummaryCard
          title={getString('pipeline.dashboards.successfulBuilds')}
          text={data?.data?.builds?.success?.count}
          rate={data?.data?.builds?.success?.rate}
          isLoading={showLoader}
        />
        <SummaryCard
          title={getString('pipeline.dashboards.failedBuilds')}
          text={data?.data?.builds?.failed?.count}
          rate={data?.data?.builds?.failed?.rate}
          isLoading={showLoader}
        />
      </Container>
    </Container>
  )
}

export function SummaryCard({
  title,
  text,
  subContent,
  rate,
  rateDuration,
  isLoading,
  invertColor = false
}: SummaryCardProps) {
  const isEmpty = typeof text === 'undefined'
  let rateFormatted
  let isIncrease = false
  let isDecrease = false
  if (typeof rate !== 'undefined') {
    isIncrease = rate > 0
    isDecrease = rate < 0
    rateFormatted = `${Math.abs(roundNumber(rate!)!)}%`
  } else if (typeof rateDuration === 'number') {
    isIncrease = rateDuration > 0
    isDecrease = rateDuration < 0
    rateFormatted = formatDuration(rateDuration)
  }
  const iconName = isIncrease ? 'caret-up' : 'caret-down'
  return (
    <Container
      className={classnames(styles.card, {
        [styles.variantIncrease]: (isIncrease && !invertColor) || (isDecrease && invertColor),
        [styles.variantDecrease]: (isIncrease && invertColor) || (isDecrease && !invertColor)
      })}
    >
      <Container className={styles.cardHeader}>{title}</Container>
      <Container className={styles.cardContent}>
        <Container className={styles.contentMain}>
          {isLoading && <Container height={30} width={100} className={Classes.SKELETON} />}
          {!isLoading &&
            (!isEmpty ? (
              <Text className={styles.contentMainText}>{text}</Text>
            ) : (
              <Container height={30} width={100} background={Color.GREY_200} />
            ))}
          {!isLoading && !isEmpty && <Container className={styles.subContent}>{subContent}</Container>}
        </Container>
        {!isEmpty && !isLoading && (
          <Container className={styles.diffContent}>
            {/* <HighchartsReact highcharts={Highcharts} options={primaryChartOptions} /> */}
            {(isIncrease || isDecrease) && <Icon size={14} name={iconName} />}
            <Text>{rateFormatted}</Text>
          </Container>
        )}
      </Container>
    </Container>
  )
}

const defaultChartOptions: Highcharts.Options = {
  chart: {
    type: 'bar',
    backgroundColor: 'transparent',
    height: 15,
    width: 200,
    spacing: [5, 0, 5, 0]
  },
  credits: undefined,
  title: {
    text: ''
  },
  legend: {
    enabled: false
  },
  plotOptions: {
    bar: {
      stacking: 'normal',
      pointPadding: 0,
      borderWidth: 3,
      borderRadius: 4,
      pointWidth: 6
    },
    series: {
      stickyTracking: false,
      lineWidth: 1
    },
    line: {
      marker: {
        enabled: false
      }
    }
  },
  tooltip: {
    outside: true
  },
  xAxis: {
    labels: { enabled: false },
    title: {
      text: ''
    },
    gridLineWidth: 0,
    lineWidth: 0,
    tickLength: 0
  },
  yAxis: {
    labels: { enabled: false },
    title: {
      text: ''
    },
    gridLineWidth: 0,
    lineWidth: 0,
    tickLength: 0
  }
}
