/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Color } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import { Layout, Text } from '@harness/uicore'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { GetActiveServiceInstanceSummaryQueryParams, useGetActiveServiceInstanceSummary } from 'services/cd-ng'
import { PieChart, PieChartProps } from '@cd/components/PieChart/PieChart'
import { useStrings } from 'framework/strings'
import { INVALID_CHANGE_RATE } from '@cd/components/Services/common'
import { numberFormatter } from '@common/utils/utils'
import { startOfDay } from '@common/components/TimeRangeSelector/TimeRangeSelector'
import { Ticker } from '@common/components/Ticker/Ticker'
import css from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances.module.scss'

export const ActiveServiceInstancesHeader: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()

  const queryParams: GetActiveServiceInstanceSummaryQueryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      serviceId,
      timestamp: startOfDay(moment().subtract(1, 'month').add(1, 'day')).getTime()
    }),
    [accountId, orgIdentifier, projectIdentifier, serviceId]
  )
  const { data, error } = useGetActiveServiceInstanceSummary({ queryParams })

  if (error) {
    return <></>
  }

  const { nonProdInstances = 0, prodInstances = 0, totalInstances = 0 } = data?.data?.countDetails || {}

  const changeRate = data?.data?.changeRate || 0

  const pieChartProps: PieChartProps = {
    items: [
      {
        label: getString('cd.serviceDashboard.nonProd'),
        value: nonProdInstances,
        formattedValue: numberFormatter(nonProdInstances),
        color: 'var(--primary-2)'
      },
      {
        label: getString('cd.serviceDashboard.prod'),
        value: prodInstances,
        formattedValue: numberFormatter(prodInstances),
        color: 'var(--primary-7)'
      }
    ],
    size: 36,
    labelContainerStyles: css.pieChartLabelContainerStyles,
    labelStyles: css.pieChartLabelStyles,
    options: {
      tooltip: {
        enabled: false
      }
    }
  }
  const labelsHtml = (
    <Layout.Vertical className={css.labelStyles}>
      {!isEmpty(pieChartProps.items) ? (
        <ul>
          {pieChartProps.items.map(({ label, formattedValue, value, color }) => (
            <li style={{ color }} key={`${label}_${value}`}>
              <Text className={css.listStyles} key={label}>{`${label} (${
                formattedValue ? formattedValue : value
              })`}</Text>
            </li>
          ))}
        </ul>
      ) : null}
    </Layout.Vertical>
  )

  pieChartProps['labelsContent'] = labelsHtml

  const isBoostMode = changeRate === INVALID_CHANGE_RATE
  const tickerColor = isBoostMode || changeRate > 0 ? Color.GREEN_600 : Color.RED_500

  return (
    <Layout.Horizontal
      flex={{ alignItems: 'center', justifyContent: 'space-between' }}
      padding={{ bottom: 'small' }}
      className={css.activeServiceInstancesHeader}
    >
      <Layout.Horizontal>
        <Text
          font={{ weight: 'bold' }}
          color={Color.GREY_800}
          className={css.instanceCount}
          margin={{ right: 'large' }}
        >
          {numberFormatter(totalInstances)}
        </Text>
        <Layout.Vertical flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <Ticker
            value={
              isBoostMode ? (
                <></>
              ) : (
                <Text font={{ size: 'xsmall' }} color={tickerColor}>{`${numberFormatter(Math.abs(changeRate), {
                  truncate: false
                })}%`}</Text>
              )
            }
            decreaseMode={!isBoostMode && changeRate < 0}
            boost={isBoostMode}
            color={tickerColor}
            size={isBoostMode ? 10 : 6}
          />
          <Text font={{ size: 'xsmall' }}>
            {getString('cd.serviceDashboard.in', {
              timeRange: getString('common.duration.month').toLocaleLowerCase()
            })}
          </Text>
        </Layout.Vertical>
      </Layout.Horizontal>
      <Layout.Horizontal>{totalInstances ? <PieChart {...pieChartProps} /> : <></>}</Layout.Horizontal>
    </Layout.Horizontal>
  )
}
