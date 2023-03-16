/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'

import { Color } from '@harness/design-system'
import { Card, Container, Layout, Text } from '@harness/uicore'
import type { ResponseTimeValuePairListDTOInteger } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { SparklineChart } from '@common/components/SparklineChart/SparklineChart'
import { TrendPopover } from '@cd/components/TrendPopover/TrendPopover'
import { PieChart } from '@cd/components/PieChart/PieChart'
import { numberFormatter } from '@common/utils/utils'
import css from '@cd/components/Services/ServiceInstancesWidget/ServiceInstancesWidget.module.scss'

export interface ServiceInstanceWidgetProps {
  serviceCount: number
  serviceInstancesCount: number
  prodCount: number
  nonProdCount: number
  serviceGrowthTrendData: ResponseTimeValuePairListDTOInteger | null
}

export const ServiceInstancesWidget: React.FC<ServiceInstanceWidgetProps> = props => {
  const { serviceCount, serviceInstancesCount, prodCount, nonProdCount, serviceGrowthTrendData: data } = props
  const { getString } = useStrings()

  const trendData: number[] = useMemo(() => {
    const timeValuePairList = data?.data?.timeValuePairList || []
    // istanbul ignore else
    if (!timeValuePairList.length) {
      return []
    }
    timeValuePairList.sort((prev, curr) => (prev.timestamp || 0) - (curr.timestamp || 0))
    return timeValuePairList.map(timeValuePair => timeValuePair.value || 0)
  }, [data])

  const pieChartData = useMemo(
    () => [
      {
        label: getString('cd.serviceDashboard.nonProd'),
        value: nonProdCount,
        formattedValue: numberFormatter(nonProdCount),
        color: 'var(--primary-2)'
      },
      {
        label: getString('cd.serviceDashboard.prod'),
        value: prodCount,
        formattedValue: numberFormatter(prodCount),
        color: 'var(--primary-7)'
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prodCount, nonProdCount]
  )
  const title = getString('cd.serviceDashboard.servicesInLast', {
    period: getString('common.duration.6months')
  })

  const reducedData =
    trendData.length >= 20
      ? trendData.filter((_val, index) => {
          return index % Math.floor(trendData.length / 20) === 0
        })
      : trendData

  return (
    <Card className={css.card}>
      <Layout.Vertical width={248}>
        <Layout.Horizontal className={css.topSection}>
          <Layout.Vertical width={'100%'}>
            <Text font={{ weight: 'bold' }} color={Color.GREY_600}>
              {getString('services')}
            </Text>
            <Layout.Horizontal flex={{ distribution: 'space-between' }}>
              <Text color={Color.BLACK} font={{ weight: 'bold' }} className={css.text}>
                {numberFormatter(serviceCount)}
              </Text>
              {reducedData.length ? (
                <TrendPopover title={title} data={reducedData}>
                  <SparklineChart
                    title={getString('cd.serviceDashboard.6monthTrend')}
                    data={reducedData}
                    options={{ chart: { width: 80, height: 50 } }}
                    sparklineChartContainerStyles={css.hover}
                  />
                </TrendPopover>
              ) : (
                <></>
              )}
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Vertical className={css.bottomSection}>
          <Layout.Vertical margin={{ bottom: 'medium' }}>
            <Text font={{ weight: 'bold' }} color={Color.GREY_600} margin={{ bottom: 'xsmall' }}>
              {getString('common.subscriptions.usage.serviceInstances')}
            </Text>
            <Layout.Horizontal flex={{ alignItems: 'center', distribution: 'space-between' }}>
              <Text color={Color.BLACK} font={{ weight: 'bold' }} className={css.text}>
                {numberFormatter(serviceInstancesCount)}
              </Text>
              {serviceInstancesCount ? (
                <Container height={65}>
                  <PieChart size={65} items={pieChartData} showLabels={false}></PieChart>
                </Container>
              ) : (
                <></>
              )}
            </Layout.Horizontal>
          </Layout.Vertical>
          {serviceInstancesCount ? (
            <Layout.Horizontal flex={{ distribution: 'space-between' }}>
              {pieChartData.map(pieChartDataItem => {
                return (
                  <Layout.Horizontal key={pieChartDataItem.label} flex={{ alignItems: 'center' }}>
                    <div className={css.circle} style={{ background: pieChartDataItem.color }}></div>
                    <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_500}>{`${
                      pieChartDataItem.label
                    } (${pieChartDataItem.formattedValue ?? pieChartDataItem.value})`}</Text>
                  </Layout.Horizontal>
                )
              })}
            </Layout.Horizontal>
          ) : (
            <></>
          )}
        </Layout.Vertical>
      </Layout.Vertical>
    </Card>
  )
}
