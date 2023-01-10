/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { GetDataError } from 'restful-react'
import { defaultTo, noop } from 'lodash-es'
import cx from 'classnames'
import { Container, Layout, PageError, PageSpinner, Popover, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import type { CellProps, Column, Renderer } from 'react-table'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Table } from '@common/components'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ExecutionPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { ActiveServiceInstancePopover } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancePopover'
import type { InstanceGroupedByInfrastructureV2, InstanceGroupedByPipelineExecution } from 'services/cd-ng'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import type { StoreType } from '@common/constants/GitSyncTypes'
import { numberFormatter } from '@common/utils/utils'
import { windowLocationUrlPartBeforeHash } from 'framework/utils/WindowLocation'
import { DialogEmptyState } from './EnvironmentDetailsUtils'

import css from './EnvironmentDetailSummary.module.scss'

export enum InfraViewTableType {
  FULL = 'full',
  SUMMARY = 'summary'
}

export interface TableRowData {
  envId?: string
  serviceFilter?: string
  artifactVersion?: string
  artifactPath?: string
  infraIdentifier?: string
  clusterId?: string
  infraName?: string
  instanceCount?: number
  lastPipelineExecutionId?: string
  lastPipelineExecutionName?: string
  lastDeployedAt?: number
  showInfra?: boolean
  totalInstanceCount?: number
  infraList?: string[]
  tableType?: InfraViewTableType
}

export const getSummaryViewTableData = (
  InstanceGroupedByInfraList?: InstanceGroupedByInfrastructureV2[],
  tableView?: InfraViewTableType,
  artifactVersion?: string,
  artifactPath?: string,
  envFilter?: string,
  serviceFilter?: string
): TableRowData[] => {
  const tableData: TableRowData[] = []
  InstanceGroupedByInfraList?.forEach(infra => {
    let pipelineExecution: string | undefined
    let pipelineExecutionId: string | undefined
    let totalInstances = 0
    let lastDeployedAt = 0
    const infraName = infra.infraName || infra.clusterIdentifier
    if (infra.instanceGroupedByPipelineExecutionList) {
      infra.instanceGroupedByPipelineExecutionList.forEach(infraDetail => {
        totalInstances += defaultTo(infraDetail.count, 0)
        const setExecutionDetail = (value: InstanceGroupedByPipelineExecution): void => {
          lastDeployedAt = defaultTo(value.lastDeployedAt, 0)
          pipelineExecutionId = value.lastPipelineExecutionId
          pipelineExecution = value.lastPipelineExecutionName
        }
        if (lastDeployedAt && lastDeployedAt < defaultTo(infraDetail.lastDeployedAt, 0)) {
          setExecutionDetail(infraDetail)
        } else if (!lastDeployedAt) {
          setExecutionDetail(infraDetail)
        }
      })
    }
    tableData.push({
      infraName: defaultTo(infraName, ''),
      totalInstanceCount: totalInstances,
      showInfra: true,
      infraIdentifier: infra.infraIdentifier,
      clusterId: infra.clusterIdentifier,
      lastDeployedAt: lastDeployedAt,
      envId: defaultTo(envFilter, ''),
      serviceFilter: defaultTo(serviceFilter, ''),
      artifactVersion: defaultTo(artifactVersion, ''),
      artifactPath: defaultTo(artifactPath, ''),
      lastPipelineExecutionId: defaultTo(pipelineExecutionId, ''),
      lastPipelineExecutionName: defaultTo(pipelineExecution, ''),
      tableType: tableView
    })
  })
  return tableData
}

export const getFullViewTableData = (
  InstanceGroupedByInfraList?: InstanceGroupedByInfrastructureV2[],
  tableView?: InfraViewTableType,
  artifactVersion?: string,
  artifactPath?: string,
  envFilter?: string,
  serviceFilter?: string
): TableRowData[] => {
  const tableData: TableRowData[] = []
  InstanceGroupedByInfraList?.forEach(infra => {
    const infraName = infra.infraName || infra.clusterIdentifier
    let showInfra = true
    if (infra.instanceGroupedByPipelineExecutionList) {
      infra.instanceGroupedByPipelineExecutionList.forEach(infraDetail => {
        let pipelineExecution: string | undefined
        let pipelineExecutionId: string | undefined
        let totalInstances = 0
        let lastDeployedAt = 0
        totalInstances += defaultTo(infraDetail.count, 0)
        const setInfraDetail = (value: InstanceGroupedByPipelineExecution): void => {
          lastDeployedAt = defaultTo(value.lastDeployedAt, 0)
          pipelineExecutionId = value.lastPipelineExecutionId
          pipelineExecution = value.lastPipelineExecutionName
        }
        if (lastDeployedAt && lastDeployedAt < defaultTo(infraDetail.lastDeployedAt, 0)) {
          setInfraDetail(infraDetail)
        } else if (!lastDeployedAt) {
          setInfraDetail(infraDetail)
        }
        tableData.push({
          showInfra: showInfra,
          totalInstanceCount: totalInstances,
          lastDeployedAt: lastDeployedAt,
          infraIdentifier: infra.infraIdentifier,
          clusterId: infra.clusterIdentifier,
          infraName: defaultTo(infraName, ''),
          envId: defaultTo(envFilter, ''),
          serviceFilter: defaultTo(serviceFilter, ''),
          artifactVersion: defaultTo(artifactVersion, ''),
          artifactPath: defaultTo(artifactPath, ''),
          lastPipelineExecutionId: defaultTo(pipelineExecutionId, ''),
          lastPipelineExecutionName: defaultTo(pipelineExecution, ''),
          tableType: tableView
        })
        showInfra = false
      })
    }
  })
  return tableData
}

export const RenderInfra: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { infraName, showInfra }
  }
}) => {
  return showInfra ? (
    <Container className={css.paddedInfraContainer}>
      <Text
        font={{ variation: FontVariation.SMALL }}
        lineClamp={1}
        tooltipProps={{ isDark: true }}
        color={Color.GREEN_900}
      >
        {infraName ? infraName : '-'}
      </Text>
    </Container>
  ) : null
}

const RenderInstances: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: {
      envId,
      artifactVersion: buildId,
      totalInstanceCount,
      tableType,
      serviceFilter,
      infraIdentifier,
      clusterId,
      lastPipelineExecutionId
    }
  }
}) => {
  const totalVisibleInstance = tableType === InfraViewTableType.SUMMARY ? 8 : 18
  return totalInstanceCount ? (
    <Container className={cx(css.paddedContainer, css.hexContainer)} flex={{ justifyContent: 'flex-start' }}>
      {Array(Math.min(totalInstanceCount, totalVisibleInstance))
        .fill(null)
        .map((_, index) => (
          <Popover
            interactionKind={PopoverInteractionKind.HOVER}
            key={`${serviceFilter}_${buildId}_${index}`}
            modifiers={{ preventOverflow: { escapeWithReference: true } }}
            position={Position.TOP}
            disabled={tableType === InfraViewTableType.SUMMARY}
          >
            <Container
              className={css.hex}
              width={18}
              height={18}
              background={Color.PRIMARY_5}
              margin={{ left: 'xsmall', right: 'xsmall', top: 'xsmall', bottom: 'xsmall' }}
            />
            <ActiveServiceInstancePopover
              buildId={buildId}
              envId={envId}
              instanceNum={index}
              serviceIdentifier={serviceFilter}
              clusterId={clusterId}
              isEnvDetail={true}
              infraIdentifier={infraIdentifier}
              pipelineExecutionId={lastPipelineExecutionId}
            />
          </Popover>
        ))}
      {totalInstanceCount > totalVisibleInstance ? (
        <Text
          font={{ size: 'small', weight: 'semi-bold' }}
          color={Color.GREY_600}
          margin={{ left: 'xsmall' }}
        >{`+${numberFormatter(totalInstanceCount - totalVisibleInstance)}`}</Text>
      ) : (
        <></>
      )}
    </Container>
  ) : (
    <></>
  )
}

const RenderPipelineExecution: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { lastPipelineExecutionId, lastPipelineExecutionName, lastDeployedAt }
  }
}) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { pipelineExecutionDetail } = useExecutionContext()

  const { orgIdentifier, projectIdentifier, accountId, module, pipelineIdentifier } =
    useParams<PipelineType<PipelinePathProps>>()
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'

  function handleClick(): void {
    if (lastPipelineExecutionName && lastPipelineExecutionId) {
      const route = routes.toExecutionPipelineView({
        orgIdentifier,
        pipelineIdentifier: lastPipelineExecutionName,
        executionIdentifier: lastPipelineExecutionId,
        projectIdentifier,
        accountId,
        module,
        source,
        branch: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.branch,
        connectorRef: pipelineExecutionDetail?.pipelineExecutionSummary?.connectorRef,
        repoIdentifier: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoIdentifier,
        repoName: pipelineExecutionDetail?.pipelineExecutionSummary?.gitDetails?.repoName,
        storeType: pipelineExecutionDetail?.pipelineExecutionSummary?.storeType as StoreType
      })

      window.open(`${windowLocationUrlPartBeforeHash()}#${route}`)
    } else {
      showError(getString('cd.serviceDashboard.noLastDeployment'))
    }
  }

  return (
    <Layout.Vertical margin={{ right: 'large' }} padding={{ left: 'small' }} flex={{ alignItems: 'flex-start' }}>
      <Text
        font={{ variation: FontVariation.BODY2 }}
        color={Color.PRIMARY_7}
        margin={{ right: 'xsmall' }}
        className={css.lastDeploymentText}
        lineClamp={1}
        onClick={e => {
          e.stopPropagation()
          handleClick()
        }}
        data-testid="pipeline-link"
      >
        {lastPipelineExecutionName}
      </Text>
      {lastDeployedAt && (
        <ReactTimeago
          date={new Date(lastDeployedAt)}
          component={val => (
            <Text font={{ size: 'small' }} color={Color.GREY_500}>
              {' '}
              {val.children}{' '}
            </Text>
          )}
        />
      )}
    </Layout.Vertical>
  )
}

const columnsProperties = {
  infras: {
    width: '25%'
  },
  instances: {
    width: '44%'
  },
  pipelineExecution: {
    width: '31%'
  }
}

export const EnvironmentDetailInfraTable = (
  props: React.PropsWithChildren<{
    tableType: InfraViewTableType
    loading?: boolean
    data?: InstanceGroupedByInfrastructureV2[]
    error?: GetDataError<unknown> | null
    refetch?: () => Promise<void>
    artifactVersion?: string
    artifactPath?: string
    envFilter?: string
    serviceFilter?: string
    tableStyle: string
  }>
): React.ReactElement => {
  const {
    tableType,
    loading = false,
    data,
    error,
    refetch,
    tableStyle,
    artifactVersion,
    envFilter,
    serviceFilter,
    artifactPath
  } = props

  const { getString } = useStrings()
  const tableData: TableRowData[] = useMemo(() => {
    switch (tableType) {
      case InfraViewTableType.SUMMARY:
        return getSummaryViewTableData(data, tableType, artifactVersion, artifactPath, envFilter, serviceFilter)
      case InfraViewTableType.FULL:
        return getFullViewTableData(data, tableType, artifactVersion, artifactPath, envFilter, serviceFilter)
    }
  }, [tableType, data, artifactVersion, envFilter, serviceFilter, artifactPath])

  const columns: Column<TableRowData>[] = useMemo(() => {
    const columnsArray = [
      {
        Header: (
          <Text lineClamp={1} color={Color.GREY_600}>
            {getString('cd.environmentDetailPage.infraSlashCluster')}
          </Text>
        ),
        id: 'infra',
        width: columnsProperties.infras.width,
        Cell: RenderInfra
      },
      {
        Header: getString('cd.serviceDashboard.headers.instances'),
        id: 'instances',
        width: columnsProperties.instances.width,
        Cell: RenderInstances
      },
      {
        Header: getString('cd.serviceDashboard.headers.pipelineExecution'),
        id: 'pipelineExecution',
        width: columnsProperties.pipelineExecution.width,
        Cell: RenderPipelineExecution
      }
    ]
    return columnsArray as unknown as Column<TableRowData>[]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  if (!data?.length) {
    return (
      <DialogEmptyState
        isSearchApplied={false}
        resetSearch={noop}
        message={getString('cd.environmentDetailPage.selectArtifactMsg')}
      />
    )
  }

  return (
    <Table<TableRowData>
      columns={columns}
      data={tableData}
      className={tableStyle}
      hideHeaders={true}
      sortable={tableType === InfraViewTableType.FULL}
    />
  )
}
