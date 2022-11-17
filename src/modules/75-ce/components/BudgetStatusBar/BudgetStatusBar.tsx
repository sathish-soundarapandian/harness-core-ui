/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Layout, Text, Container } from '@harness/uicore'
import cx from 'classnames'
import { FontVariation, Color } from '@harness/design-system'
import type { BudgetSummary } from 'services/ce/services'
import { getAllBudgetCostInfo, getAllBudgetCostInfoReturnType, AlertStatus } from '@ce/utils/budgetUtils'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import css from './BudgetStatusBar.module.scss'

const BAR_WIDTH = 266

interface BudgetStatusBarProps {
  rowData: BudgetSummary
}

const BudgetStatusBar: (props: BudgetStatusBarProps) => JSX.Element | null = ({ rowData }) => {
  const { getString } = useStrings()

  const [costState, setCostState] = useState<getAllBudgetCostInfoReturnType>({
    actualCostStatus: {
      cost: 0,
      ratio: 0,
      percentage: 0,
      status: AlertStatus.Info
    },
    forecastedCostStatus: {
      cost: 0,
      ratio: 0,
      percentage: 0,
      status: AlertStatus.Info
    },
    budgetAmountStatus: {
      cost: 0,
      ratio: 0,
      percentage: 0,
      status: AlertStatus.Info
    }
  })

  const [widthState, setWidthState] = useState({
    actualCostBarWidth: 0,
    forecastCostBarWidth: 0,
    budgetCostBarWidth: 0
  })

  useEffect(() => {
    const actualCost = rowData.actualCost || 0
    const budgetAmount = rowData.budgetAmount || 1
    const forecastCost = rowData.forecastCost

    const { actualCostStatus, forecastedCostStatus, budgetAmountStatus } = getAllBudgetCostInfo(
      forecastCost,
      actualCost,
      budgetAmount
    )

    setCostState({
      actualCostStatus,
      forecastedCostStatus,
      budgetAmountStatus
    })

    const actualCostBarWidth = Math.floor(BAR_WIDTH * actualCostStatus.ratio)
    const forecastCostBarWidth = Math.floor(BAR_WIDTH * forecastedCostStatus.ratio)
    const budgetCostBarWidth = Math.floor(BAR_WIDTH * budgetAmountStatus.ratio)
    setWidthState({
      actualCostBarWidth,
      forecastCostBarWidth,
      budgetCostBarWidth
    })
  }, [rowData])

  return (
    <Layout.Horizontal
      spacing="xsmall"
      padding={{
        top: 'medium'
      }}
    >
      <Text color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
        {formatCost(0)}
      </Text>
      <Container className={css.budgetBar} width={BAR_WIDTH} background={Color.GREY_200}>
        <div
          style={{
            width: widthState.actualCostBarWidth
          }}
          className={cx(
            css.actualCostBar,
            { [css.alert]: costState.actualCostStatus.status === AlertStatus.Warning },
            { [css.danger]: costState.actualCostStatus.status === AlertStatus.Danger }
          )}
        ></div>

        <div
          style={{
            width: widthState.forecastCostBarWidth
          }}
          className={cx(
            css.forecastedBar,
            { [css.alert]: costState.forecastedCostStatus.status === AlertStatus.Warning },
            { [css.danger]: costState.forecastedCostStatus.status === AlertStatus.Danger }
          )}
        ></div>

        {costState.forecastedCostStatus.status === AlertStatus.Danger ? (
          <div
            style={{
              width: widthState.budgetCostBarWidth
            }}
            className={css.budgetStatusBar}
          ></div>
        ) : null}

        <div
          style={{
            left: widthState.actualCostBarWidth
          }}
          className={cx(
            css.actualCostMarker,
            { [css.alert]: costState.actualCostStatus.status === AlertStatus.Warning },
            { [css.danger]: costState.actualCostStatus.status === AlertStatus.Danger }
          )}
        ></div>

        <Text
          font={{ variation: FontVariation.SMALL_BOLD }}
          padding={{
            right: 'xsmall',
            left: 'xsmall'
          }}
          style={{
            left: widthState.actualCostBarWidth
          }}
          className={cx(css.actualCost, { [css.left]: widthState.actualCostBarWidth > 80 })}
        >
          {formatCost(costState.actualCostStatus.cost)}
        </Text>

        <div
          style={{
            left: widthState.forecastCostBarWidth,
            opacity: costState.forecastedCostStatus.cost > costState.budgetAmountStatus.cost ? 1 : 0
          }}
          className={css.overBudgetMarker}
        ></div>

        <Text
          font={{ variation: FontVariation.SMALL_BOLD }}
          padding={{
            right: 'xsmall',
            left: 'xsmall'
          }}
          color={Color.RED_700}
          icon="execution-warning"
          iconProps={{
            color: Color.RED_500,
            size: 14
          }}
          style={{
            left: widthState.forecastCostBarWidth,
            opacity: costState.forecastedCostStatus.cost > costState.budgetAmountStatus.cost ? 1 : 0
          }}
          className={css.overBudgetText}
        >
          {getString('ce.budgets.listPage.overBudgetText', {
            cost: formatCost(costState.forecastedCostStatus.cost - costState.budgetAmountStatus.cost)
          })}
        </Text>
      </Container>
      <Text
        color={costState.forecastedCostStatus.cost > costState.budgetAmountStatus.cost ? Color.RED_800 : Color.GREY_400}
        font={{ variation: FontVariation.TINY }}
      >
        {formatCost(
          costState.forecastedCostStatus.cost > costState.budgetAmountStatus.cost
            ? costState.forecastedCostStatus.cost
            : costState.budgetAmountStatus.cost
        )}
      </Text>
    </Layout.Horizontal>
  )
}

export default BudgetStatusBar
