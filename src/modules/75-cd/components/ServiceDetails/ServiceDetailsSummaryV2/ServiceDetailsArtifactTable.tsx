/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { defaultTo, isEmpty, isEqual, isUndefined } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer } from 'react-table'
import { Color } from '@harness/design-system'
import { Container, getErrorInfoFromErrorObject, Icon, PageError, Text } from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import { DialogEmptyState } from '@cd/components/EnvironmentsV2/EnvironmentDetails/EnvironmentDetailSummary/EnvironmentDetailsUtils'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { Table } from '@common/components'
import {
  GetActiveInstanceGroupedByArtifactQueryParams,
  InstanceGroupedOnArtifact,
  useGetActiveInstanceGroupedByArtifact
} from 'services/cd-ng'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import type { ServiceDetailInstanceViewProps } from './ServiceDetailsInstanceView'
import { RenderEnv, RenderEnvType, RenderInstanceCount, TableRowData } from './ServiceDetailsEnvTable'

import css from './ServiceDetailsSummaryV2.module.scss'

interface ServiceDetailsArtifactTableProps {
  artifactFilter?: string
  envFilter?: {
    envId?: string
    isEnvGroup: boolean
  }
  resetSearch: () => void
  setRowClickFilter: React.Dispatch<React.SetStateAction<ServiceDetailInstanceViewProps>>
  searchTerm: string
  artifactFilterApplied?: boolean
}

/* istanbul ignore next */
export const convertToEnvType = (envType: string): StringKeys => {
  if (envType === EnvironmentType.PRODUCTION) {
    return 'cd.serviceDashboard.prod'
  }
  return 'cd.preProduction'
}

const getArtifactTableData = (
  artifactTableData: InstanceGroupedOnArtifact[],
  isEnvGroup: boolean,
  envFilter?: string,
  artifactFilter?: string
): TableRowData[] => {
  const tableData: TableRowData[] = []
  artifactTableData.forEach(artifact => {
    /* istanbul ignore else */
    if ((artifactFilter && artifact.artifact === artifactFilter) || !artifactFilter) {
      const artifactName = artifact.artifact
      const lastDeployedAt = defaultTo(artifact.lastDeployedAt, 0)
      let showEnv = true
      let showArtifact = true

      /* istanbul ignore else */
      if (artifact.instanceGroupedOnEnvironmentList) {
        artifact.instanceGroupedOnEnvironmentList.forEach(env => {
          const envId = env.envId
          const envName = defaultTo(env.envName, '-')
          if (
            env.envId &&
            env.instanceGroupedOnEnvironmentTypeList &&
            ((!isEnvGroup && envFilter && env.envId === envFilter) || isEnvGroup || !envFilter)
          ) {
            env.instanceGroupedOnEnvironmentTypeList.forEach(envDetail => {
              const envType = envDetail.environmentType
              if (envType && envDetail.instanceGroupedOnInfrastructureList) {
                envDetail.instanceGroupedOnInfrastructureList.forEach((infraDetail, infraDetailIdx) => {
                  const infraId = infraDetail.infrastructureId
                  const infraName = infraDetail.infrastructureName
                  const clusterId = infraDetail.clusterId
                  const instanceCount = defaultTo(infraDetail.count, 0)
                  tableData.push({
                    artifact: artifactName,
                    clusterId: clusterId,
                    envId,
                    envName,
                    lastDeployedAt,
                    environmentType: envType,
                    infrastructureId: infraId,
                    infrastructureName: infraName,
                    instanceCount: instanceCount,
                    showEnv,
                    showEnvType: !infraDetailIdx,
                    showArtifact
                  })
                  showEnv = false
                  showArtifact = false
                })
              }
            })
            showEnv = true
          }
        })
        showArtifact = true
      }
    }
  })
  return tableData
}

export const RenderInfra: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { infrastructureId, infrastructureName, clusterId }
  }
}) => {
  const name = !infrastructureId ? clusterId : infrastructureName
  return name ? (
    <Container>
      <Text lineClamp={1} tooltipProps={{ isDark: true }} className={css.envColumnStyle}>
        {name}
      </Text>
    </Container>
  ) : (
    <>{'-'}</>
  )
}

export const RenderArtifact: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { artifact, showArtifact }
  }
}) => {
  return showArtifact ? (
    <Container>
      <Text lineClamp={1} tooltipProps={{ isDark: true }} className={css.envColumnStyle}>
        {artifact ? artifact : '-'}
      </Text>
    </Container>
  ) : (
    <></>
  )
}

export default function ServiceDetailsArtifactTable(props: ServiceDetailsArtifactTableProps): React.ReactElement {
  const {
    artifactFilter,
    envFilter: envFilterObj,
    resetSearch,
    setRowClickFilter,
    searchTerm,
    artifactFilterApplied = false
  } = props
  const envFilter = envFilterObj?.envId
  const isEnvGroup = !!envFilterObj?.isEnvGroup
  const { getString } = useStrings()
  const [selectedRow, setSelectedRow] = React.useState<string>()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()

  const queryParams: GetActiveInstanceGroupedByArtifactQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId,
    artifact: artifactFilter,
    environmentIdentifier: !isEnvGroup ? envFilter : undefined,
    envGroupIdentifier: isEnvGroup ? envFilter : undefined,
    filterOnArtifact: artifactFilterApplied
  }

  const { data, loading, error, refetch } = useGetActiveInstanceGroupedByArtifact({ queryParams })

  const artifactTableDetailData = data?.data?.instanceGroupedOnArtifactList

  const filteredTableData = useMemo(() => {
    if (!searchTerm) {
      return artifactTableDetailData
    }

    const searchValue = searchTerm.toLocaleLowerCase()
    /* istanbul ignore next */
    return artifactTableDetailData?.filter(
      artifactDetail =>
        artifactDetail.artifact?.toLocaleLowerCase().includes(searchValue) ||
        artifactDetail.instanceGroupedOnEnvironmentList.some(
          envDetail =>
            envDetail.envName?.toLocaleLowerCase().includes(searchValue) ||
            envDetail.instanceGroupedOnEnvironmentTypeList?.some(
              envType =>
                (envType.environmentType &&
                  getString(convertToEnvType(envType.environmentType))?.toLocaleLowerCase().includes(searchValue)) ||
                envType.instanceGroupedOnInfrastructureList?.some(
                  infraOrCluster =>
                    infraOrCluster.clusterId?.toLocaleLowerCase().includes(searchValue) ||
                    infraOrCluster.infrastructureName?.toLocaleLowerCase().includes(searchValue)
                )
            )
        )
    )
  }, [searchTerm, artifactTableDetailData])

  const tableData: TableRowData[] = useMemo(() => {
    return getArtifactTableData(
      defaultTo(filteredTableData, [] as InstanceGroupedOnArtifact[]),
      isEnvGroup,
      envFilter,
      artifactFilter
    )
  }, [envFilter, artifactFilter, filteredTableData])

  const searchApplied = !isEmpty(searchTerm.trim())

  useEffect(() => {
    if (searchApplied) {
      setSelectedRow(undefined)
    }
  }, [filteredTableData, searchApplied])

  const columns: Column<TableRowData>[] = useMemo(() => {
    const columnsArray = [
      {
        Header: getString('cd.serviceDashboard.artifact'),
        id: 'artifact',
        width: '30%',
        Cell: RenderArtifact
      },
      {
        Header: getString('environment'),
        id: 'environment',
        width: '20%',
        Cell: RenderEnv
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
        width: '27%',
        Cell: RenderInfra
      },
      {
        Header: getString('cd.serviceDashboard.headers.instances'),
        id: 'instances',
        width: '10%',
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
      infraName: tableData[0].infrastructureName
    })
    setSelectedRow(`${tableData[0].artifact}-${0}`)
  }

  if (loading) {
    return (
      <Container
        flex={{ justifyContent: 'center', alignItems: 'center' }}
        height={730}
        data-test="ServiceArtifactTableLoading"
      >
        <Icon name="spinner" color={Color.BLUE_500} size={30} />
      </Container>
    )
  }
  if (error) {
    return (
      <Container data-test="ServiceArtifactTableError" height={730} flex={{ justifyContent: 'center' }}>
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
          infraName: row.infrastructureName
        })
        setSelectedRow(`${row.artifact}-${idx}`)
      }}
      getRowClassName={row => (isEqual(`${row.original.artifact}-${row.index}`, selectedRow) ? css.selected : '')}
    />
  )
}
