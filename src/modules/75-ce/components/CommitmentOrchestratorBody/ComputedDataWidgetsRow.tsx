/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo, get } from 'lodash-es'
import { Color, Container, FontVariation, Layout, Text, Utils } from '@harness/uicore'
import formatCost from '@ce/utils/formatCost'
import SimpleBar from '@ce/common/SimpleBar/SimpleBar'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import CEChart from '../CEChart/CEChart'
import { getRadialChartOptions } from '../CEChart/CEChartOptions'
import css from './CommitmentOrchestrationBody.module.scss'

interface ComputedDataWidgetsRowProps {
  summaryData?: any
}

const computeCoverageItems = [
  {
    label: 'ce.commitmentOrchestration.savingsPlans',
    color: Utils.getRealCSSColor(Color.TEAL_600)
  },
  {
    label: 'ce.commitmentOrchestration.reservedInstances',
    color: Utils.getRealCSSColor(Color.PURPLE_600)
  },
  {
    label: 'ce.commitmentOrchestration.onDemandInstances',
    color: Utils.getRealCSSColor(Color.GREY_200)
  }
]

const DEFAULT_VALUE = 0

const ComputedDataWidgetsRow: React.FC<ComputedDataWidgetsRowProps> = ({ summaryData }) => {
  const { getString } = useStrings()
  const savingsPlanPercentage = get(summaryData, 'coverage_percentage.savings_plan', DEFAULT_VALUE)
  const reservedInstancesPercentage = get(summaryData, 'coverage_percentage.reserved_instances', DEFAULT_VALUE)
  const savingsPercentage = defaultTo(get(summaryData, 'savings.percentage', DEFAULT_VALUE), DEFAULT_VALUE)

  return (
    <Container className={css.bodyWidgetsContainer}>
      <Layout.Horizontal flex={{ alignItems: 'stretch' }}>
        <Layout.Vertical spacing={'small'} className={cx(css.infoContainer, css.semiLargeContainer)}>
          <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_600}>
            {getString('ce.commitmentOrchestration.computeSpend')}
          </Text>
          <Text font={{ variation: FontVariation.H3 }}>
            {formatCost(defaultTo(get(summaryData, 'compute_spend', DEFAULT_VALUE), DEFAULT_VALUE), {
              decimalPoints: 2
            })}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }}>{getString('ce.commitmentOrchestration.monthToDate')}</Text>
        </Layout.Vertical>
        <Layout.Horizontal
          className={cx(css.infoContainer, css.largeContainer)}
          flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
        >
          <Layout.Horizontal flex>
            <CEChart
              options={{
                ...getRadialChartOptions(
                  [
                    { name: 'savingsPlans', value: savingsPlanPercentage },
                    {
                      name: 'reservedInstances',
                      value: reservedInstancesPercentage
                    },
                    {
                      name: 'onDemandInstances',
                      value: get(summaryData, 'coverage_percentage.ondemand', DEFAULT_VALUE)
                    }
                  ],
                  ['#03C0CD', '#6938C0', '#D9DAE6'],
                  {
                    chart: { height: 100, width: 100 },
                    plotOptions: {
                      pie: { size: '180%' }
                    }
                  }
                ),
                title: {
                  text: `${(savingsPlanPercentage + reservedInstancesPercentage).toFixed(2)}%`,
                  align: 'center',
                  verticalAlign: 'middle',
                  style: { fontSize: '15px', fontWeight: '700' }
                }
              }}
            />
          </Layout.Horizontal>
          <Layout.Vertical margin={{ left: 'small' }} spacing="small">
            <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_600}>
              {getString('ce.commitmentOrchestration.computeCoverage')}
            </Text>
            <Container>
              {computeCoverageItems.map(item => (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} key={item.label}>
                  <div style={{ backgroundColor: item.color, height: 10, width: 10, marginRight: 10 }} />
                  <Text font={{ variation: FontVariation.BODY }}>{getString(item.label as keyof StringsMap)}</Text>
                </Layout.Horizontal>
              ))}
            </Container>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Horizontal
          className={cx(css.infoContainer, css.largeContainer)}
          flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
        >
          <Container>
            <CEChart
              options={{
                ...getRadialChartOptions(
                  [
                    { name: 'savingsPlans', value: savingsPercentage },
                    { name: 'reservedInstances', value: 100 - savingsPercentage }
                  ],
                  ['#299B2C', '#D9DAE6'],
                  {
                    chart: { height: 100, width: 100 },
                    plotOptions: {
                      pie: { size: '180%' }
                    }
                  }
                ),
                title: {
                  text: `${savingsPercentage.toFixed(2)}%`,
                  align: 'center',
                  verticalAlign: 'middle',
                  style: { fontSize: '15px', fontWeight: '700' }
                }
              }}
            />
          </Container>
          <Layout.Vertical spacing={'medium'}>
            <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_600}>
              {getString('ce.commitmentOrchestration.savings')}
            </Text>
            <Text font={{ variation: FontVariation.H3 }}>
              {formatCost(get(summaryData, 'savings.total', DEFAULT_VALUE), { decimalPoints: 2 })}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Vertical className={cx(css.infoContainer, css.largeContainer)} spacing="small">
          <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_600}>
            {getString('ce.commitmentOrchestration.commitmentUtilisation')}
          </Text>
          <Container>
            <SimpleBar
              widthInPercentage={Number(get(summaryData, 'utilization_percentage.savings_plan', 43.1).toFixed(2))}
              primaryColor={Color.TEAL_600}
              secondaryColor={Color.TEAL_50}
              description={getString('ce.commitmentOrchestration.savingsPlans')}
            />
            <SimpleBar
              widthInPercentage={Number(get(summaryData, 'utilization_percentage.reserved_instances', 79.4).toFixed(2))}
              primaryColor={Color.PURPLE_600}
              secondaryColor={Color.PURPLE_50}
              description={getString('ce.commitmentOrchestration.reservedInstances')}
              descriptionDirection="bottom"
            />
          </Container>
        </Layout.Vertical>
      </Layout.Horizontal>
    </Container>
  )
}

export default ComputedDataWidgetsRow
