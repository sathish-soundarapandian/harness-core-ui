/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, Text, Icon, Layout } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import cx from 'classnames'

import { Classes } from '@blueprintjs/core'
import { merge, defaultTo, isEmpty, capitalize } from 'lodash-es'
import moment from 'moment'
import { useStrings } from 'framework/strings'
import { roundNumber, useErrorHandler } from '@pipeline/components/Dashboards/shared'
import type { DeploymentDateAndCount, ChangeRate } from 'services/cd-ng'
import { PieChart, PieChartProps } from '@cd/components/PieChart/PieChart'
import { numberFormatter } from '@common/utils/utils'
import { calcTrendCaret, calcTrendColor, RateTrend, TrendPopover } from './dashboardUtils'
import styles from './CDDashboardPage.module.scss'

export interface HealthCardProps {
  title: string
  value?: number
  rate?: number | ChangeRate
  primaryChartOptions?: any
  secondaryChartOptions?: any
  layout: 'vertical' | 'horizontal'
  children?: any
  isParent?: boolean
  emptyState?: boolean
  isLoading?: boolean
  pieChartProps?: any
  showPieChart?: boolean
  showLineChart?: boolean
  refetchWidget?: boolean
}

// sonar recommedation
const green = 'var(--green-600)'
const red = 'var(--ci-color-red-500)'
const grey = 'var(--grey-500)'

export default function DeploymentsHealthCards(props: any) {
  const { title, data, loading, error } = props

  useErrorHandler(error)
  const { getString } = useStrings()
  const mapTime = (value: DeploymentDateAndCount) => (value?.time ? moment(value.time).format('YYYY-MM-DD') : '')

  const chartsData = useMemo(() => {
    if (data?.data?.healthDeploymentInfo) {
      const ret: any = {}
      if (data?.data?.healthDeploymentInfo?.total) {
        const { countList, production, nonProduction } = defaultTo(data?.data?.healthDeploymentInfo?.total, {})
        if (countList?.length) {
          ret.totalChartOptions = merge({}, defaultChartOptions, primaryChartOptions, {
            chart: {
              height: 40,
              width: 125
            },
            xAxis: {
              categories: countList?.map(mapTime)
            },
            series: [
              {
                name: 'Deployments',
                type: 'line',
                color: 'var(--ci-color-blue-500)',
                data: countList?.map((val: any) => val?.deployments?.count)
              }
            ]
          })
        }

        ret.totalBarChartOptions = merge({}, defaultChartOptions, secondaryChartOptions, {
          xAxis: {
            categories: [`Non Prod (${nonProduction})`, `Prod (${production})`]
          },
          series: [
            {
              type: 'bar',
              name: 'Non Prod',
              color: 'var(--grey-600)',
              data: [nonProduction, 0]
            },
            {
              type: 'bar',
              name: 'Prod',
              color: 'var(--grey-600)',
              data: [0, production]
            }
          ]
        })
      }
      if (data?.data?.healthDeploymentInfo?.success?.countList?.length) {
        ret.successChartOptions = merge({}, defaultChartOptions, primaryChartOptions, {
          xAxis: {
            categories: data.data.healthDeploymentInfo.success.countList.map(mapTime)
          },
          series: [
            {
              name: 'Deployments',
              type: 'line',
              color: 'var(--ci-color-blue-500)',
              data: data.data.healthDeploymentInfo.success.countList.map((val: any) => val?.deployments?.count)
            }
          ]
        })
      }
      if (data?.data?.healthDeploymentInfo?.failure?.countList?.length) {
        ret.failureChartOptions = merge({}, defaultChartOptions, primaryChartOptions, {
          xAxis: {
            categories: data.data.healthDeploymentInfo.failure.countList.map(mapTime)
          },
          series: [
            {
              name: 'Deployments',
              type: 'line',
              color: 'var(--ci-color-blue-500)',
              data: data.data.healthDeploymentInfo.failure.countList.map((val: any) => val?.deployments?.count)
            }
          ]
        })
      }
      if (data?.data?.healthDeploymentInfo?.active?.countList?.length) {
        ret.activeChartOptions = merge({}, defaultChartOptions, primaryChartOptions, {
          xAxis: {
            categories: data.data.healthDeploymentInfo.active.countList.map(mapTime)
          },
          series: [
            {
              name: 'Deployments',
              type: 'line',
              color: 'var(--ci-color-blue-500)',
              data: data.data.healthDeploymentInfo.active.countList.map((val: any) => val?.deployments?.count)
            }
          ]
        })
      }
      return ret
    }
  }, [data])
  const dataInfo = data?.data?.healthDeploymentInfo

  const noDataState = dataInfo?.total?.nonProduction === 0 && dataInfo?.total?.production === 0
  const emptyState = dataInfo?.total?.count === 0

  const pieChartProps: PieChartProps = {
    items: [
      {
        label: getString('cd.serviceDashboard.nonProd'),
        value: defaultTo(data?.data?.healthDeploymentInfo?.total?.nonProduction, 0),
        formattedValue: numberFormatter(data?.data?.healthDeploymentInfo?.total?.nonProduction),
        color: noDataState ? grey : 'var(--primary-2)'
      },
      {
        label: getString('cd.serviceDashboard.prod'),
        value: defaultTo(data?.data?.healthDeploymentInfo?.total?.production, 0),
        formattedValue: numberFormatter(data?.data?.healthDeploymentInfo?.total?.production),
        color: noDataState ? grey : 'var(--primary-7)'
      }
    ],
    size: 60,
    customCls: styles.topDepPiechart,
    showInRevOrder: true,

    options: {
      tooltip: {
        enabled: false
      }
    }
  }

  const labelsHtml = (
    <Layout.Vertical className={styles.labelStyles}>
      {!isEmpty(pieChartProps.items) ? (
        <ul>
          {pieChartProps.items.map(({ label, formattedValue, value, color }) => (
            <li style={{ color }} key={`${label}_${value}`}>
              <Text
                className={styles.listStyles}
                key={label}
                lineClamp={1}
                tooltip={<Text padding={'small'}>{value}</Text>}
                alwaysShowTooltip={formattedValue !== value.toString()}
              >{`${label} (${formattedValue ? formattedValue : value})`}</Text>
            </li>
          ))}
        </ul>
      ) : null}
    </Layout.Vertical>
  )

  pieChartProps['labelsContent'] = labelsHtml

  return (
    <Container>
      <Text className={styles.healthCardTitle}>{title}</Text>
      <Container className={styles.healthCards}>
        <HealthCard
          title={getString('pipeline.dashboards.totalExecutions')}
          value={defaultTo(dataInfo?.total?.count, 0)}
          isLoading={loading}
          layout="vertical"
          rate={dataInfo?.total?.rate}
          primaryChartOptions={chartsData?.totalChartOptions}
          isParent={true}
          emptyState={emptyState}
          showLineChart={dataInfo?.total?.count ? true : false}
        >
          <HealthCard
            title={capitalize(getString('cd.getStartedWithCD.successFull'))}
            value={defaultTo(dataInfo?.success?.count, 0)}
            rate={dataInfo?.success?.rate}
            isLoading={loading}
            layout="vertical"
            primaryChartOptions={chartsData?.successChartOptions}
            emptyState={emptyState}
          />
          <HealthCard
            title={getString('failed')}
            value={defaultTo(dataInfo?.failure?.count, 0)}
            rate={dataInfo?.failure?.rate}
            isLoading={loading}
            layout="vertical"
            primaryChartOptions={chartsData?.failureChartOptions}
            emptyState={emptyState}
          />
          <HealthCard
            title={getString('active')}
            value={defaultTo(dataInfo?.active?.count, 0)}
            rate={dataInfo?.active?.rate}
            isLoading={loading}
            layout="vertical"
            primaryChartOptions={chartsData?.activeChartOptions}
            emptyState={emptyState}
          />
        </HealthCard>

        <TotalDepHealthCard
          title={getString('cd.envChanges')}
          layout={'horizontal'}
          pieChartProps={pieChartProps}
          showPieChart={true}
        />
      </Container>
    </Container>
  )
}

export function TotalDepHealthCard({ title, layout, pieChartProps = {}, showPieChart = false }: HealthCardProps) {
  return (
    <Container font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_600}>
      {showPieChart ? (
        <Layout.Vertical className={styles.totalCard}>
          <Container style={layout === 'horizontal' ? { display: 'flex', justifyContent: 'space-between' } : {}}>
            <Text className={styles.cardHeader}>{title}</Text>
          </Container>
          {showPieChart && <PieChart {...pieChartProps} />}
        </Layout.Vertical>
      ) : (
        <Container className={styles.totalCard} height="100%">
          <Text className={styles.cardHeader}>{title}</Text>
        </Container>
      )}
    </Container>
  )
}

const rateStyle = (
  rateChange: number | undefined,
  isParent: boolean,
  isFailed: boolean,
  rateTrend: RateTrend
): JSX.Element => {
  const rateColor = rateTrend === RateTrend.UP ? (isFailed ? red : green) : isFailed ? green : red
  const rateStyleChild = rateChange ? (
    <Layout.Horizontal flex={{ alignItems: 'center' }}>
      <Text
        margin={{ left: isParent ? 'small' : 'xsmall' }}
        style={{
          color: rateColor
        }}
      >
        {numberFormatter(Math.abs(defaultTo(roundNumber(rateChange), 0)))}%
      </Text>
      <Icon
        size={14}
        name={calcTrendCaret(rateTrend)}
        style={{
          color: rateColor
        }}
      />
    </Layout.Horizontal>
  ) : (
    <Layout.Horizontal flex={{ alignItems: 'center' }}>
      <Icon
        size={14}
        name="caret-right"
        style={{
          color: grey
        }}
        margin={{ left: isParent ? 'small' : 0 }}
      />
      {rateChange === 0 ? <Text style={{ color: grey }}>0%</Text> : null}
    </Layout.Horizontal>
  )
  return <TrendPopover trend={rateTrend}>{rateStyleChild}</TrendPopover>
}

export function HealthCard({
  title,
  value,
  rate,
  primaryChartOptions,
  secondaryChartOptions,
  layout,
  children,
  isLoading,
  emptyState,
  isParent = false
}: HealthCardProps): JSX.Element {
  const isFailed = title === 'Failed'

  const rateChange = (rate as ChangeRate)?.percentChange
  const rateTrend = (rate as ChangeRate)?.trend as RateTrend

  //sonar recommendation
  const RateStyleChild =
    !isLoading && !isParent && !emptyState ? (
      <Container flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        {rateStyle(rateChange, isParent, isFailed, rateTrend)}
      </Container>
    ) : null

  const RateStyleParent =
    !isLoading && isParent && !emptyState ? (
      <Container flex>{rateStyle(rateChange, isParent, false, rateTrend)}</Container>
    ) : null

  return (
    <Container font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_600} className={styles.healthCard}>
      <Text className={styles.cardHeader}>{title}</Text>
      <Container className={cx({ [styles.ctn]: layout === 'horizontal' })}>
        <Container className={styles.layoutParent}>
          <Container className={styles.textAndRate}>
            {isLoading ? (
              <Container height={30} width={100} className={Classes.SKELETON} />
            ) : (
              <>
                <Text
                  className={styles.cardText}
                  lineClamp={1}
                  tooltip={<Text padding={'small'}>{value}</Text>}
                  alwaysShowTooltip={numberFormatter(value) !== value?.toString()}
                >
                  {numberFormatter(value)}
                </Text>
                {RateStyleParent}
              </>
            )}
          </Container>

          {primaryChartOptions && !isLoading && !emptyState ? (
            <Container className={styles.chartWrap}>
              <HighchartsReact highcharts={Highcharts} options={primaryChartOptions} />
              {RateStyleChild}
            </Container>
          ) : null}
          {secondaryChartOptions && !isLoading && rateChange ? (
            <Container className={styles.chartWrap} margin={{ top: 'large' }}>
              <HighchartsReact highcharts={Highcharts} options={secondaryChartOptions} />
              {typeof rateChange === 'number' && rateChange && !isLoading ? (
                <Container flex>
                  <Text
                    margin={{ left: 'xsmall' }}
                    style={{
                      color: calcTrendColor(rateTrend)
                    }}
                  >
                    {numberFormatter(Math.abs(defaultTo(roundNumber(rateChange), 0)))}%
                  </Text>
                  <Icon
                    size={14}
                    name={calcTrendCaret(rateTrend)}
                    style={{
                      color: calcTrendColor(rateTrend)
                    }}
                  />
                </Container>
              ) : null}
            </Container>
          ) : null}
        </Container>
        <Container className={styles.childCard}>{children}</Container>
      </Container>
    </Container>
  )
}

const defaultChartOptions: Highcharts.Options = {
  chart: {
    animation: false,
    backgroundColor: 'transparent',
    height: 25,
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
      }
    }
  },
  tooltip: {
    enabled: false,
    outside: true
  },
  xAxis: {
    title: {
      text: ''
    },
    labels: {
      enabled: false
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

const primaryChartOptions: Highcharts.Options = {
  tooltip: {
    enabled: true
  },
  plotOptions: {
    line: {
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }
  },
  yAxis: {
    min: -1
  }
}

const secondaryChartOptions: Highcharts.Options = {
  chart: {
    height: 80
  },
  plotOptions: {
    bar: {
      stacking: 'normal',
      pointPadding: 0,
      borderWidth: 3,
      borderRadius: 4,
      pointWidth: 20
    }
  },
  xAxis: {
    labels: {
      enabled: true,
      style: {
        fontSize: '8',
        color: '#9293AB',
        whiteSpace: 'nowrap',
        fontFamily: 'Inter, sans-serif'
      }
    }
  }
}
