/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useImperativeHandle, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Card, Container, LabelPosition, Layout, Text, WeightedStack, PageError } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { useStrings, UseStringsReturn } from 'framework/strings'
// import { Ticker, TickerVerticalAlignment } from '@common/components/Ticker/Ticker'
import { DeploymentsTimeRangeContext, getFixed } from '@cd/components/Services/common'
import {
  ChangeRate,
  DashboardWorkloadDeploymentV2,
  GetWorkloadsQueryParams,
  useGetWorkloadsV2,
  WorkloadDeploymentInfoV2
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FAIL_COLORS, SUCCESS_COLORS } from '@dashboards/constants'
import { PageSpinner } from '@common/components'
import MostActiveServicesEmptyState from '@cd/icons/MostActiveServicesEmptyState.svg'
import { getFormattedTimeRange } from '@cd/pages/dashboard/dashboardUtils'
import css from '@cd/components/Services/MostActiveServicesWidget/MostActiveServicesWidget.module.scss'

interface MostActiveServicesWidgetData {
  label: string
  value: number
  color: string
  change: number
}

export interface MostActiveServicesWidgetProps {
  environmentTypes?: Record<string, GetWorkloadsQueryParams['environmentType']>
  types?: {
    [key: string]: {
      label: string
      colors?: string[]
    }
  }
  title?: string
  parseByType?: (dataInfo: DashboardWorkloadDeploymentV2 | []) => MostActiveServicesWidgetData[]
}

enum DEFAULT_TYPES_ENUM {
  DEPLOYMENTS = 'DEFAULT_TYPES_ENUM.DEPLOYMENTS',
  ERRORS = 'DEFAULT_TYPES_ENUM.ERRORS'
}

const getDefaultEnvironments = (
  getString: UseStringsReturn['getString']
): { [key: string]: GetWorkloadsQueryParams['environmentType'] } => {
  return {
    [getString('all')]: undefined,
    [getString('cd.serviceDashboard.prod')]: 'Production',
    [getString('cd.serviceDashboard.nonProd')]: 'PreProduction'
  }
}

const getDefaultTypes = (getString: UseStringsReturn['getString']) => {
  return {
    [DEFAULT_TYPES_ENUM.DEPLOYMENTS]: {
      label: getString('deploymentsText'),
      colors: SUCCESS_COLORS
    },
    [DEFAULT_TYPES_ENUM.ERRORS]: {
      label: getString('errors'),
      colors: FAIL_COLORS
    }
  }
}

export interface MostActiveServicesRef {
  refetchData: () => void
}
export const MostActiveServicesWidget = (
  props: MostActiveServicesWidgetProps,
  ref: React.ForwardedRef<MostActiveServicesRef>
) => {
  const { getString } = useStrings()

  const defaultParseByType = useCallback(
    (dataInfo: DashboardWorkloadDeploymentV2 | [], selectedTypeInfo: string): MostActiveServicesWidgetData[] => {
      const items = ((dataInfo as DashboardWorkloadDeploymentV2)?.workloadDeploymentInfoList || []).map(
        (workloadDeploymentInfo: WorkloadDeploymentInfoV2) => {
          const {
            totalDeployments = 0,
            failureRate = 0,
            percentSuccess = 0,
            failureRateChangeRate,
            rateSuccess
          } = workloadDeploymentInfo
          let value = (workloadDeploymentInfo as any)?.totalSuccess || (totalDeployments * percentSuccess) / 100
          if (selectedTypeInfo === DEFAULT_TYPES_ENUM.ERRORS) {
            value = (workloadDeploymentInfo as any)?.totalFailure || (totalDeployments * failureRate) / 100
          }
          const change = selectedTypeInfo === DEFAULT_TYPES_ENUM.DEPLOYMENTS ? rateSuccess : failureRateChangeRate
          const rateChange = (change as ChangeRate)?.percentChange
          return {
            label: workloadDeploymentInfo.serviceName || '',
            value: getFixed(value),
            change: defaultTo(rateChange, 0)
          }
        }
      )
      items.sort((itemA, itemB) => (itemA.value > itemB.value ? -1 : 1))
      const colorList = types[selectedTypeInfo].colors || [Color.BLACK]
      return items
        .map((item, index) => ({ ...item, color: colorList[Math.min(index, colorList.length - 1)] }))
        .filter(item => item.value)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  )

  const DEFAULT_ENVIRONMENT_TYPES = useMemo(
    () => getDefaultEnvironments(getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const DEFAULT_TYPES = useMemo(
    () => getDefaultTypes(getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const {
    environmentTypes = DEFAULT_ENVIRONMENT_TYPES,
    types = DEFAULT_TYPES,
    title,
    parseByType = defaultParseByType
  } = props
  const [selectedEnvironmentType, setSelectedEnvironmentType] = useState(Object.keys(environmentTypes)[0])
  const [selectedType, setSelectedType] = useState(Object.keys(types)[0])
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { timeRange } = useContext(DeploymentsTimeRangeContext)
  const [startTime, endTime] = getFormattedTimeRange(timeRange)

  const queryParams: GetWorkloadsQueryParams = useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      startTime,
      endTime,
      environmentType: environmentTypes[selectedEnvironmentType]
    }
  }, [accountId, orgIdentifier, projectIdentifier, timeRange, environmentTypes, selectedEnvironmentType])

  const {
    loading: workloadLoading,
    error: workloadsError,
    data: workloadsInfo,
    refetch: workloadsRefetch
  } = useGetWorkloadsV2({ queryParams })

  const data = useMemo(
    () => parseByType(workloadsInfo?.data || [], selectedType),
    [workloadsInfo?.data, selectedType, parseByType]
  )

  const EnvironmentTypeComponent = useMemo(
    () => (
      <Layout.Horizontal>
        {Object.keys(environmentTypes).map(environmentTypeKey => (
          <Text
            key={environmentTypeKey}
            font={{ size: 'small', weight: 'semi-bold' }}
            intent={environmentTypeKey === selectedEnvironmentType ? 'primary' : 'none'}
            className={css.environmentType}
            onClick={() => setSelectedEnvironmentType(environmentTypeKey)}
            data-test="mostActiveServicesWidgetEnvironmentType"
          >
            {environmentTypeKey}
          </Text>
        ))}
      </Layout.Horizontal>
    ),
    [environmentTypes, selectedEnvironmentType]
  )

  useImperativeHandle(ref, () => ({
    refetchData() {
      workloadsRefetch()
    }
  }))

  //temporarily hiding tickers

  /*
  const Tickers = useMemo(() => {
    return data.map((service, index) => {
      const { change } = service
      const isBoostMode = change === INVALID_CHANGE_RATE
      const [color, tickerValueStyle] =
        (selectedType === DEFAULT_TYPES_ENUM.DEPLOYMENTS && !isBoostMode && change < 0) ||
        (selectedType === DEFAULT_TYPES_ENUM.ERRORS && (isBoostMode || change > 0))
          ? [Color.RED_500, css.tickerValueRed]
          : [Color.GREEN_600, css.tickerValueGreen]
      return (
        <div className={css.tickerContainer} key={index}>
          {change !== undefined ? (
            <Ticker
              value={isBoostMode ? '' : `${getFixed(Math.abs(change))}%`}
              color={color}
              tickerValueStyles={cx(css.tickerValueStyles, tickerValueStyle)}
              verticalAlign={TickerVerticalAlignment.CENTER}
              decreaseMode={!isBoostMode && change < 0}
              boost={isBoostMode}
              size={isBoostMode ? 10 : 6}
            />
          ) : (
            <></>
          )}
        </div>
      )
    })
  }, [data])
  */

  const weightedStackData = useMemo(
    () =>
      data.map((service: any) => ({
        label: service.label,
        value: service.value,
        color: service.color
      })),
    [data]
  )

  const TypeComponent = useMemo(
    () =>
      Object.keys(types).map(typeKey => (
        <div
          key={typeKey}
          onClick={() => setSelectedType(typeKey)}
          className={cx(css.typeContainer, { [css.typeSelected]: typeKey === selectedType })}
          data-test={`mostActiveServicesWidgetType${typeKey === selectedType ? 'Selected' : ''}`}
        >
          <Text
            font={{ size: 'xsmall', weight: 'semi-bold' }}
            color={typeKey === selectedType ? Color.WHITE : Color.BLACK}
          >
            {types[typeKey].label}
          </Text>
        </div>
      )),
    [types, selectedType]
  )

  const MostActiveServicesWidgetContainer: React.FC = ({ children }) => {
    return (
      <Card className={css.card}>
        <Layout.Vertical height={'100%'}>
          {title && (
            <Text font={{ weight: 'bold' }} color={Color.GREY_600}>
              {title}
            </Text>
          )}
          <Container margin={{ bottom: 'xlarge' }}>{EnvironmentTypeComponent}</Container>
          <Layout.Horizontal margin={{ bottom: 'large' }}>{TypeComponent}</Layout.Horizontal>
          {children}
        </Layout.Vertical>
      </Card>
    )
  }

  if (workloadLoading || workloadsError || !data || !data.length) {
    const component = (() => {
      if (workloadLoading) {
        return (
          <Container data-test="mostActiveServicesWidgetLoader">
            <PageSpinner />
          </Container>
        )
      }
      if (workloadsError) {
        return (
          <Container data-test="mostActiveServicesWidgetError" height={'100%'}>
            <PageError onClick={() => workloadsRefetch()} width={230} />
          </Container>
        )
      }
      return (
        <Layout.Vertical
          flex={{ align: 'center-center' }}
          data-test="mostActiveServicesWidgetEmpty"
          className={css.mostActiveServicesWidgetEmpty}
        >
          <Container margin={{ bottom: 'medium' }}>
            <img width="50" height="50" src={MostActiveServicesEmptyState} style={{ alignSelf: 'center' }} />
          </Container>
          <Text color={Color.GREY_400}>
            {getString('cd.serviceDashboard.noActiveServices', {
              timeRange: timeRange?.label
            })}
          </Text>
        </Layout.Vertical>
      )
    })()
    return <MostActiveServicesWidgetContainer>{component}</MostActiveServicesWidgetContainer>
  }

  return (
    <MostActiveServicesWidgetContainer>
      <Layout.Horizontal
        flex={{ distribution: 'space-between', alignItems: 'flex-start' }}
        width="100%"
        height={150}
        className={css.stackTickerContainer}
        data-test="mostActiveServicesWidgetContent"
      >
        <Layout.Vertical className={css.weightedStackContainer} width="60%">
          <WeightedStack
            data={weightedStackData}
            labelPosition={LabelPosition.BOTTOM}
            stackStyles={css.stack}
            progressBarStyles={css.progressBar}
            labelStyles={css.label}
          />
        </Layout.Vertical>
        {/* <Layout.Vertical width="30%">{Tickers}</Layout.Vertical> */}
      </Layout.Horizontal>
    </MostActiveServicesWidgetContainer>
  )
}

export const MostActiveServicesWidgetRef = React.forwardRef(MostActiveServicesWidget)
