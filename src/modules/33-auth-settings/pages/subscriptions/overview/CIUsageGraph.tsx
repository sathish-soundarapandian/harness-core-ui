/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, useEffect } from 'react'
import { Text, Layout, Card, Heading, PageSpinner, SelectOption } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { StackedColumnChart } from '@common/components/StackedColumnChart/StackedColumnChart'
import { useMutateAsGet } from '@common/hooks'
import type { ModuleLicenseDTO, CIModuleLicenseDTO } from 'services/cd-ng'
import { useGetLicenseHistoryUsage } from 'services/ci'
import ProjectDropdown from '@common/ProjectDropdown/ProjectDropdown'
import OrgDropdown from '@common/OrgDropdown/OrgDropdown'
import { SummaryCardData, getSummaryCardRenderers, getYAxis, getPlotOptions, getSeries } from './ServiceLicenseGraphs'
import pageCss from '../SubscriptionsPage.module.scss'

interface CIUsageGraphProps {
  accountId: string
  licenseType: 'SERVICES' | 'SERVICE_INSTANCES' | 'DEVELOPERS' | undefined
  licenseData?: ModuleLicenseDTO
}

const CIUsageGraph: React.FC<CIUsageGraphProps> = (props: CIUsageGraphProps) => {
  const { getString } = useStrings()
  const [projectIdentifierSelected, setProjectIdentifierSelected] = useState<string>('')
  const [orgIdentifierSelected, setOrgIdentifierSelected] = useState<string>('')
  const [orgSelected, setOrgSelected] = useState<SelectOption | undefined>()
  const [projSelected, setProjectSelected] = useState<SelectOption | undefined>()

  const licenseDataInfo = props.licenseData as CIModuleLicenseDTO
  const {
    data,
    loading,
    refetch: refetchCIGraphUsage
  } = useMutateAsGet(useGetLicenseHistoryUsage, {
    queryParams: {
      accountIdentifier: props.accountId,
      timestamp: '',
      licenseType: 'DEVELOPERS'
    },
    body: {
      orgIdentifier: orgIdentifierSelected,
      projectIdentifier: projectIdentifierSelected
    },
    lazy: true
  })

  useEffect(() => {
    refetchCIGraphUsage()
  }, [projectIdentifierSelected, orgIdentifierSelected])
  const subscriptions = licenseDataInfo?.numberOfCommitters || 0
  const valuesArray = Object.values(data?.data?.licenseUsage || [])
  const maxValue = valuesArray.length > 0 ? Math.max(...valuesArray) : 0
  const summaryCardsData: SummaryCardData[] = useMemo(() => {
    return [
      {
        title: getString('common.monthlyPeak'),
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
  }, [maxValue])
  const usageDataObject = data?.data?.licenseUsage
  const dataKeysLicense = Object.keys(usageDataObject || [])
  const dataKeysToTimestamp = dataKeysLicense.map(id => new Date(id).getTime())
  // sorting timestamp
  const dataKeysSortedLicense = dataKeysToTimestamp.sort((m, n) => (m > n ? 1 : -1))
  const requiredData = usageDataObject || {}
  const sortedValues = []
  for (let i = 0; i < dataKeysSortedLicense.length; i++) {
    const sortedValue = dataKeysToTimestamp[i]
    for (const key in requiredData) {
      if (sortedValue === new Date(key).getTime()) {
        sortedValues.push(requiredData[key])
      }
    }
  }
  // sorting ordered values according to the timestamp
  const values = sortedValues

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
          const dataKeys = Object.keys(data?.data?.licenseUsage || [])
          // sorting data according to date
          const dataKeysSorted = dataKeys.sort((a, b) => (a > b ? 1 : -1))
          return dataKeysSorted[this.pos]
        }
      }
    },
    yAxis: getYAxis(maxValue, subscriptions, getString('common.subscriptions.usage.developers')),
    plotOptions: getPlotOptions(),
    series: getSeries(values, subscriptions)
  }
  const updateFilters = () => {
    setOrgIdentifierSelected(orgSelected?.value as string)
    setProjectIdentifierSelected(projSelected?.value as string)
  }
  return (
    <Card className={pageCss.outterCard}>
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'stretch' }}>
        <Layout.Horizontal spacing="small" flex={{ justifyContent: 'center' }} width={'100%'}>
          <Layout.Vertical>
            <Heading color={Color.BLACK} font={{ size: 'medium' }}>
              {getString('common.subscriptions.usage.activeDevelopers')}
            </Heading>
          </Layout.Vertical>
          <Layout.Vertical className={pageCss.badgesContainer}>
            <div>{getSummaryCardRenderers(summaryCardsData)}</div>
          </Layout.Vertical>
          <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-end' }}>
            <OrgDropdown
              value={orgSelected}
              className={pageCss.orgDropdown}
              onChange={org => {
                setOrgSelected(org)
              }}
            />
            <ProjectDropdown
              value={projSelected}
              className={pageCss.orgDropdown}
              onChange={proj => {
                setProjectSelected(proj)
              }}
            />
            <Text
              className={pageCss.fetchButton}
              font={{ variation: FontVariation.LEAD }}
              color={Color.PRIMARY_7}
              onClick={() => {
                updateFilters()
              }}
            >
              Update
            </Text>
          </Layout.Horizontal>
        </Layout.Horizontal>
        {loading && <PageSpinner />}
        <StackedColumnChart options={customChartOptions} data={[]}></StackedColumnChart>
      </Layout.Vertical>
    </Card>
  )
}

export default CIUsageGraph
