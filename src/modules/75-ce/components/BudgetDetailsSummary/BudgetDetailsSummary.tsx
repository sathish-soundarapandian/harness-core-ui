/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Card, Container, FlexExpander, Layout, Text } from '@harness/uicore'
import cx from 'classnames'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { getAllBudgetCostInfo, AlertStatus } from '@ce/utils/budgetUtils'
import formatCost from '@ce/utils/formatCost'
import type { BudgetSummary, Maybe } from 'services/ce/services'
import css from './BudgetDetailsSummary.module.scss'

const BAR_WIDTH = 344

interface CostBarsProps {
  title: string
  cost: number
  percentage: number
  width: number
  className?: string
  showPercentage?: boolean
}

const CostBars: (props: CostBarsProps) => JSX.Element | null = ({
  title,
  cost,
  percentage,
  width,
  className,
  showPercentage = true
}) => {
  const [barWidth, setBarWidth] = useState(0)

  useEffect(() => {
    setBarWidth(width)
  }, [width])

  return (
    <Layout.Horizontal>
      <Text className={css.budgetBarsText} font={{ variation: FontVariation.SMALL_SEMI }} width={120}>
        {title}
      </Text>
      <Layout.Horizontal>
        <Container width={barWidth} className={cx(css.costBars, className)}>
          <Text
            className={css.budgetBarsText}
            font={{ variation: FontVariation.SMALL_SEMI }}
            padding={{
              left: 'xsmall'
            }}
            lineClamp={1}
          >
            {formatCost(cost)}
          </Text>
        </Container>
        {showPercentage ? (
          <Text
            className={css.budgetBarsText}
            font={{ variation: FontVariation.SMALL_SEMI }}
            padding={{
              left: 'xsmall'
            }}
          >{`${Math.round(percentage)}%`}</Text>
        ) : null}
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

interface AlertsInfoProps {
  title: string
  alertList: Maybe<number>[]
}

const AlertsInfo: (props: AlertsInfoProps) => JSX.Element = ({ title, alertList }) => {
  const renderAlertList = () => {
    if (!alertList.length) {
      return (
        <Text color={Color.GREY_800} font={{ variation: FontVariation.SMALL_SEMI }}>
          -
        </Text>
      )
    }
    return (
      <>
        {alertList.slice(0, 5).map(alert => (
          <Text
            color={Color.GREY_800}
            font={{ variation: FontVariation.SMALL_SEMI }}
            icon="notifications"
            iconProps={{
              color: Color.GREY_300,
              size: 10
            }}
            key={alert}
          >
            {`${alert}%`}
          </Text>
        ))}
        {alertList.length > 5 ? (
          <Text
            color={Color.GREY_800}
            font={{ variation: FontVariation.SMALL_SEMI }}
            iconProps={{
              color: Color.GREY_300,
              size: 10
            }}
            tooltip={
              <Container padding="small">
                {alertList.map(alert => (
                  <Text
                    color={Color.GREY_800}
                    font={{ variation: FontVariation.SMALL_SEMI }}
                    icon="notifications"
                    iconProps={{
                      color: Color.GREY_300,
                      size: 10
                    }}
                    key={alert}
                  >
                    {`${alert}%`}
                  </Text>
                ))}
              </Container>
            }
            alwaysShowTooltip
          >{`+(${alertList.length - 5})`}</Text>
        ) : null}
      </>
    )
  }
  return (
    <Layout.Horizontal
      margin={{
        top: 'large',
        bottom: 'medium'
      }}
    >
      <Text className={css.alertText} font={{ variation: FontVariation.SMALL_SEMI }}>
        {title}
      </Text>
      <Layout.Horizontal spacing="small">{renderAlertList()}</Layout.Horizontal>
    </Layout.Horizontal>
  )
}

interface BudgetDetailsSummaryProps {
  summaryData: BudgetSummary
}

const BudgetDetailsSummary: (props: BudgetDetailsSummaryProps) => JSX.Element | null = ({ summaryData }) => {
  const { getString } = useStrings()

  if (!summaryData) {
    return null
  }

  const { budgetAmount, actualCost, forecastCost, actualCostAlerts, forecastCostAlerts } = summaryData
  const { actualCostStatus, forecastedCostStatus, budgetAmountStatus } = getAllBudgetCostInfo(
    forecastCost,
    actualCost,
    budgetAmount
  )

  return (
    <Layout.Horizontal margin="large" spacing="large">
      <Card elevation={1} className={css.budgetStatus}>
        <Layout.Horizontal>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.budgets.detailsPage.budgetStatus', {
              timeScope: summaryData.timeScope
            })}
          </Text>
          <FlexExpander />
          <Text color={Color.GREY_800} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.budgets.detailsPage.timeLeft', {
              timeLeft: summaryData.timeLeft,
              timeUnit: summaryData.timeUnit
            })}
          </Text>
        </Layout.Horizontal>
        <Layout.Vertical margin={{ top: 'small' }}>
          <CostBars
            title={getString('ce.budgets.detailsPage.monthToDateCost')}
            cost={actualCostStatus.cost}
            percentage={actualCostStatus.percentage}
            width={Math.floor(actualCostStatus.ratio * BAR_WIDTH)}
            className={cx(
              css.actualCostBar,
              { [css.alert]: actualCostStatus.status === AlertStatus.Warning },
              { [css.danger]: actualCostStatus.status === AlertStatus.Danger }
            )}
          />
          <CostBars
            title={getString('ce.budgets.detailsPage.budgetAmount')}
            cost={budgetAmountStatus.cost}
            percentage={budgetAmountStatus.percentage}
            width={Math.floor(budgetAmountStatus.ratio * BAR_WIDTH)}
            className={css.budgetBar}
            showPercentage={false}
          />
          <CostBars
            width={Math.floor(forecastedCostStatus.ratio * BAR_WIDTH)}
            title={getString('ce.perspectives.budgets.forecastedCost')}
            cost={forecastedCostStatus.cost}
            percentage={forecastedCostStatus.percentage}
            className={cx(
              css.forecastCostBar,
              { [css.alert]: forecastedCostStatus.status === AlertStatus.Warning },
              { [css.danger]: forecastedCostStatus.status === AlertStatus.Danger }
            )}
          />
        </Layout.Vertical>
      </Card>
      <Card className={css.alertCard}>
        <Layout.Horizontal>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('ce.budgets.detailsPage.alertsAt')}
          </Text>
        </Layout.Horizontal>
        <AlertsInfo title={getString('ce.budgets.detailsPage.monthToDateCost')} alertList={actualCostAlerts} />
        <AlertsInfo title={getString('ce.perspectives.budgets.forecastedCost')} alertList={forecastCostAlerts} />
      </Card>
    </Layout.Horizontal>
  )
}

export default BudgetDetailsSummary
