/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { defaultTo, isEmpty, isEqual, isUndefined } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { CellProps, Column, Renderer } from 'react-table'
import { Color, FontVariation } from '@harness/design-system'
import { Position } from '@blueprintjs/core'
import { Container, getErrorInfoFromErrorObject, Icon, PageError, Text } from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import { DialogEmptyState } from '@cd/components/EnvironmentsV2/EnvironmentDetails/EnvironmentDetailSummary/EnvironmentDetailsUtils'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { Table } from '@common/components'
import {
  GetActiveInstanceGroupedByEnvironmentQueryParams,
  InstanceGroupedByEnvironment,
  useGetActiveInstanceGroupedByEnvironment
} from 'services/cd-ng'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import { numberFormatter } from '@common/utils/utils'
import type { ServiceDetailInstanceViewProps } from './ServiceDetailsInstanceView'

import css from './ServiceDetailsSummaryV2.module.scss'

interface ServiceDetailsEnvTableProps {
  envFilter?: {
    envId?: string
    isEnvGroup: boolean
  }
  resetSearch: () => void
  setRowClickFilter: React.Dispatch<React.SetStateAction<ServiceDetailInstanceViewProps>>
  searchTerm: string
}
export interface TableRowData {
  artifact?: string
  envId?: string
  envName?: string
  envGroups?: string[]
  environmentType?: string
  infrastructureId?: string
  infrastructureName?: string
  clusterId?: string
  instanceCount?: number
  lastDeployedAt?: number
  showInfra?: boolean
  showEnv?: boolean
  showEnvType?: boolean
  showArtifact?: boolean
}

/* istanbul ignore next */
export const convertToEnvType = (envType: string): StringKeys => {
  if (envType === EnvironmentType.PRODUCTION) {
    return 'cd.serviceDashboard.prod'
  }
  return 'cd.preProduction'
}

const getEnvTableData = (
  envTableData: InstanceGroupedByEnvironment[],
  isEnvGroup: boolean,
  envFilter?: string
): TableRowData[] => {
  const tableData: TableRowData[] = []
  envTableData.forEach(env => {
    /* istanbul ignore else */
    if ((!isEnvGroup && envFilter && env.envId === envFilter) || isEnvGroup || !envFilter) {
      const envName = defaultTo(env.envName, '-')
      const envId = env.envId
      const envGroups = defaultTo(env.envGroups, [])
      const lastDeployedAt = defaultTo(env.lastDeployedAt, 0)
      let showEnv = true
      let showEnvType = true
      let showInfra = true

      /* istanbul ignore else */
      if (env.envId && env.instanceGroupedByEnvironmentTypeList) {
        env.instanceGroupedByEnvironmentTypeList.forEach(envDetail => {
          const envType = envDetail.environmentType
          envDetail.instanceGroupedByInfrastructureList.forEach(infraDetail => {
            const infraId = infraDetail.infrastructureId
            const infraName = infraDetail.infrastructureName
            const clusterId = infraDetail.clusterId
            infraDetail.instanceGroupedByArtifactList.forEach(artifactDetail => {
              const artifact = artifactDetail.artifact
              const instanceCount = defaultTo(artifactDetail.count, 0)
              tableData.push({
                artifact: artifact,
                clusterId: clusterId,
                envId,
                envName,
                envGroups,
                lastDeployedAt,
                environmentType: envType,
                infrastructureId: infraId,
                infrastructureName: infraName,
                instanceCount: instanceCount,
                showEnv,
                showEnvType,
                showInfra
              })
              showEnv = false
              showEnvType = false
              showInfra = false
            })
            showInfra = true
          })
          showEnvType = true
        })
      }
      showEnv = true
    }
  })
  return tableData
}

export const RenderEnv: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { showEnv, envName }
  }
}) => {
  return showEnv ? (
    <Container>
      <Text lineClamp={1} tooltipProps={{ isDark: true }} className={css.envColumnStyle}>
        {envName}
      </Text>
    </Container>
  ) : (
    <></>
  )
}

export const RenderEnvGroups: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { showEnv, envGroups }
  }
}) => {
  const { getString } = useStrings()
  if (!showEnv) {
    return <></>
  }

  if (!envGroups || envGroups.length === 0) {
    return <Text>-</Text>
  }

  const [firstEnvGroup, ...otherEnvGroups] = envGroups

  const tooltipContent = (
    <Container className={css.envGroupTooltip}>
      <Text font={{ variation: FontVariation.SMALL_BOLD }} color={Color.GREY_300}>
        {getString('cd.serviceDashboard.envGroupsHeader')}
      </Text>
      <div className={css.envGroupSeparator} />
      <div id="envGrpText">
        {otherEnvGroups.map((item, index) => (
          <Text
            key={`${item}_${index}`}
            font={{ variation: FontVariation.SMALL_SEMI }}
            padding={{ top: 'xsmall' }}
            color={Color.GREY_200}
            lineClamp={1}
          >
            {item}
          </Text>
        ))}
      </div>
    </Container>
  )
  return (
    <Container className={css.envGroupContainer}>
      <Text lineClamp={1} tooltipProps={{ isDark: true }} margin={{ right: 'tiny' }} className={css.envGroupStyle}>
        {firstEnvGroup}
      </Text>
      {otherEnvGroups.length > 0 && (
        <Text
          lineClamp={1}
          tooltipProps={{ isDark: true, position: Position.RIGHT }}
          className={css.envGroupStyle}
          alwaysShowTooltip={true}
          tooltip={tooltipContent}
        >
          {`+ ${numberFormatter(otherEnvGroups.length)}`}
        </Text>
      )}
    </Container>
  )
}

export const RenderEnvType: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { showEnvType, environmentType }
  }
}) => {
  const { getString } = useStrings()
  return showEnvType ? (
    <Text
      className={cx(css.environmentType, {
        [css.production]: environmentType === EnvironmentType.PRODUCTION
      })}
      font={{ size: 'small' }}
    >
      {environmentType
        ? getString(
            environmentType === EnvironmentType.PRODUCTION ? 'cd.serviceDashboard.prod' : 'cd.preProductionType'
          )
        : '-'}
    </Text>
  ) : (
    <></>
  )
}

export const RenderInstanceCount: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { instanceCount }
  }
}) => {
  return instanceCount ? (
    <Container>
      <Text font={{ size: 'small' }} color={Color.GREY_600} className={css.overflow} lineClamp={1}>
        {numberFormatter(instanceCount)}
      </Text>
    </Container>
  ) : (
    <></>
  )
}

export const RenderInfra: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { showInfra, infrastructureId, infrastructureName, clusterId }
  }
}) => {
  const name = !infrastructureId ? clusterId : infrastructureName
  return showInfra ? (
    <Container>
      <Text lineClamp={1} tooltipProps={{ isDark: true }} className={css.envColumnStyle}>
        {name ? name : '-'}
      </Text>
    </Container>
  ) : (
    <></>
  )
}

export const RenderArtifact: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { artifact }
  }
}) => {
  return (
    <Container>
      <Text lineClamp={1} tooltipProps={{ isDark: true }} className={css.envColumnStyle}>
        {artifact ? artifact : '-'}
      </Text>
    </Container>
  )
}

export default function ServiceDetailsEnvTable(props: ServiceDetailsEnvTableProps): React.ReactElement {
  const { envFilter: envFilterObj, resetSearch, setRowClickFilter, searchTerm } = props
  const envFilter = envFilterObj?.envId
  const isEnvGroup = !!envFilterObj?.isEnvGroup
  const { getString } = useStrings()
  const [selectedRow, setSelectedRow] = React.useState<string>()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()

  const queryParams: GetActiveInstanceGroupedByEnvironmentQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId,
    environmentIdentifier: !isEnvGroup ? envFilter : undefined,
    envGroupIdentifier: isEnvGroup ? envFilter : undefined
  }

  const { data, loading, error, refetch } = useGetActiveInstanceGroupedByEnvironment({ queryParams })

  const envTableDetailData = data?.data?.instanceGroupedByEnvironmentList

  const filteredTableData = useMemo(() => {
    if (!searchTerm) {
      return envTableDetailData
    }

    const searchValue = searchTerm.toLocaleLowerCase()
    /* istanbul ignore next */
    return envTableDetailData?.filter(
      envDetail =>
        envDetail.envName?.toLocaleLowerCase().includes(searchValue) ||
        envDetail.envGroups?.some(group => group.toLowerCase().includes(searchValue.toLowerCase())) ||
        envDetail.instanceGroupedByEnvironmentTypeList.some(
          envType =>
            (envType.environmentType &&
              getString(convertToEnvType(envType.environmentType))?.toLocaleLowerCase().includes(searchValue)) ||
            envType.instanceGroupedByInfrastructureList.some(
              infraOrCluster =>
                infraOrCluster.clusterId?.toLocaleLowerCase().includes(searchValue) ||
                infraOrCluster.infrastructureName?.toLocaleLowerCase().includes(searchValue) ||
                infraOrCluster.instanceGroupedByArtifactList.some(artifact =>
                  artifact.artifact?.toLocaleLowerCase().includes(searchValue)
                )
            )
        )
    )
  }, [searchTerm, envTableDetailData])

  const tableData: TableRowData[] = useMemo(() => {
    return getEnvTableData(defaultTo(filteredTableData, [] as InstanceGroupedByEnvironment[]), isEnvGroup, envFilter)
  }, [envFilter, filteredTableData])

  const searchApplied = !isEmpty(searchTerm.trim())

  useEffect(() => {
    if (searchApplied) {
      setSelectedRow(undefined)
    }
  }, [filteredTableData, searchApplied])

  const columns: Column<TableRowData>[] = useMemo(() => {
    const columnsArray = [
      {
        Header: getString('environment'),
        id: 'environment',
        width: '15%',
        Cell: RenderEnv
      },
      {
        Header: getString('pipeline.verification.tableHeaders.group'),
        id: 'environmentGroups',
        width: '20%',
        Cell: RenderEnvGroups
      },
      {
        Header: getString('typeLabel'),
        id: 'envType',
        width: '13%',
        Cell: RenderEnvType
      },
      {
        Header: getString('cd.infra'),
        id: 'infra',
        width: '22%',
        Cell: RenderInfra
      },
      {
        Header: getString('cd.serviceDashboard.artifact'),
        id: 'artifact',
        width: '25%',
        Cell: RenderArtifact
      },
      {
        Header: (
          <Text
            font={{ variation: FontVariation.TABLE_HEADERS }}
            tooltipProps={{ isDark: true }}
            alwaysShowTooltip={true}
            tooltip={
              <Text color={Color.GREY_100} padding="small">
                {getString('cd.serviceDashboard.headers.instances')}
              </Text>
            }
          >
            {'INST'}
          </Text>
        ),
        id: 'instances',
        width: '5%',
        Cell: RenderInstanceCount
      }
    ]
    return columnsArray as unknown as Column<TableRowData>[]
  }, [getString])

  if (isUndefined(selectedRow) && tableData.length) {
    setRowClickFilter({
      artifact: tableData[0].artifact,
      envId: defaultTo(tableData[0].envId, ''),
      environmentType: tableData[0].environmentType as 'PreProduction' | 'Production',
      envName: defaultTo(tableData[0].envName, ''),
      clusterIdentifier: tableData[0].clusterId,
      infraIdentifier: tableData[0].infrastructureId,
      infraName: tableData[0].infrastructureName,
      isEnvView: true
    })
    setSelectedRow(`${tableData[0].envId}-${0}`)
  }

  if (loading) {
    return (
      <Container
        flex={{ justifyContent: 'center', alignItems: 'center' }}
        height={730}
        data-test="ServiceEnvTableLoading"
      >
        <Icon name="spinner" color={Color.BLUE_500} size={30} />
      </Container>
    )
  }
  if (error) {
    return (
      <Container data-test="ServiceEnvTableError" height={730} flex={{ justifyContent: 'center' }}>
        <PageError onClick={() => refetch?.()} message={getErrorInfoFromErrorObject(error)} />
      </Container>
    )
  }
  if (!filteredTableData?.length) {
    return (
      <DialogEmptyState
        isSearchApplied={searchApplied}
        isServicePage={true}
        resetSearch={resetSearch}
        message={getString('cd.environmentDetailPage.noServiceArtifactMsg')}
      />
    )
  }

  return (
    <Table<TableRowData>
      columns={columns}
      data={tableData}
      className={css.fullViewTableStyle}
      onRowClick={(row, idx) => {
        setRowClickFilter({
          artifact: row.artifact,
          envId: defaultTo(row.envId, ''),
          environmentType: row.environmentType as 'PreProduction' | 'Production',
          envName: defaultTo(row.envName, ''),
          clusterIdentifier: row.clusterId,
          infraIdentifier: row.infrastructureId,
          infraName: row.infrastructureName,
          isEnvView: true
        })
        setSelectedRow(`${row.envId}-${idx}`)
      }}
      getRowClassName={row => (isEqual(`${row.original.envId}-${row.index}`, selectedRow) ? css.selected : '')}
    />
  )
}
