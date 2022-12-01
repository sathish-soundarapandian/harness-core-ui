/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { GetDataError } from 'restful-react'
import cx from 'classnames'
import { defaultTo, isEqual } from 'lodash-es'
import { Container, Layout, PageError, PageSpinner, Popover, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { CellProps, Column, Renderer } from 'react-table'
import { HTMLTable, Position } from '@blueprintjs/core'
import { Table } from '@common/components'
import { useStrings } from 'framework/strings'
import { numberFormatter } from '@cd/components/Services/common'
import MostActiveServicesEmptyState from '@cd/icons/MostActiveServicesEmptyState.svg'
import type { InstanceGroupedByService } from 'services/cd-ng'
import emptyInstanceDetail from './EmptyStateSvgs/emptyInstanceDetail.svg'

import css from './EnvironmentDetailSummary.module.scss'

export enum TableType {
  FULL = 'full',
  SUMMARY = 'summary'
}

export interface InfraViewFilters {
  artifactFilter: string
  serviceFilter: string
}

export interface TableRowData {
  artifactVersion?: string
  artifactPath?: string
  latest?: boolean
  serviceId?: string
  serviceName?: string
  infraIdentifier?: string
  infraName?: string
  instanceCount?: number
  lastPipelineExecutionId?: string
  lastPipelineExecutionName?: string
  lastDeployedAt?: number
  showService?: boolean
  showInfra?: boolean
  totalInfras?: number
  totalInstanceCount?: number
  infraList?: string[]
  tableType?: TableType
}

export const getFullViewTableData = (
  InstanceGroupedByServiceList?: InstanceGroupedByService[],
  tableView?: TableType,
  serviceFilter?: string
): TableRowData[] => {
  const tableData: TableRowData[] = []
  InstanceGroupedByServiceList?.forEach(service => {
    if ((serviceFilter && service.serviceId === serviceFilter) || !serviceFilter) {
      let serviceName: string | undefined
      let serviceId: string | undefined
      if (service.serviceId && service.instanceGroupedByArtifactList) {
        serviceName ??= service.serviceName
        serviceId ??= service.serviceId
        let serviceShow = true
        service.instanceGroupedByArtifactList?.forEach(artifact => {
          let totalInfras = 0
          let totalInstances = 0
          let lastDeployedAt = 0
          let artifactVersion: string | undefined
          let artifactPath: string | undefined
          const infraList: string[] = []
          if (artifact.artifactVersion && artifact.instanceGroupedByEnvironmentList) {
            artifactVersion ??= artifact.artifactVersion
            artifactPath ??= artifact.artifactPath
            artifact.instanceGroupedByEnvironmentList?.forEach(env => {
              if (env.envId) {
                if (env.instanceGroupedByInfraList?.length) {
                  env.instanceGroupedByInfraList?.forEach(infra => {
                    if (infra.infraName) {
                      infraList.push(infra.infraName)
                    }
                    totalInfras++
                    infra.instanceGroupedByPipelineExecutionList?.forEach(infraInfo => {
                      totalInstances += infraInfo.count || 0
                      if (infraInfo.lastDeployedAt) {
                        lastDeployedAt =
                          lastDeployedAt >= infraInfo.lastDeployedAt ? lastDeployedAt : infraInfo.lastDeployedAt
                      }
                    })
                  })
                }
                if (env.instanceGroupedByClusterList?.length) {
                  env.instanceGroupedByClusterList?.forEach(cluster => {
                    if (cluster.clusterIdentifier) {
                      infraList.push(cluster.clusterIdentifier)
                    }
                    totalInfras++
                    cluster.instanceGroupedByPipelineExecutionList?.forEach(clusterInfo => {
                      totalInstances += clusterInfo.count || 0
                      if (clusterInfo.lastDeployedAt) {
                        lastDeployedAt =
                          lastDeployedAt >= clusterInfo.lastDeployedAt ? lastDeployedAt : clusterInfo.lastDeployedAt
                      }
                    })
                  })
                }
              }
            })
            tableData.push({
              serviceId: serviceId,
              serviceName: serviceName,
              artifactVersion: artifactVersion,
              latest: artifact.latest,
              artifactPath: defaultTo(artifactPath, ''),
              showService: serviceShow,
              totalInfras: totalInfras,
              instanceCount: totalInstances,
              lastDeployedAt: lastDeployedAt,
              infraList: infraList,
              tableType: tableView
            })
            serviceShow = false
          }
        })
      }
    }
  })
  return tableData
}

export const RenderService: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { showService, serviceName }
  }
}) => {
  return showService ? (
    <Container>
      <Text lineClamp={1} tooltipProps={{ isDark: true }} className={css.serviceColumnStyle}>
        {serviceName}
      </Text>
    </Container>
  ) : (
    <></>
  )
}

export const RenderArtifactVersion: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { artifactVersion, artifactPath, latest, tableType }
  }
}) => {
  const { getString } = useStrings()

  const popoverTable = (
    <HTMLTable small style={{ fontSize: 'small' }}>
      <thead>
        <tr>
          <th>{getString('pipeline.artifactTriggerConfigPanel.artifact')}</th>
        </tr>
      </thead>
      <tbody>
        {artifactVersion ? (
          <tr>
            <td>{getString('cd.artifactVersion')}</td>
            <td>{artifactVersion}</td>
          </tr>
        ) : null}
        {artifactPath ? (
          <tr>
            <td>{getString('cd.artifactPath')}</td>
            <td>{artifactPath}</td>
          </tr>
        ) : null}
      </tbody>
    </HTMLTable>
  )

  return artifactVersion ? (
    <Popover
      interactionKind="hover"
      position={Position.LEFT}
      modifiers={{
        flip: { boundariesElement: 'viewport' },
        preventOverflow: { boundariesElement: 'viewport' }
      }}
    >
      <Layout.Horizontal flex={{ alignItems: 'center' }} className={cx({ [css.latestBadgeStyle]: latest })}>
        <Text
          style={{
            maxWidth: tableType === TableType.SUMMARY ? (latest ? '62px' : '70px') : '125px',
            paddingRight: 'var(--spacing-3)'
          }}
          font={{ size: 'small' }}
          lineClamp={1}
          tooltipProps={{ disabled: true }}
          color={Color.GREY_800}
        >
          {artifactVersion}
        </Text>
        {latest && <Container className={css.latestArtifact} />}
      </Layout.Horizontal>

      {popoverTable}
    </Popover>
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
      <Text font={{ size: 'small', weight: 'bold' }} color={Color.PRIMARY_7} className={css.overflow}>
        {numberFormatter(instanceCount)}
      </Text>
    </Container>
  ) : (
    <></>
  )
}

export const RenderInfra: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { infraList, tableType }
  }
}) => {
  if (!(infraList && infraList.length)) {
    return <>{'-'}</>
  }
  const infrasToShow = tableType === TableType.SUMMARY ? 2 : 5
  const infratext = [...infraList]
  const remainingCount = infratext.length - infrasToShow

  return (
    <Container className={css.infraContainer}>
      <Text font={{ size: 'small' }} lineClamp={1} color={Color.GREY_800} tooltipProps={{ isDark: true }}>
        {infratext.splice(0, infrasToShow).join(', ')}
      </Text>
      {remainingCount > 0 && (
        <Text font={{ size: 'small' }} className={css.plusMore}>
          + {remainingCount}
        </Text>
      )}
    </Container>
  )
}

const columnsProperties = {
  service: {
    width: {
      summary: '0%',
      full: '20%'
    }
  },
  artifacts: {
    width: {
      summary: '26%',
      full: '20%'
    }
  },
  infras: {
    width: {
      summary: '58%',
      full: '50%'
    }
  },
  instancesCount: {
    width: {
      summary: '15%',
      full: '10%'
    }
  }
}

export const EnvironmentDetailTable = (
  props: React.PropsWithChildren<{
    tableType: TableType
    loading?: boolean
    data?: InstanceGroupedByService[]
    error?: GetDataError<unknown> | null
    refetch?: () => Promise<void>
    serviceFilter?: string
    tableStyle: string
    setRowClickFilter: React.Dispatch<React.SetStateAction<InfraViewFilters>>
  }>
): React.ReactElement => {
  const { tableType, loading = false, data, error, refetch, serviceFilter, tableStyle, setRowClickFilter } = props
  const [selectedIndex, setSelectedIndex] = React.useState<number>()

  const { getString } = useStrings()
  const tableData: TableRowData[] = useMemo(() => {
    return getFullViewTableData(data, tableType, serviceFilter)
  }, [data, serviceFilter, tableType])

  const columns: Column<TableRowData>[] = useMemo(() => {
    const columnsArray = [
      {
        Header: getString('service'),
        id: 'service',
        width: columnsProperties.service.width[tableType],
        Cell: RenderService,
        accessor: (row: TableRowData) => row.serviceId
      },
      {
        Header: getString('cd.serviceDashboard.artifact'),
        id: 'artifact',
        width: columnsProperties.artifacts.width[tableType],
        Cell: RenderArtifactVersion
      },
      {
        Header: (
          <Text lineClamp={1} color={Color.GREY_600}>
            {'INFRA/GITOPS CLUSTER'}
          </Text>
        ),
        id: 'infra',
        width: columnsProperties.infras.width[tableType],
        Cell: RenderInfra
      },
      {
        Header: getString('cd.serviceDashboard.headers.instances'),
        id: 'instances',
        width: columnsProperties.instancesCount.width[tableType],
        Cell: RenderInstanceCount
      }
    ]

    if (tableType === TableType.SUMMARY) {
      columnsArray.shift()
    }
    return columnsArray as unknown as Column<TableRowData>[]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading || error || !(data || []).length) {
    const component = (() => {
      if (loading) {
        return (
          <Container data-test="ActiveServiceInstancesLoader" height="360px">
            <PageSpinner />
          </Container>
        )
      }
      if (error) {
        return (
          <Container data-test="ActiveServiceInstancesError" height="360px">
            <PageError onClick={() => refetch?.()} />
          </Container>
        )
      }
      return tableType === TableType.FULL ? (
        <Container className={css.instanceEmptyState}>
          <img src={emptyInstanceDetail} />
          <Text>{'Select an Infrastructure to view instance details'}</Text>
        </Container>
      ) : (
        <Layout.Vertical height={'165px'} flex={{ align: 'center-center' }} data-test="ActiveServiceInstancesEmpty">
          <Container margin={{ bottom: 'medium' }}>
            <img width="50" height="50" src={MostActiveServicesEmptyState} style={{ alignSelf: 'center' }} />
          </Container>
          <Text color={Color.GREY_400}>{'No Instances to show'}</Text>
        </Layout.Vertical>
      )
    })()
    return component
  }

  return (
    <Table<TableRowData>
      columns={columns}
      data={tableData}
      className={tableStyle}
      sortable={tableType === TableType.FULL}
      onRowClick={
        tableType === TableType.FULL
          ? (row, index) => {
              if (index === selectedIndex) {
                setRowClickFilter({
                  artifactFilter: '',
                  serviceFilter: ''
                })
                setSelectedIndex(undefined)
              } else {
                setRowClickFilter({
                  artifactFilter: defaultTo(row.artifactVersion, ''),
                  serviceFilter: defaultTo(row.serviceId, '')
                })
                setSelectedIndex(index)
              }
            }
          : undefined
      }
      getRowClassName={row => (isEqual(row.index, selectedIndex) ? css.selected : '')}
    />
  )
}
