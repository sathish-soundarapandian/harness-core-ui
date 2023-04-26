/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, useEffect } from 'react'
import { Text, Layout, Card, Heading, PageSpinner, Select, SelectOption, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import moment from 'moment'
import type { YAxisOptions } from 'highcharts'
import { useStrings } from 'framework/strings'
import { StackedColumnChart } from '@common/components/StackedColumnChart/StackedColumnChart'
import { useMutateAsGet } from '@common/hooks'
import { useGetLicenseDateUsage, ModuleLicenseDTO, CDModuleLicenseDTO } from 'services/cd-ng'
import { CDLicenseType } from '@common/constants/SubscriptionTypes'
import pageCss from '../SubscriptionsPage.module.scss'

interface ServiceLicenseGraphsProps {
  accountId: string
  licenseType: 'SERVICES' | 'SERVICE_INSTANCES' | 'DEVELOPERS' | undefined
  licenseData?: ModuleLicenseDTO
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

let filterOptions = [
  {
    label: 'Last 12 Months',
    value: 'Last 12 Months'
  }
]

export interface SummaryCardData {
  title: string
  count: number
  className: string
}

export const summaryCardRenderer = (cardData: SummaryCardData): JSX.Element => {
  return (
    <Container className={pageCss.summaryCard} key={cardData.title}>
      <Text font={{ size: 'medium' }} color={Color.GREY_700} className={pageCss.cardTitle}>
        {cardData.title}
      </Text>

      <Layout.Horizontal className={pageCss.frequencyContainer}>
        <div className={cardData.className}></div>
        <Text color={Color.BLACK} font={{ size: 'large', weight: 'bold' }} className={pageCss.frequencyCount}>
          {cardData.count}
        </Text>
      </Layout.Horizontal>
    </Container>
  )
}

export const getSummaryCardRenderers = (summaryCardsData: SummaryCardData[]): JSX.Element => {
  return (
    <Container className={pageCss.summaryCardsContainer}>
      {summaryCardsData?.map(currData => summaryCardRenderer(currData))}
    </Container>
  )
}
const getLast3Months = () => {
  const today = new Date()
  const last3Months = []

  for (let i = 1; i < 4; i++) {
    let month = today.getMonth() - i
    let year = today.getFullYear()
    if (month < 0) {
      if (month === -1) {
        month = 11
        year = year - 1
      }
      if (month === -2) {
        month = 10
        year = year - 1
      }
      if (month === -3) {
        month = 9
        year = year - 1
      }
    }
    last3Months.push(months[month] + ' ' + year)
  }
  return last3Months
}

export const getYAxis = (maxValue: number, subscriptions: number): YAxisOptions | YAxisOptions[] | undefined => {
  return {
    min: 0,
    max: maxValue > subscriptions ? maxValue + 1 : subscriptions + 1,
    plotLines: [
      {
        color: 'var(--red-600)',
        width: 1,
        value: maxValue,
        zIndex: 5,
        dashStyle: 'Dot'
      },
      {
        color: 'var(--primary-7)',
        width: 1,
        value: subscriptions,
        zIndex: 5,
        dashStyle: 'Solid'
      }
    ],
    title: {
      text: 'Developers'
    }
  }
}
export const getPlotOptions = () => {
  return {
    column: {
      pointPadding: 0.2,
      borderWidth: 0
    }
  }
}
export const getSeries = (values: number[], subscriptions: number): any => {
  return [
    {
      type: 'column',
      name: 'Date',
      data: values,
      pointWidth: 15,
      zones: [
        {
          color: 'var(--lime-400)',
          value: subscriptions + 1
        },
        {
          color: 'var(--green-900)'
        }
      ]
    }
  ]
}

export const ServiceLicenseGraphs: React.FC<ServiceLicenseGraphsProps> = (props: ServiceLicenseGraphsProps) => {
  const { getString } = useStrings()
  const currentDate = new Date()
  const [fetchType, setFetchType] = useState<string>('MONTHLY')
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [licenseTypeSelected, setLicenseTypeSelected] = useState<string>('')

  const licenseDataInfo = props.licenseData as CDModuleLicenseDTO
  const {
    data,
    loading,
    refetch: refetchServiceInstanceLicenses
  } = useMutateAsGet(useGetLicenseDateUsage, {
    queryParams: {
      accountIdentifier: props.accountId,
      licenseType: licenseTypeSelected
    },
    body: {
      reportType: fetchType,
      fromDate: fromDate,
      toDate: toDate
    },
    lazy: true
  })

  useEffect(() => {
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    const previousYear = currentDate.getFullYear() - 1
    let formatMonth = false
    if (currentMonth !== 10 && currentMonth !== 11 && currentMonth !== 12) {
      formatMonth = true
    }
    setFromDate(formatMonth ? `${previousYear}-0${currentMonth}-01` : `${previousYear}-${currentMonth}-01`)
    setToDate(formatMonth ? `${currentYear}-0${currentMonth}-01` : `${currentYear}-${currentMonth}-01`)
    if (props.licenseType === 'SERVICES') {
      setLicenseTypeSelected(CDLicenseType.SERVICES)
      refetchServiceInstanceLicenses()
    } else {
      setLicenseTypeSelected(CDLicenseType.SERVICE_INSTANCES)
      refetchServiceInstanceLicenses()
    }
    const last3Months = getLast3Months()
    const updatedData = last3Months.map(v => ({ label: v, value: v }))

    filterOptions = [...filterOptions, ...updatedData]
    filterOptions.push(filterOptions.shift() as { label: string; value: string })
  }, [])
  useEffect(() => {
    refetchServiceInstanceLicenses()
  }, [fetchType, fromDate, toDate])
  const subscriptions = licenseDataInfo?.workloads || 0
  const valuesArray = Object.values(data?.data?.licenseUsage || {})
  const maxValue = valuesArray.length > 0 ? Math.max(...valuesArray) : 0
  const summaryCardsData: SummaryCardData[] = useMemo(() => {
    return [
      {
        title: getString(fetchType === 'MONTHLY' ? 'common.yearlyPeak' : 'common.monthlyPeak'),
        count: maxValue,
        className: pageCss.peakClass
      },
      {
        title: getString('common.plans.subscription'),
        count: subscriptions,
        className: pageCss.subClass
      },
      {
        title: getString('common.OverUse'),
        count: subscriptions - maxValue < 0 ? Math.abs(subscriptions - maxValue) : 0,
        className: pageCss.overUseClass
      }
    ]
  }, [fetchType, maxValue])

  const requiredData = data?.data?.licenseUsage || {}
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<SelectOption>({
    label: 'Last 12 Months',
    value: 'Last 12 Months'
  })
  const values = Object.values(requiredData)

  /* istanbul ignore next */
  const customChartOptions: Highcharts.Options = {
    chart: {
      type: 'column'
    },
    tooltip: {
      formatter: function () {
        const thisPoint = this.point,
          allSeries = this.series.chart.series,
          thisIndex = thisPoint.index
        let returnString = ''

        allSeries.forEach(function (ser) {
          if (ser.options.stack === thisPoint.series.options.stack) {
            returnString += ser.points[thisIndex].y
          }
        })

        return returnString
      }
    },
    xAxis: {
      labels: {
        formatter: function (this) {
          const dataKeys = Object.keys(data?.data?.licenseUsage || {})
          if (dataKeys.length > 12) {
            return dataKeys[this.pos]
          } else return moment(dataKeys[this.pos]).format('YYYY-MM')
        }
      }
    },
    yAxis: getYAxis(maxValue, subscriptions),
    plotOptions: getPlotOptions(),
    series: getSeries(values, subscriptions)
  }
  const licenseType = props.licenseType
  return (
    <Card className={pageCss.outterCard}>
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'stretch' }}>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'space-between' }} width={'100%'}>
          <Layout.Vertical>
            <Heading color={Color.BLACK} font={{ size: 'medium' }}>
              {getString(
                licenseType === 'SERVICES'
                  ? 'common.subscriptions.usage.serviceLicenses'
                  : 'common.subscriptions.usage.serviceInstances'
              )}
            </Heading>
          </Layout.Vertical>
          <Layout.Vertical className={pageCss.badgesContainer}>
            <div>{getSummaryCardRenderers(summaryCardsData)}</div>
          </Layout.Vertical>
          <Layout.Vertical>
            <Select
              onChange={selected => {
                const currentMonth = currentDate.getMonth() + 1
                const previousMonth = currentDate.getMonth()
                const currentYear = currentDate.getFullYear()
                const previousYear = currentDate.getFullYear() - 1
                let yearPassed = currentYear
                let year2Passed = currentYear
                let year3Passed = currentYear
                let monthPassed = previousMonth
                let month2Passed = previousMonth - 1
                let month3Passed = previousMonth - 2
                if (currentMonth === 1) {
                  yearPassed = previousYear
                  monthPassed = 12
                  year2Passed = previousYear
                  month2Passed = 11
                  year3Passed = previousYear
                  month3Passed = 10
                }
                if (currentMonth === 2) {
                  year2Passed = previousYear
                  month2Passed = 12
                  year3Passed = previousYear
                  month3Passed = 11
                }
                if (currentMonth === 3) {
                  year3Passed = previousYear
                  month3Passed = 12
                }

                setSelectedTimePeriod(selected)
                if (selected.value === 'Last 12 Months') {
                  setFetchType('MONTHLY')
                  let formatMonth = false
                  if (currentMonth !== 10 && currentMonth !== 11 && currentMonth !== 12) {
                    formatMonth = true
                  }
                  setFromDate(
                    formatMonth ? `${previousYear}-0${currentMonth}-01` : `${previousYear}-${currentMonth}-01`
                  )
                  setToDate(formatMonth ? `${currentYear}-0${currentMonth}-01` : `${currentYear}-${currentMonth}-01`)
                }
                if (selected.value === filterOptions[0].value) {
                  let formatMonth = false
                  if (monthPassed !== 10 && monthPassed !== 11 && monthPassed !== 12) {
                    formatMonth = true
                  }
                  setFetchType('DAILY')
                  setFromDate(formatMonth ? `${yearPassed}-0${monthPassed}-01` : `${yearPassed}-${monthPassed}-01`)
                  setToDate(formatMonth ? `${yearPassed}-0${monthPassed}-31` : `${yearPassed}-${monthPassed}-31`)
                }
                if (selected.value === filterOptions[1].value) {
                  let formatMonth = false
                  if (month2Passed !== 10 && month2Passed !== 11 && month2Passed !== 12) {
                    formatMonth = true
                  }
                  setFetchType('DAILY')
                  setFromDate(formatMonth ? `${year2Passed}-0${month2Passed}-01` : `${year2Passed}-${month2Passed}-01`)
                  setToDate(formatMonth ? `${year2Passed}-0${month2Passed}-31` : `${year2Passed}-${month2Passed}-31`)
                }
                if (selected.value === filterOptions[2].value) {
                  let formatMonth = false
                  if (month3Passed !== 10 && month3Passed !== 11 && month3Passed !== 12) {
                    formatMonth = true
                  }
                  setFetchType('DAILY')
                  setFromDate(formatMonth ? `${year3Passed}-0${month3Passed}-01` : `${year3Passed}-${month3Passed}-01`)
                  setToDate(formatMonth ? `${year3Passed}-0${month3Passed}-01` : `${year3Passed}-${month3Passed}-31`)
                }
              }}
              items={filterOptions}
              value={selectedTimePeriod || null}
              data-id="licenseGraphDropdown"
            />
          </Layout.Vertical>
        </Layout.Horizontal>
        {loading && <PageSpinner />}
        <StackedColumnChart options={customChartOptions} data={[]}></StackedColumnChart>
      </Layout.Vertical>
    </Card>
  )
}
