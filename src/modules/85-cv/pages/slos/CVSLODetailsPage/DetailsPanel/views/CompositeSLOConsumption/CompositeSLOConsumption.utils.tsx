/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import type { CellProps, Renderer } from 'react-table'
import { Link, useParams } from 'react-router-dom'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getSearchString } from '@cv/utils/CommonUtils'
import css from './CompositeSLOConsumption.module.scss'

export const getDate = (time: number): string => moment(new Date(time)).format('lll')

export const RenderSLOName: Renderer<CellProps<any>> = ({ row }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const slo = row.original
  const { sloName = '', sloIdentifier = '', sloType = 'Simple' } = slo || {}
  const path = routes.toCVSLODetailsPage({
    identifier: sloIdentifier,
    accountId,
    orgIdentifier,
    projectIdentifier
  })
  const queryParams = getSearchString({ sloType })
  return (
    <Link to={`${path}${queryParams}`}>
      <Text color={Color.PRIMARY_7} title={sloName} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
        {sloName}
      </Text>
    </Link>
  )
}

export const RenderMonitoredService: Renderer<CellProps<any>> = ({ row }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const slo = row.original
  const { serviceName = '', environmentIdentifier = '', monitoredServiceIdentifier: identifier = '' } = slo || {}

  return (
    <Layout.Vertical padding={{ left: 'small' }}>
      <Link
        to={routes.toCVAddMonitoringServicesEdit({
          accountId,
          orgIdentifier,
          projectIdentifier,
          identifier,
          module: 'cv'
        })}
      >
        <Text
          color={Color.PRIMARY_7}
          className={css.titleInSloTable}
          title={serviceName}
          font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
        >
          {serviceName}
        </Text>
      </Link>
      <Link
        to={routes.toCVAddMonitoringServicesEdit({
          accountId,
          projectIdentifier,
          orgIdentifier,
          identifier,
          module: 'cv'
        })}
      >
        <Text color={Color.PRIMARY_7} title={environmentIdentifier} font={{ align: 'left', size: 'xsmall' }}>
          {environmentIdentifier}
        </Text>
      </Link>
    </Layout.Vertical>
  )
}

export const RenderAssignedWeightage: Renderer<CellProps<any>> = ({ row }) => {
  const slo = row.original
  return (
    <Text className={css.titleInSloTable} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {slo?.weightagePercentage}
    </Text>
  )
}
export const RenderActualSlo: Renderer<CellProps<any>> = ({ row }) => {
  const slo = row.original
  return (
    <Text className={css.titleInSloTable} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {slo?.sliStatusPercentage?.toFixed(2)}
    </Text>
  )
}
export const RenderErrorBudgetBurned: Renderer<CellProps<any>> = ({ row }) => {
  const slo = row.original
  return (
    <Text className={css.titleInSloTable} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {slo?.errorBudgetBurned}
    </Text>
  )
}
export const RenderContributedErrorBudgetBurned: Renderer<CellProps<any>> = ({ row }) => {
  const slo = row.original
  return (
    <Text className={css.titleInSloTable} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {slo?.contributedErrorBudgetBurned}
    </Text>
  )
}
