/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { Container, Text, Icon, Layout } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import moment from 'moment'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import merge from 'lodash-es/merge'
import type { RepositoryBuildInfo } from 'services/ci'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { UserLabel } from '@common/exports'
import { useStrings } from 'framework/strings'
import { diffStartAndEndTime, roundNumber, FailedStatus, ActiveStatus, mapToExecutionStatus } from '../shared'
import styles from './BuildCards.module.scss'

export interface RepositoryCardProps {
  title: React.ReactNode
  message?: string
  username?: string
  avatarUrl?: string
  startTime?: number
  endTime?: number
  count: number
  successRate: number
  successRateDiff: number
  lastBuildStatus?: string
  countLabel?: string
  seriesName?: string
  countList?: RepositoryBuildInfo[]
  onClick?: () => void
  className?: string
}

export default function RepositoryCard({
  title,
  message,
  username,
  startTime,
  endTime,
  count,
  successRate,
  successRateDiff,
  lastBuildStatus,
  countLabel = 'builds',
  seriesName = 'Builds',
  countList,
  onClick,
  className
}: RepositoryCardProps) {
  const { getString } = useStrings()
  const [chartOptions, setChartOptions] = useState(defaultChartOptions)
  const duration = diffStartAndEndTime(startTime, endTime)
  const mapTime = (value: RepositoryBuildInfo) => (value?.time ? moment(value.time).format('YYYY-MM-DD') : '')

  useEffect(() => {
    if (countList?.length) {
      setChartOptions(
        merge({}, defaultChartOptions, {
          tooltip: {
            enabled: true
          },
          xAxis: {
            categories: countList.map(mapTime)
          },
          series: [
            {
              name: seriesName,
              type: 'line',
              color: 'var(--ci-color-blue-500)',
              data: countList.map(val => val?.builds?.count)
            }
          ]
        })
      )
    }
  }, [countList])

  const rateColor = successRateDiff >= 0 ? 'var(--ci-color-green-500)' : 'var(--ci-color-red-500)'
  return (
    <Container
      className={cx(styles.repositoryCard, styles.buildStatus, className)}
      onClick={onClick}
      style={{ borderLeftColor: mapStatusToColor(lastBuildStatus) }}
    >
      <Text className={styles.title} color={Color.BLACK} lineClamp={1}>
        {title}
      </Text>
      <Container className={styles.mainContent}>
        <Container>
          <Container className={styles.cardStats}>
            <Text font={{ size: 'small' }} className={styles.statHeader}>
              {countLabel.toUpperCase()}
            </Text>
            <Text font={{ size: 'small' }} className={styles.statHeader}>
              {getString('pipeline.dashboards.successRate').toUpperCase()}
            </Text>
            <Text className={styles.statContent}>{count}</Text>
            <Container className={styles.statWrap}>
              <Text className={styles.statContent}>{roundNumber(successRate)}%</Text>
              <Icon
                size={14}
                name={successRateDiff >= 0 ? 'caret-up' : 'caret-down'}
                style={{
                  color: rateColor
                }}
              />
              <Text
                className={styles.rateDiffValue}
                style={{
                  color: rateColor
                }}
              >
                {Math.abs(roundNumber(successRateDiff)!)}%
              </Text>
            </Container>
          </Container>
        </Container>
        <Container className={styles.chartWrapper} height={40} margin={{ left: 'medium' }}>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </Container>
      </Container>
      <Layout.Horizontal className={styles.cardFooter} spacing="small">
        <Layout.Horizontal className={styles.avatarWrapper} spacing="small">
          {username && (
            <UserLabel
              name={username}
              textProps={{
                lineClamp: 1,
                font: { variation: FontVariation.TINY },
                alwaysShowTooltip: false
              }}
              iconProps={{ color: Color.GREY_900 }}
              className={styles.userLabel}
            />
          )}
          {message ? (
            <Text font={{ variation: FontVariation.TINY }} lineClamp={2} className={styles.message}>
              {message}
            </Text>
          ) : null}
        </Layout.Horizontal>
        <Layout.Horizontal flex={{ justifyContent: 'end' }} className={styles.times} spacing="xsmall">
          {startTime ? (
            <Layout.Horizontal flex spacing="xsmall">
              <Icon size={10} name="calendar" color={Color.GREY_900} />
              <Text font={{ variation: FontVariation.TINY }} lineClamp={1}>
                {moment(startTime).fromNow()}
              </Text>
            </Layout.Horizontal>
          ) : null}
          {duration ? (
            <Layout.Horizontal flex spacing="xsmall">
              <Icon size={10} name="time" color={Color.GREY_900} />
              <Text font={{ variation: FontVariation.TINY }}>{duration}</Text>
            </Layout.Horizontal>
          ) : null}
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Container>
  )
}

function mapStatusToColor(status?: string) {
  const mappedStatus = mapToExecutionStatus(status)
  if (mappedStatus === ExecutionStatusEnum.Success) {
    return 'var(--ci-color-green-500)'
  } else if (Object.prototype.hasOwnProperty.call(FailedStatus, mappedStatus!)) {
    return 'var(--ci-color-red-500)'
  } else if (Object.prototype.hasOwnProperty.call(ActiveStatus, mappedStatus!)) {
    return 'var(--ci-color-orange-500)'
  }
}

export const defaultChartOptions: Highcharts.Options = {
  chart: {
    animation: false,
    backgroundColor: 'transparent',
    height: 40,
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
    series: {
      marker: {
        states: {
          hover: {
            enabled: false
          }
        },
        enabled: false,
        radius: 1
      },
      stickyTracking: false,
      lineWidth: 1,
      turboThreshold: 50000
    },
    line: {
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }
  },
  tooltip: {
    enabled: false,
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
    min: -1,
    labels: { enabled: false },
    title: {
      text: ''
    },
    gridLineWidth: 0,
    lineWidth: 0,
    tickLength: 0
  },
  series: [
    {
      type: 'line',
      color: 'var(--grey-400)',
      data: [10, 10]
    }
  ]
}
