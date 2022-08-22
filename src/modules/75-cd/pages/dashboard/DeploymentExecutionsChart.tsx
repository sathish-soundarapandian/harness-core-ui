/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import moment from 'moment'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getTooltip } from '@pipeline/utils/DashboardUtils'
import { useGetDeploymentExecution } from 'services/cd-ng'
import NoDeployments from '@pipeline/components/Dashboards/images/NoDeployments.svg'

import { useErrorHandler } from '@pipeline/components/Dashboards/shared'
import { OverviewChartsWithToggle } from '@common/components/OverviewChartsWithToggle/OverviewChartsWithToggle'
import routes from '@common/RouteDefinitions'
import styles from './CDDashboardPage.module.scss'

const ONE_DAY_IN_MS = 86400000

export default function DeploymentExecutionsChart(props: any) {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const history = useHistory()
  const { range, title } = props

  const { data, error } = useGetDeploymentExecution({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      startTime: range?.range[0]?.getTime() || 0,
      endTime: range?.range[1]?.getTime() || 0
    }
  })

  useErrorHandler(error)
  const chartData = useMemo(() => {
    if (data?.data?.executionDeploymentList?.length) {
      const successData: number[] = []
      const failureData: number[] = []
      const custom: any = []
      data.data.executionDeploymentList.forEach(val => {
        successData.push(defaultTo(val.deployments?.success, 0))
        failureData.push(defaultTo(val.deployments?.failure, 0))
        custom.push(val)
      })

      const successCount = successData.reduce((sum, i) => sum + i, 0)
      const failureCount = failureData.reduce((sum, i) => sum + i, 0)

      return [
        {
          name: `Failed (${failureCount})`,
          data: failureData,
          color: 'var(--red-400)',
          custom
        },
        {
          name: `Success (${successCount})`,
          data: successData,
          color: '#5FB34E',
          custom
        }
      ]
    }
  }, [data])
  const { getString } = useStrings()

  const failedData = chartData?.find(item => item.name.includes('Failed')) as any
  const allFailedCount = failedData?.data?.every((item: any) => item === 0)

  const chartSuccessData = chartData?.find(item => item.name.includes('Success')) as any
  const allSuccessCount = chartSuccessData?.data?.every((item: any) => item === 0)
  return (
    <>
      <Text className={styles.healthCardTitle}>{title}</Text>

      {allFailedCount && allSuccessCount ? (
        <Container className={styles.emptyView}>
          <Container className={styles.emptyViewCard}>
            <img src={NoDeployments} />
            <Text>{getString('common.noDeployments')}</Text>
          </Container>
        </Container>
      ) : (
        <div className={styles.chartContainer}>
          <OverviewChartsWithToggle
            data={defaultTo(chartData, [])}
            customChartOptions={{
              tooltip: {
                useHTML: true,
                formatter: function () {
                  return getTooltip(this)
                },
                backgroundColor: Color.BLACK,
                outside: true,
                borderColor: 'black'
              },
              xAxis: {
                title: {
                  text: 'Date'
                },
                labels: {
                  formatter: function (this) {
                    let time = new Date().getTime()
                    if (data?.data?.executionDeploymentList?.length) {
                      const val = data?.data?.executionDeploymentList?.[this.pos]?.time
                      time = val ? new Date(val).getTime() : time
                    }
                    return moment(time).utc().format('MMM D')
                  }
                }
              },
              yAxis: {
                title: {
                  text: getString('pipeline.dashboards.executionsLabel')
                }
              },
              plotOptions: {
                series: {
                  cursor: 'pointer',
                  point: {
                    events: {
                      click: function (this) {
                        const startTime = data?.data?.executionDeploymentList?.[this.category as any]?.time || 0
                        const endTime =
                          data?.data?.executionDeploymentList?.[(this.category + 1) as any]?.time ||
                          startTime + ONE_DAY_IN_MS
                        history.push(
                          routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'cd' }) +
                            `?filters=${JSON.stringify({
                              timeRange: {
                                startTime,
                                endTime
                              }
                            })}`
                        )
                      }
                    }
                  }
                }
              }
            }}
          />
        </div>
      )}
    </>
  )
}
