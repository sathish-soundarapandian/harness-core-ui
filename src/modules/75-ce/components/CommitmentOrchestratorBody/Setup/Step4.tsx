/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, Container, FontVariation, Layout, Text, Utils } from '@harness/uicore'
import { get } from 'lodash-es'
import CEChart from '@ce/components/CEChart/CEChart'
import { getRadialChartOptions } from '@ce/components/CEChart/CEChartOptions'
import formatCost from '@ce/utils/formatCost'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { useSetupContext } from './SetupContext'
import css from './Setup.module.scss'

const computeCoverageItems = [
  {
    label: 'ce.commitmentOrchestration.setup.step4.coveredBySavigsPlan',
    color: Utils.getRealCSSColor(Color.TEAL_600)
  },
  {
    label: 'ce.commitmentOrchestration.setup.step4.coveredByRI',
    color: Utils.getRealCSSColor(Color.PURPLE_600)
  },
  {
    label: 'ce.commitmentOrchestration.setup.step4.remainOnDemand',
    color: Utils.getRealCSSColor(Color.GREY_200)
  }
]

const Step4: React.FC = () => {
  const { getString } = useStrings()
  const { setupData } = useSetupContext()
  const savingsPlanPercentage = get(setupData, 'savingsPlanConfig.coveragePercentage', 0)
  const riPercentage = get(setupData, 'riConfig.coveragePercentage', 0)
  const savingsPlanChartValue = get(setupData, 'overallCoverage', 0) * (savingsPlanPercentage / 100)
  const riChartValue = get(setupData, 'overallCoverage', 0) * (riPercentage / 100)
  return (
    <Layout.Vertical spacing={'medium'} className={css.step4Cont}>
      <Text font={{ variation: FontVariation.H4 }}>{getString('review')}</Text>
      <Container className={css.reviewSection}>
        <Layout.Vertical spacing={'huge'} flex>
          <Text font={{ variation: FontVariation.H4 }}>
            {getString('ce.commitmentOrchestration.setup.step4.description')}
          </Text>
          <Layout.Horizontal flex>
            <CEChart
              options={{
                ...getRadialChartOptions(
                  [
                    { name: 'savingsPlans', value: savingsPlanChartValue },
                    {
                      name: 'reservedInstances',
                      value: riChartValue
                    },
                    {
                      name: 'onDemandInstances',
                      value: 100 - (savingsPlanChartValue + riChartValue)
                    }
                  ],
                  ['#03C0CD', '#6938C0', '#D9DAE6'],
                  {
                    chart: { height: 200, width: 200, backgroundColor: '' },
                    tooltipDisabled: false
                  }
                ),
                title: {
                  text: `<div style="text-align: center;">
                  <p style="font-size: 20px; font-weight: 600; margin: 0">${(
                    savingsPlanChartValue + riChartValue
                  ).toFixed(2)}%</p>
                  <p style="font-size: 10px; color: rgba(79, 81, 98, 1); margin: 0">TOTAL COVERAGE</p>
                  </div>`,
                  useHTML: true,
                  align: 'center',
                  verticalAlign: 'middle'
                }
              }}
            />
            <Container>
              {computeCoverageItems.map(item => (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} key={item.label} className={css.legendCont}>
                  <div style={{ backgroundColor: item.color }} className={css.legendColor} />
                  <Text font={{ variation: FontVariation.BODY }}>{getString(item.label as keyof StringsMap)}</Text>
                </Layout.Horizontal>
              ))}
            </Container>
          </Layout.Horizontal>
          <Layout.Horizontal className={css.widgetsRow}>
            <Layout.Vertical spacing={'medium'} className={css.widget}>
              <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                {getString('ce.commitmentOrchestration.setup.step4.targetComputeSpend')}
              </Text>
              <Text font={{ variation: FontVariation.H3 }}>{formatCost(22135.124, { decimalPoints: 2 })}</Text>
              <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
                {getString('ce.commitmentOrchestration.setup.step4.afterPurchase')}
              </Text>
            </Layout.Vertical>
            <Layout.Vertical spacing={'medium'} className={css.widget}>
              <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                {getString('ce.commitmentOrchestration.setup.step4.targetSavings')}
              </Text>
              <Text font={{ variation: FontVariation.H3 }}>{formatCost(22135.124, { decimalPoints: 2 })}</Text>
              <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
                {getString('ce.commitmentOrchestration.setup.step4.afterPurchase')}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical spacing={'huge'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
          <Text font={{ variation: FontVariation.H4 }}>
            {getString('ce.commitmentOrchestration.setup.step4.actionPlan')}
          </Text>
          <Layout.Vertical spacing={'large'}>
            <Container>
              <Text font={{ variation: FontVariation.BODY }}>
                Purchase Convertible RI for $600 for t3.medium 1-year no upfront.
              </Text>
            </Container>
            <Container>
              <Text font={{ variation: FontVariation.BODY }}>
                Purchase Savings Plan for $853 3-year partial upfront.
              </Text>
            </Container>
            <Container>
              <Text font={{ variation: FontVariation.BODY }}>Sell RI of type t3-medium, m1-large for $853. </Text>
            </Container>
          </Layout.Vertical>
        </Layout.Vertical>
      </Container>
    </Layout.Vertical>
  )
}

export default Step4
