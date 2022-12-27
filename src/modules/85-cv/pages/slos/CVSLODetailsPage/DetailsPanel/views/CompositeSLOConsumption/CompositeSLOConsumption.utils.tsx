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
import type { UseStringsReturn } from 'framework/strings'
import type { SLOConsumptionBreakdown } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getSearchString } from '@cv/utils/CommonUtils'
import {
  RenderSLIType,
  RenderTarget
} from '@cv/pages/slos/components/CVCreateSLOV2/components/CreateCompositeSloForm/components/AddSlos/components/SLOList.utils'
import {
  getProjectAndOrgColumn,
  getColumsForProjectAndAccountLevel
} from '@cv/pages/slos/components/CVCreateSLOV2/components/CreateCompositeSloForm/CreateCompositeSloForm.utils'
import css from './CompositeSLOConsumption.module.scss'

export const getDate = (time: number): string => moment(new Date(time)).format('lll')

interface GetOrgProjectParamsProps {
  slo: SLOConsumptionBreakdown
  orgIdentifier?: string
  projectIdentifier?: string
}
const getOrgProjectParams = ({ slo, orgIdentifier, projectIdentifier }: GetOrgProjectParamsProps) =>
  orgIdentifier && projectIdentifier
    ? {
        orgIdentifier,
        projectIdentifier
      }
    : {
        orgIdentifier: slo?.projectParams?.orgIdentifier ?? '',
        projectIdentifier: slo?.projectParams?.projectIdentifier ?? ''
      }

export const RenderSLOName: Renderer<CellProps<any>> = ({ row }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const slo = row.original
  const orgProjectParams = getOrgProjectParams({ slo, orgIdentifier, projectIdentifier })
  const { sloName = '', sloIdentifier = '', sloType = 'Simple' } = slo || {}
  const path = routes.toCVSLODetailsPage({
    identifier: sloIdentifier,
    accountId,
    ...orgProjectParams
  })
  const queryParams = getSearchString({ sloType })
  return (
    <Link to={`${path}${queryParams}`} target="_blank">
      <Text color={Color.PRIMARY_7} title={sloName} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
        {sloName}
      </Text>
    </Link>
  )
}

export const RenderMonitoredService: Renderer<CellProps<any>> = ({ row }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const slo = row.original
  const orgProjectParams = getOrgProjectParams({ slo, orgIdentifier, projectIdentifier })
  const { serviceName = '', environmentIdentifier = '', monitoredServiceIdentifier: identifier = '' } = slo || {}

  return (
    <Layout.Vertical padding={{ left: 'small' }}>
      <Link
        to={routes.toCVAddMonitoringServicesEdit({
          accountId,
          ...orgProjectParams,
          identifier,
          module: 'cv'
        })}
        target="_blank"
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
      {slo?.weightagePercentage}%
    </Text>
  )
}
export const RenderActualSlo: Renderer<CellProps<any>> = ({ row }) => {
  const slo = row.original
  return (
    <Text className={css.titleInSloTable} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {slo?.sliStatusPercentage?.toFixed(2)}%
    </Text>
  )
}

export const durationAsString = (consumptionMinutes: number): string => {
  const duration = moment.duration(consumptionMinutes, 'minutes')

  //Get Days
  const days = Math.floor(duration.asDays())
  const daysFormatted = days ? `${days}d ` : ''

  //Get Hours
  const hours = duration.hours()
  const hoursFormatted = hours ? `${hours}h ` : ''

  //Get Minutes
  const minutes = duration.minutes()
  const minutesFormatted = minutes ? `${minutes}m ` : ''

  //Get Seconds
  const seconds = duration.seconds()
  const secondsFormatted = seconds ? `${seconds}s ` : ''

  return [daysFormatted, hoursFormatted, minutesFormatted, secondsFormatted].join('')
}

export const RenderErrorBudgetBurned: Renderer<CellProps<any>> = ({ row }) => {
  const slo = row.original
  return (
    <Text className={css.titleInSloTable} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {durationAsString(slo?.errorBudgetBurned)}
    </Text>
  )
}
export const RenderContributedErrorBudgetBurned: Renderer<CellProps<any>> = ({ row }) => {
  const slo = row.original
  return (
    <Text className={css.titleInSloTable} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
      {durationAsString(slo?.contributedErrorBudgetBurned)}
    </Text>
  )
}

export const getConsumptionTableColums = ({
  getString,
  isAccountLevel
}: {
  getString: UseStringsReturn['getString']
  isAccountLevel: boolean
}) => {
  const allColumns = [
    {
      accessor: 'sloName',
      Header: getString('cv.slos.sloName').toUpperCase(),
      Cell: RenderSLOName
    },
    ...getProjectAndOrgColumn({ getString }),
    {
      accessor: 'serviceName',
      Header: getString('cv.slos.monitoredService').toUpperCase(),
      width: '15%',
      Cell: RenderMonitoredService
    },
    {
      accessor: 'sliType',
      Header: getString('cv.slos.sliType'),
      Cell: RenderSLIType
    },
    {
      accessor: 'weightagePercentage',
      Header: getString('cv.CompositeSLO.Consumption.AssignedWeightage').toUpperCase(),
      width: '12%',
      Cell: RenderAssignedWeightage
    },
    {
      accessor: 'sloTargetPercentage',
      Header: getString('cv.slos.target').toUpperCase(),
      Cell: RenderTarget
    },
    {
      accessor: 'sliStatusPercentage',
      Header: getString('cv.CompositeSLO.Consumption.ActualSlo').toUpperCase(),
      Cell: RenderActualSlo
    },
    {
      accessor: 'errorBudgetBurned',
      Header: getString('cv.CompositeSLO.Consumption.ErrorBudgetBurned').toUpperCase(),
      width: '15%',
      Cell: RenderErrorBudgetBurned
    },
    {
      accessor: 'contributedErrorBudgetBurned',
      Header: getString('cv.CompositeSLO.Consumption.ContributedErrorBudgetBurned').toUpperCase(),
      Cell: RenderContributedErrorBudgetBurned
    }
  ]

  return getColumsForProjectAndAccountLevel({ isAccountLevel, allColumns, getString })
}
