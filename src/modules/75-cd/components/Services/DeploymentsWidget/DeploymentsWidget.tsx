/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { SeriesAreaOptions } from 'highcharts'
import { Card, Container, Layout, Text, PageError } from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import moment from 'moment'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { Ticker, TickerVerticalAlignment } from '@common/components/Ticker/Ticker'
import { getBucketSizeForTimeRange } from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { PageSpinner, TimeSeriesAreaChart } from '@common/components'
import type { TimeSeriesAreaChartProps } from '@common/components/TimeSeriesAreaChart/TimeSeriesAreaChart'
import { DeploymentsTimeRangeContext, INVALID_CHANGE_RATE, numberFormatter } from '@cd/components/Services/common'
import DeploymentsEmptyState from '@cd/icons/DeploymentsEmptyState.svg'
import {
  GetServiceDeploymentsInfoQueryParams,
  ServiceDeploymentListInfo,
  useGetServiceDeploymentsInfo
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getTooltip } from '@pipeline/utils/DashboardUtils'
import css from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget.module.scss'

export interface ChangeValue {
  value: string
  change: number
}

interface DeploymentWidgetData {
  deployments: ChangeValue
  failureRate: ChangeValue
  frequency: ChangeValue
  data: TimeSeriesAreaChartProps['seriesData']
}

export interface DeploymentWidgetProps {
  serviceIdentifier?: string
}

const TickerValue: React.FC<{ value: number; color: Color }> = props => (
  <Text font={{ size: 'xsmall' }} color={props.color}>{`${numberFormatter(Math.abs(props.value), {
    truncate: false
  })}%`}</Text>
)

export const DeploymentsWidget: React.FC<DeploymentWidgetProps> = props => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { serviceIdentifier } = props
  const { timeRange } = useContext(DeploymentsTimeRangeContext)

  const queryParams: GetServiceDeploymentsInfoQueryParams = useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      serviceId: serviceIdentifier,
      startTime: timeRange?.range[0]?.getTime() || 0,
      endTime: timeRange?.range[1]?.getTime() || 0,
      bucketSizeInDays: getBucketSizeForTimeRange(timeRange?.range)
    }
  }, [accountId, orgIdentifier, projectIdentifier, serviceIdentifier, timeRange])

  const {
    loading,
    data: serviceDeploymentsInfo,
    error,
    refetch
  } = useGetServiceDeploymentsInfo({
    queryParams
  })

  const parseData = useCallback(
    (serviceDeploymentListInfo: ServiceDeploymentListInfo): DeploymentWidgetData => {
      const deployments = (serviceDeploymentListInfo.serviceDeploymentList || []).filter(
        deployment => deployment.time !== undefined
      )
      deployments.sort((deploymentA, deploymentB) => ((deploymentA.time || 0) < (deploymentB.time || 0) ? -1 : 1))

      const success: SeriesAreaOptions['data'] = []
      const failed: SeriesAreaOptions['data'] = []
      const successData: number[] = []
      const failureData: number[] = []
      const custom: any = []

      deployments.forEach(deployment => {
        const { failureRate, failureRateChangeRate, frequency, frequencyChangeRate } = deployment.rate || {}
        const rates = {
          failureRate,
          failureRateChangeRate,
          frequency,
          frequencyChangeRate,
          frequencyLabel: getString('common.frequency'),
          failureRateLabel: getString('common.failureRate')
        }
        success.push({ x: deployment.time || 0, y: deployment.deployments?.success || 0, ...rates })
        failed.push({ x: deployment.time || 0, y: deployment.deployments?.failure || 0, ...rates })

        successData.push(defaultTo(deployment.deployments?.success, 0))
        failureData.push(defaultTo(deployment.deployments?.failure, 0))
        custom.push(deployment)
      })

      const successCount = successData.reduce((sum, i) => sum + i, 0)
      const failureCount = failureData.reduce((sum, i) => sum + i, 0)

      return {
        deployments: {
          value: numberFormatter(serviceDeploymentListInfo.totalDeployments),
          change: serviceDeploymentListInfo.totalDeploymentsChangeRate || 0
        },
        failureRate: {
          value: numberFormatter(serviceDeploymentListInfo.failureRate),
          change: serviceDeploymentListInfo.failureRateChangeRate || 0
        },
        frequency: {
          value: numberFormatter(serviceDeploymentListInfo.frequency),
          change: serviceDeploymentListInfo.frequencyChangeRate || 0
        },
        data: [
          {
            name: `${getString('failed')} (${failureCount})`,
            data: failureData,
            color: 'var(--red-400)',
            custom
          },
          {
            name: `${getString('success')} (${successCount})`,
            data: successData,
            color: '#5FB34E',
            custom
          }
        ]
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const DeploymentWidgetContainer: React.FC = ({ children }) => {
    return (
      <Card className={css.card}>
        <Layout.Vertical height={'100%'}>{children}</Layout.Vertical>
      </Card>
    )
  }

  if (
    loading ||
    error ||
    !serviceDeploymentsInfo?.data ||
    (serviceDeploymentsInfo.data.totalDeployments === 0 && serviceDeploymentsInfo.data.totalDeploymentsChangeRate === 0)
  ) {
    const component = (() => {
      if (loading) {
        return (
          <Container data-test="deploymentsWidgetLoader">
            <PageSpinner />
          </Container>
        )
      }
      if (error) {
        return (
          <Container data-test="deploymentsWidgetError" height={'100%'}>
            <PageError onClick={() => refetch()} />
          </Container>
        )
      }
      return (
        <Layout.Vertical height="100%" flex={{ align: 'center-center' }} data-test="deploymentsWidgetEmpty">
          <img width="150" height="100" src={DeploymentsEmptyState} style={{ alignSelf: 'center' }} />
          <Text color={Color.GREY_400} margin={{ top: 'medium' }}>
            {getString('cd.serviceDashboard.noDeployments', {
              timeRange: timeRange?.label
            })}
          </Text>
        </Layout.Vertical>
      )
    })()
    return <DeploymentWidgetContainer>{component}</DeploymentWidgetContainer>
  }

  const { deployments, failureRate, frequency, data } = parseData(serviceDeploymentsInfo.data)

  const dataList = serviceDeploymentsInfo?.data?.serviceDeploymentList
  const customChartOptions: Highcharts.Options = {
    chart: { height: 170, spacing: [25, 0, 25, 0] },
    legend: { padding: 0 },
    xAxis: {
      allowDecimals: false,
      labels: {
        formatter: function (this) {
          let time = new Date().getTime()
          if (dataList?.length) {
            const val = dataList?.[this.pos]?.time
            time = val ? new Date(val).getTime() : time
          }
          return moment(time).utc().format('MMM D')
        }
      }
    },
    yAxis: {
      title: {
        text: '# of Deployments'
      },
      max: Math.max(
        ...(serviceDeploymentsInfo?.data?.serviceDeploymentList || []).map(
          deployment => (deployment.deployments?.failure || 0) + (deployment.deployments?.success || 0)
        )
      )
    },
    tooltip: {
      useHTML: true,
      borderWidth: 0,
      padding: 0,
      backgroundColor: Color.BLACK,
      formatter: function () {
        return getTooltip(this)
      }
    }
  }
  const isDeploymentBoost = deployments.change === INVALID_CHANGE_RATE
  return (
    <DeploymentWidgetContainer>
      <Container data-test="deploymentsWidgetContent">
        <Text font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
          {getString('deploymentsText')}
        </Text>
        <Layout.Horizontal flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
          <Layout.Horizontal width={240}>
            <Ticker
              value={
                isDeploymentBoost ? (
                  <></>
                ) : (
                  <TickerValue
                    value={deployments.change}
                    color={isDeploymentBoost || deployments.change > 0 ? Color.GREEN_600 : Color.RED_500}
                  />
                )
              }
              decreaseMode={!isDeploymentBoost && deployments.change < 0}
              boost={isDeploymentBoost}
              color={isDeploymentBoost || deployments.change > 0 ? Color.GREEN_600 : Color.RED_500}
              verticalAlign={TickerVerticalAlignment.CENTER}
              size={isDeploymentBoost ? 10 : 6}
            >
              <Layout.Vertical>
                <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} className={css.text} data-test="tickerText">
                  {deployments.value}
                </Text>
                <Text font={{ size: 'xsmall', weight: 'semi-bold' }} color={Color.GREY_400}>
                  {getString('cd.serviceDashboard.in', {
                    timeRange: timeRange?.label
                  })}
                </Text>
              </Layout.Vertical>
            </Ticker>
          </Layout.Horizontal>
          {[
            { ...failureRate, name: getString('common.failureRate') },
            { ...frequency, name: getString('cd.serviceDashboard.frequency') }
          ].map((item, index) => {
            const colors = index ? [Color.GREEN_600, Color.RED_500] : [Color.RED_500, Color.GREEN_600]
            const isBoost = item.change === INVALID_CHANGE_RATE
            return (
              <Layout.Vertical
                padding={'small'}
                margin={{ right: 'medium' }}
                className={css.tickerCard}
                key={item.name}
              >
                <Text
                  font={{ size: 'xsmall', weight: 'semi-bold' }}
                  margin={{ bottom: 'small' }}
                  color={Color.GREY_600}
                >
                  {item.name}
                </Text>
                <Ticker
                  value={
                    isBoost ? (
                      <></>
                    ) : (
                      <TickerValue value={item.change} color={isBoost || item.change > 0 ? colors[0] : colors[1]} />
                    )
                  }
                  decreaseMode={!isBoost && item.change < 0}
                  boost={isBoost}
                  size={isBoost ? 10 : 6}
                  color={isBoost || item.change > 0 ? colors[0] : colors[1]}
                  tickerContainerStyles={css.tickerContainerStyles}
                  verticalAlign={TickerVerticalAlignment.CENTER}
                >
                  <Text
                    color={Color.BLACK}
                    font={{ weight: 'semi-bold', size: 'medium' }}
                    margin={{ right: 'xsmall' }}
                    data-test="tickerText"
                  >
                    {index ? item.value : `${item.value}%`}
                  </Text>
                  {index ? (
                    <Text font={{ size: 'xsmall' }} className={css.unitText}>
                      {getString('cd.serviceDashboard.unitDay')}
                    </Text>
                  ) : null}
                </Ticker>
              </Layout.Vertical>
            )
          })}
        </Layout.Horizontal>
        <TimeSeriesAreaChart seriesData={data} customChartOptions={customChartOptions} />
      </Container>
    </DeploymentWidgetContainer>
  )
}
