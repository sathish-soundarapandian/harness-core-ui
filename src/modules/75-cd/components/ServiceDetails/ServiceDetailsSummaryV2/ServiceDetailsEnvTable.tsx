import React, { useMemo } from 'react'
import { defaultTo, isEqual, isUndefined, noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { CellProps, Column, Renderer } from 'react-table'
import { Color } from '@harness/design-system'
import { Container, PageError, PageSpinner, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { DialogEmptyState } from '@cd/components/EnvironmentsV2/EnvironmentDetails/EnvironmentDetailSummary/EnvironmentDetailsUtils'
import type { ProjectPathProps, ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { Table } from '@common/components'
import {
  GetActiveInstanceGroupedByEnvironmentQueryParams,
  ResponseInstanceGroupedByEnvironmentList,
  useGetActiveInstanceGroupedByEnvironment
} from 'services/cd-ng'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import { numberFormatter } from '@common/utils/utils'
import type { ServiceDetailInstanceViewProps } from './ServiceDetailsInstanceView'

import css from './ServiceDetailsSummaryV2.module.scss'

interface ServiceDetailsEnvTableProps {
  envFilter?: string
  resetSearch?: () => void
  setRowClickFilter: React.Dispatch<React.SetStateAction<ServiceDetailInstanceViewProps>>
}

export interface TableRowData {
  artifact?: string
  envId?: string
  envName?: string
  environmentType?: string
  infrastructureId?: string
  infrastructureName?: string
  clusterId?: string
  instanceCount?: number
  lastDeployedAt?: number
  showInfra?: boolean
  showEnv?: boolean
  showEnvType?: boolean
}

const getEnvTableData = (data: ResponseInstanceGroupedByEnvironmentList, envFilter?: string): TableRowData[] => {
  const tableData: TableRowData[] = []
  const envTableData = data.data
  envTableData?.instanceGroupedByEnvironmentList.forEach(env => {
    if ((envFilter && env.envId === envFilter) || !envFilter) {
      const envName = defaultTo(env.envName, '-')
      const envId = env.envId
      const lastDeployedAt = defaultTo(env.lastDeployedAt, 0)
      let showEnv = true
      let showEnvType = true
      let showInfra = true

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

const RenderInstanceCount: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { instanceCount }
  }
}) => {
  return instanceCount ? (
    <Container>
      <Text font={{ size: 'small' }} color={Color.GREY_600} className={css.overflow}>
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
  const name = !isUndefined(infrastructureId) ? infrastructureName : clusterId
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
  const { envFilter, resetSearch, setRowClickFilter } = props
  const { getString } = useStrings()
  const [selectedRow, setSelectedRow] = React.useState<string>()
  const { accountId, orgIdentifier, projectIdentifier, serviceId } = useParams<ProjectPathProps & ServicePathProps>()

  const queryParams: GetActiveInstanceGroupedByEnvironmentQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    serviceId,
    environmentIdentifier: envFilter ? envFilter : undefined
  }

  const { data, loading, error, refetch } = useGetActiveInstanceGroupedByEnvironment({ queryParams })

  const tableData: TableRowData[] = useMemo(() => {
    return getEnvTableData(defaultTo(data, [] as ResponseInstanceGroupedByEnvironmentList), envFilter)
  }, [data, envFilter])

  const columns: Column<TableRowData>[] = useMemo(() => {
    const columnsArray = [
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
        width: '22%',
        Cell: RenderInfra
      },
      {
        Header: getString('cd.serviceDashboard.artifact'),
        id: 'artifact',
        width: '35%',
        Cell: RenderArtifact
      },
      {
        Header: getString('cd.serviceDashboard.headers.instances'),
        id: 'instances',
        width: '10%',
        Cell: RenderInstanceCount
      }
    ]
    return columnsArray as unknown as Column<TableRowData>[]
  }, [])

  if (isUndefined(selectedRow) && tableData.length) {
    setRowClickFilter({
      artifact: defaultTo(tableData[0].artifact, ''),
      envId: defaultTo(tableData[0].envId, ''),
      environmentType: defaultTo(tableData[0].environmentType as 'PreProduction' | 'Production', 'Production'),
      envName: defaultTo(tableData[0].envName, ''),
      clusterIdentifier: tableData[0].clusterId,
      infraIdentifier: tableData[0].infrastructureId,
      infraName: tableData[0].infrastructureName
    })
    setSelectedRow(
      JSON.stringify(tableData[0]) +
        tableData[0].envId +
        tableData[0].artifact +
        tableData[0].infrastructureId +
        tableData[0].clusterId
    )
  }

  if (loading) {
    return (
      <Container data-test="EnvTableLoader" height="600px">
        <PageSpinner />
      </Container>
    )
  }
  if (error) {
    return (
      <Container data-test="EnvTableError" height="600px">
        <PageError onClick={() => refetch?.()} />
      </Container>
    )
  }
  if (!data?.data?.instanceGroupedByEnvironmentList.length) {
    return (
      <DialogEmptyState
        isSearchApplied={false} //todo
        resetSearch={defaultTo(resetSearch, noop)}
        message={getString('cd.environmentDetailPage.noServiceArtifactMsg')}
      />
    )
  }

  return (
    <Table<TableRowData>
      columns={columns}
      data={tableData}
      className={css.fullViewTableStyle}
      onRowClick={row => {
        setRowClickFilter({
          artifact: defaultTo(row.artifact, ''),
          envId: defaultTo(row.envId, ''),
          environmentType: defaultTo(row.environmentType as 'PreProduction' | 'Production', 'Production'),
          envName: defaultTo(row.envName, ''),
          clusterIdentifier: row.clusterId,
          infraIdentifier: row.infrastructureId,
          infraName: row.infrastructureName
        })
        setSelectedRow(JSON.stringify(row) + row.envId + row.artifact + row.infrastructureId + row.clusterId)
      }}
      getRowClassName={row =>
        isEqual(
          JSON.stringify(row.original) +
            row.original.envId +
            row.original.artifact +
            row.original.infrastructureId +
            row.original.clusterId,
          selectedRow
        )
          ? css.selected
          : ''
      }
    />
  )
}
