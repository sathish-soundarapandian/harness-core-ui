/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import HighchartsReact from 'highcharts-react-official'
import Highcharts, { SeriesOptionsType } from 'highcharts'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetUserFlagOverview } from 'services/cf'
import { useStrings } from 'framework/strings'
import { numberFormatter } from '@common/utils/utils'
import routes from '@common/RouteDefinitions'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from '../EmptyState/EmptyStateExpandedView'
import EmptyStateCollapsedView from '../EmptyState/EmptyStateCollapsedView'
import DefaultFooter from '../EmptyState/DefaultFooter'
import ErrorCard from '../../ErrorCard/ErrorCard'
import css from '../ModuleOverview.module.scss'

const getConfig = (data: SeriesOptionsType[], isExpanded: boolean, total: string): Highcharts.Options => {
  return {
    chart: {
      type: 'pie',
      height: '100%',
      margin: [0, 0, 0, 0],
      animation: false
    },
    title: {
      text: isExpanded
        ? `<div style='display:flex;flex-flow: column;align-items: center;font-family: "Inter", sans-serif;'><div style="font-size: 13px;margin-bottom: 8px">Total Flags</div><div style="font-size: 34px;font-weight: bold">${total}</div></div>`
        : '',
      useHTML: true,
      verticalAlign: 'middle'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        slicedOffset: 0,
        dataLabels: {
          enabled: false
        }
      },
      series: {
        animation: false,
        states: {
          hover: {
            enabled: false
          }
        }
      }
    },
    series: data,
    credits: {
      enabled: false
    },
    tooltip: {
      enabled: false
    }
  }
}

const ENABLED_COLOR = '#EE8625'
const DISABLED_COLOR = '#D9D9D9'

const CountRow: React.FC<{ count: number; isEnabled?: boolean }> = ({ count, isEnabled }) => {
  const { getString } = useStrings()
  return (
    <Container>
      <Text font={{ variation: FontVariation.H4 }} padding={{ left: 'medium' }} data-testid="countRowText">
        {numberFormatter(count)}
      </Text>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
        <div className={css.ffColorBox} style={{ backgroundColor: isEnabled ? ENABLED_COLOR : DISABLED_COLOR }} />
        <Text font={{ variation: FontVariation.SMALL }} padding={{ left: 'small' }}>
          {isEnabled ? getString('enabledLabel') : getString('common.disabled')}
        </Text>
      </Layout.Horizontal>
    </Container>
  )
}

const CFModuleOverview: React.FC<ModuleOverviewBaseProps> = ({ isExpanded, isEmptyState }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  const { data, loading, error, refetch } = useGetUserFlagOverview({ queryParams: { accountIdentifier: accountId } })

  if (isEmptyState) {
    if (isExpanded) {
      return (
        <EmptyStateExpandedView
          title={'common.moduleDetails.ff.expanded.title'}
          description={[
            'common.moduleDetails.ff.expanded.list.one',
            'common.moduleDetails.ff.expanded.list.two',
            'common.moduleDetails.ff.expanded.list.three'
          ]}
          footer={
            <DefaultFooter
              learnMoreLink="https://docs.harness.io/category/vjolt35atg-feature-flags"
              getStartedLink={routes.toCF({ accountId })}
            />
          }
        />
      )
    }

    return <EmptyStateCollapsedView description={'common.moduleDetails.ff.collapsed.title'} />
  }

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height="100%">
        <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
      </Container>
    )
  }

  if (error) {
    return (
      <ErrorCard
        onRetry={() => {
          refetch()
        }}
      />
    )
  }

  const { total = 0, enabled = 0 } = data || {}
  const disabled = total - enabled

  return (
    <Layout.Horizontal
      flex={{ alignItems: 'center', justifyContent: isExpanded ? 'center' : 'flex-start' }}
      height="100%"
    >
      <Container width={isExpanded ? '200px' : '65px'} margin={{ top: 'small', bottom: 'small', right: 'small' }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={getConfig(
            [
              {
                type: 'pie',
                data: [
                  {
                    name: getString('enabledLabel'),
                    y: enabled,
                    color: ENABLED_COLOR
                  },
                  {
                    name: getString('common.disabled'),
                    y: disabled,
                    color: DISABLED_COLOR
                  }
                ],
                size: '100%',
                innerSize: '65%'
              }
            ],
            isExpanded,
            numberFormatter(total)
          )}
        />
      </Container>
      {isExpanded ? (
        <Layout.Vertical padding={{ left: 'large' }}>
          <Container margin={{ bottom: 'medium' }}>
            <CountRow count={enabled} isEnabled />
          </Container>
          <CountRow count={disabled} />
        </Layout.Vertical>
      ) : (
        <Layout.Vertical flex={{ justifyContent: 'center', alignItems: 'flex-start' }}>
          <Text inline style={{ fontSize: '8px' }}>
            <Text inline font={{ variation: FontVariation.H4 }} data-testid="collapsedEnabledCount">
              {numberFormatter(enabled)}
            </Text>
            <Text inline font={{ variation: FontVariation.TINY }} color={Color.GREY_400}>
              {` / ${numberFormatter(total)}`}
            </Text>
          </Text>
          <Text font={{ variation: FontVariation.TINY }} color={Color.GREY_400} style={{ fontSize: '8px' }}>
            {getString('common.enabledFlags')}
          </Text>
        </Layout.Vertical>
      )}
    </Layout.Horizontal>
  )
}

export default CFModuleOverview
