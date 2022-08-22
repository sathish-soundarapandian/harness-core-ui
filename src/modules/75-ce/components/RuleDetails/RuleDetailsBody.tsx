/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { Color, Container, FontVariation, Icon, Layout, PageBody, Tab, Tabs, Text, Utils } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import {
  Service,
  ServiceDep,
  ServiceSavings,
  useAllServiceResources,
  useGetAccessPoint,
  useHealthOfService,
  useSavingsOfService
} from 'services/lw'
import type { TimeRangeFilterType } from '@ce/types'
import { CE_DATE_FORMAT_INTERNAL, DATE_RANGE_SHORTCUTS, getStaticSchedulePeriodTime } from '@ce/utils/momentUtils'
import TimeRangePicker from '@ce/common/TimeRangePicker/TimeRangePicker'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import formatCost from '@ce/utils/formatCost'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { GatewayKindType, RulesMode } from '@ce/constants'
import { convertNumberToFixedDecimalPlaces } from '@ce/utils/convertNumberToFixedDecimalPlaces'
import { Utils as CEUtils } from '@ce/common/Utils'
import EmptyView from '@ce/images/empty-state.svg'
import COGatewayLogs from '../COGatewayList/COGatewayLogs'
import RuleDetailsTabContainer from './RuleDetailsTabContainer'
import CLITabContainer from './CLITabContainer'
import CEChart from '../CEChart/CEChart'
import css from './RuleDetailsBody.module.scss'

interface RulesDetailsBodyProps {
  service: Service
  connectorData?: ConnectorInfoDTO
  dependencies?: ServiceDep[]
  setService: (data?: Service) => void
}

interface RuleDataVisulisationProps {
  service?: Service
}

interface CostCardProps {
  title: string
  changeInPercentage?: number | string
  cost: string
  intent: 'saving' | 'spend' | 'potential'
  loading?: boolean
}

const CostCard: React.FC<CostCardProps> = ({ title, changeInPercentage, cost, intent, loading }) => {
  return (
    <Layout.Vertical
      className={cx(css.costWidget, {
        [css.savingsWidget]: intent === 'saving',
        [css.spendWidget]: intent === 'spend'
      })}
      spacing="small"
    >
      <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Text className={css.costText} font={{ variation: FontVariation.BODY2_SEMI }}>
          {title}
        </Text>
        {changeInPercentage ? (
          /* istanbul ignore next */ <Text font={{ variation: FontVariation.SMALL }}>{changeInPercentage}</Text>
        ) : null}
      </Layout.Horizontal>
      {loading ? (
        /* istanbul ignore next */ <Container>
          <Layout.Horizontal flex>
            <Icon name="spinner" size={28} />
          </Layout.Horizontal>
        </Container>
      ) : (
        <Text className={css.costText} font={{ variation: FontVariation.H2 }}>
          {cost}
        </Text>
      )}
    </Layout.Vertical>
  )
}

const RulesDetailsBody: React.FC<RulesDetailsBodyProps> = ({ service, connectorData, dependencies, setService }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const hasAsg = !isEmpty(get(service, 'routing.instance.scale_group'))
  const isK8sRule = service.kind === GatewayKindType.KUBERNETES

  const { data: healthState, refetch: refetchHealthState } = useHealthOfService({
    account_id: accountId,
    rule_id: service.id as number,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { data: accessPointData } = useGetAccessPoint({
    account_id: accountId,
    lb_id: service.access_point_id as string,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { data: resources } = useAllServiceResources({
    account_id: accountId,
    rule_id: service.id as number,
    debounce: 300,
    lazy: isK8sRule || hasAsg
  })

  return (
    <PageBody className={css.ruleDetailsBody}>
      <Layout.Horizontal>
        <RuleDataVisulisation service={service} />
        <div className={css.colDivider} />
        <Container className={css.col2}>
          <Tabs id={'ruleDetailsTabs'}>
            <Tab
              id={'details'}
              title={getString('details')}
              panel={
                <RuleDetailsTabContainer
                  service={service}
                  healthStatus={get(healthState, 'response.state', '')}
                  refetchHealthStatus={refetchHealthState}
                  connectorData={connectorData}
                  accessPointData={get(accessPointData, 'response')}
                  resources={get(resources, 'response')}
                  dependencies={dependencies}
                  setService={setService}
                />
              }
            />
            <Tab
              id={'ssh'}
              title={getString('ce.co.ruleDetails.sshTab.cli')}
              panel={<CLITabContainer ruleName={get(service, 'name', '')} connectorData={connectorData} />}
            />
          </Tabs>
        </Container>
      </Layout.Horizontal>
    </PageBody>
  )
}

const RuleDataVisulisation: React.FC<RuleDataVisulisationProps> = ({ service }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const [timeRange, setTimeRange] = useState<TimeRangeFilterType>({
    to: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
    from: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
  })

  const {
    data: savingsData,
    refetch: refetchSavingsData,
    loading
  } = useSavingsOfService({
    account_id: accountId,
    rule_id: get(service, 'id') as number,
    queryParams: {
      accountIdentifier: accountId,
      from: timeRange.from,
      to: timeRange.to,
      group_by: 'date'
    },
    lazy: true
  })

  useEffect(() => {
    /* istanbul ignore else */
    if (service) {
      refetchSavingsData()
    }
  }, [service, timeRange.from, timeRange.to])

  const totalSavings = useMemo(() => {
    return defaultTo(
      defaultTo(get(savingsData, 'response') as ServiceSavings[], []).reduce(
        (acc, curr) => acc + (curr.actual_savings as number),
        0
      ),
      0
    )
  }, [savingsData?.response])

  const totalActualCost = useMemo(() => {
    return defaultTo(
      defaultTo(get(savingsData, 'response') as ServiceSavings[], []).reduce(
        (acc, curr) => acc + (curr.actual_cost as number),
        0
      ),
      0
    )
  }, [savingsData?.response])

  const totalPotentialCost = useMemo(() => {
    return defaultTo(
      defaultTo(get(savingsData, 'response') as ServiceSavings[], []).reduce(
        (acc, curr) => acc + (curr.potential_cost as number),
        0
      ),
      0
    )
  }, [savingsData?.response])

  return (
    <Container className={css.col1}>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Text font={{ variation: FontVariation.H3 }}>{getString('summary')}</Text>
        <TimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />
      </Layout.Horizontal>
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }} margin={{ top: 'medium', bottom: 'medium' }}>
        <CostCard
          title={getString('ce.co.ruleDetails.totalSavings')}
          cost={formatCost(totalSavings, {
            decimalPoints: 2
          })}
          intent="saving"
          loading={loading}
        />
        <CostCard
          title={getString('ce.co.ruleDetails.totalActualSpend')}
          cost={formatCost(totalActualCost, {
            decimalPoints: 2
          })}
          intent="spend"
          loading={loading}
        />
        <CostCard
          title={getString('ce.co.ruleDetails.potentialCost')}
          cost={formatCost(totalPotentialCost, {
            decimalPoints: 2
          })}
          intent="potential"
          loading={loading}
        />
      </Layout.Horizontal>
      <CostChart
        data={get(savingsData, 'response') as ServiceSavings[]}
        mode={CEUtils.getConditionalResult(get(service, 'opts.dry_run', false), RulesMode.DRY, RulesMode.ACTIVE)}
      />
      <Layout.Vertical spacing={'medium'} className={css.logsContainer}>
        <Text font={{ variation: FontVariation.H6 }}>{getString('ce.co.ruleDetails.logsHeader')}</Text>
        <COGatewayLogs service={service} />
      </Layout.Vertical>
    </Container>
  )
}

const CostChart = ({ data, mode }: { data?: ServiceSavings[]; mode: RulesMode }) => {
  const { getString } = useStrings()
  const isDryRunMode = mode === RulesMode.DRY
  const savingsColor = { primary: '#06B7C3', secondary: '#D3FCFE' }
  const spendColor = { primary: '#6938C0', secondary: '#EADEFF' }
  const [savingsData, spendData, potentialCostData] = useMemo(() => {
    const savings: Array<[number, number]> = [],
      spend: Array<[number, number]> = [],
      potentialCost: Array<[number, number]> = []
    defaultTo(data, []).map(item => {
      const date = getStaticSchedulePeriodTime(item.usage_date as string)
      savings.push([date, convertNumberToFixedDecimalPlaces(item.actual_savings as number, 2)])
      spend.push([date, convertNumberToFixedDecimalPlaces(item.actual_cost as number, 2)])
      potentialCost.push([date, convertNumberToFixedDecimalPlaces(item.potential_cost as number, 2)])
    })
    return [savings, spend, potentialCost]
  }, [data])

  return (
    <Layout.Vertical spacing="large" style={{ flex: 3 }} margin={{ right: 'xxlarge', top: 'medium', bottom: 'medium' }}>
      <Text font={{ variation: FontVariation.H6 }}>{getString('ce.co.ruleDetails.costGraphHeader')}</Text>
      {isEmpty(data) ? (
        /* istanbul ignore next */ <Layout.Vertical flex>
          <img src={EmptyView} />
          <Text>{getString('ce.noSavingsDataMessage')}</Text>
        </Layout.Vertical>
      ) : (
        <CEChart
          options={
            {
              chart: {
                type: 'column',
                height: 200,
                backgroundColor: 'transparent'
              },
              xAxis: {
                labels: {
                  formatter: /* istanbul ignore next */ function () {
                    const date = new Date(this.value)
                    return `${date.getMonth() + 1}/${date.getDate()}`
                  }
                },
                type: 'datetime',
                lineWidth: 0,
                plotLines: [
                  {
                    dashStyle: 'Dash'
                  }
                ],
                tickLength: 0
              } as Highcharts.XAxisOptions,
              yAxis: {
                min: 0,
                title: {
                  text: ''
                },
                stackLabels: {
                  enabled: false
                },
                labels: {
                  formatter: /* istanbul ignore next */ function () {
                    return this.value === 0 ? this.value : `$${this.value}`
                  }
                }
              } as Highcharts.YAxisOptions,
              tooltip: {
                headerFormat: '<b>{point.key}</b><br/>',
                pointFormat: '{series.name}: ${point.y}'
              },
              plotOptions: {
                column: {
                  stacking: 'normal',
                  dataLabels: {
                    enabled: false
                  },
                  borderWidth: CEUtils.getConditionalResult(isDryRunMode, 1, 0)
                },
                spline: {
                  color: Utils.getRealCSSColor(Color.GREY_300),
                  marker: { enabled: false }
                }
              },
              legend: {
                enabled: false
              },
              series: [
                {
                  name: 'Savings',
                  type: 'column',
                  data: savingsData,
                  color: CEUtils.getConditionalResult(isDryRunMode, savingsColor.secondary, savingsColor.primary),
                  borderColor: savingsColor.primary,
                  showInLegend: false,
                  // className: css.colChartBorderRadius,
                  dashStyle: 'Dash'
                },
                {
                  name: 'Spend',
                  type: 'column',
                  data: spendData,
                  dashStyle: 'Dash',
                  borderColor: spendColor.primary,
                  showInLegend: false,
                  color: CEUtils.getConditionalResult(isDryRunMode, spendColor.secondary, spendColor.primary)
                },
                {
                  name: 'Cost',
                  type: 'spline',
                  data: potentialCostData,
                  dashStyle: 'Dash'
                }
              ]
            } as Highcharts.Options
          }
        />
      )}
    </Layout.Vertical>
  )
}

export default RulesDetailsBody
