/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { GetDataError } from 'restful-react'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'
import { Container, Layout, PageError, PageSpinner, Popover, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import type { CellProps, Column, Renderer } from 'react-table'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { Table } from '@common/components'
import { useStrings } from 'framework/strings'
import { numberFormatter } from '@cd/components/Services/common'
import routes from '@common/RouteDefinitions'
import type { ExecutionPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { ActiveServiceInstancePopover } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancePopover'
import type { InstanceGroupedByInfrastructureV2 } from 'services/cd-ng'
import { DialogEmptyState } from './EnvironmentDetailCommonUtils'

import css from './EnvironmentDetailSummary.module.scss'

export enum InfraViewTableType {
  FULL = 'full',
  SUMMARY = 'summary'
}

let TOTAL_VISIBLE_INSTANCES = 7

export interface TableRowData {
  envId?: string
  serviceFilter?: string
  artifactVersion?: string
  infraIdentifier?: string
  infraName?: string
  instanceCount?: number
  lastPipelineExecutionId?: string
  lastPipelineExecutionName?: string
  lastDeployedAt?: number
  showInfra?: boolean
  totalInfras?: number
  totalInstanceCount?: number
  infraList?: string[]
  tableType?: InfraViewTableType
}

export const getSummaryViewTableData = (
  InstanceGroupedByInfraList?: InstanceGroupedByInfrastructureV2[],
  tableView?: InfraViewTableType,
  artifactFilter?: string,
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
        if (lastDeployedAt && lastDeployedAt < defaultTo(infraDetail.lastDeployedAt, 0)) {
          lastDeployedAt = defaultTo(infraDetail.lastDeployedAt, 0)
          pipelineExecutionId = defaultTo(infraDetail.lastPipelineExecutionId, '')
          pipelineExecution = defaultTo(infraDetail.lastPipelineExecutionName, '')
        } else if (!lastDeployedAt) {
          lastDeployedAt = defaultTo(infraDetail.lastDeployedAt, 0)
          pipelineExecutionId = defaultTo(infraDetail.lastPipelineExecutionId, '')
          pipelineExecution = defaultTo(infraDetail.lastPipelineExecutionName, '')
        }
      })
    }
    tableData.push({
      infraName: defaultTo(infraName, ''),
      totalInstanceCount: totalInstances,
      showInfra: true,
      lastDeployedAt: lastDeployedAt,
      envId: defaultTo(envFilter, ''),
      serviceFilter: defaultTo(serviceFilter, ''),
      artifactVersion: defaultTo(artifactFilter, ''),
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
  artifactFilter?: string,
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
        if (lastDeployedAt && lastDeployedAt < defaultTo(infraDetail.lastDeployedAt, 0)) {
          lastDeployedAt = defaultTo(infraDetail.lastDeployedAt, 0)
          pipelineExecutionId = defaultTo(infraDetail.lastPipelineExecutionId, '')
          pipelineExecution = defaultTo(infraDetail.lastPipelineExecutionName, '')
        } else if (!lastDeployedAt) {
          lastDeployedAt = defaultTo(infraDetail.lastDeployedAt, 0)
          pipelineExecutionId = defaultTo(infraDetail.lastPipelineExecutionId, '')
          pipelineExecution = defaultTo(infraDetail.lastPipelineExecutionName, '')
        }
        tableData.push({
          showInfra: showInfra,
          totalInstanceCount: totalInstances,
          lastDeployedAt: lastDeployedAt,
          infraName: defaultTo(infraName, ''),
          envId: defaultTo(envFilter, ''),
          serviceFilter: defaultTo(serviceFilter, ''),
          artifactVersion: defaultTo(artifactFilter, ''),
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
      <Text font={{ size: 'small' }} lineClamp={1} tooltipProps={{ isDark: true }}>
        {infraName ? infraName : '-'}
      </Text>
    </Container>
  ) : null
}

const RenderInstances: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { envId, artifactVersion: buildId, totalInstanceCount, tableType, serviceFilter }
  }
}) => {
  TOTAL_VISIBLE_INSTANCES = tableType === InfraViewTableType.SUMMARY ? 4 : 7
  return totalInstanceCount ? (
    <Container className={cx(css.paddedContainer, css.hexContainer)} flex={{ justifyContent: 'flex-start' }}>
      {Array(Math.min(totalInstanceCount, TOTAL_VISIBLE_INSTANCES))
        .fill(null)
        .map((_, index) => (
          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            key={index}
            modifiers={{ preventOverflow: { escapeWithReference: true } }}
          >
            <Container
              className={css.hex}
              width={18}
              height={18}
              background={Color.PRIMARY_3}
              margin={{ left: 'xsmall', right: 'xsmall', top: 'xsmall', bottom: 'xsmall' }}
            />
            <ActiveServiceInstancePopover
              buildId={buildId}
              envId={envId}
              instanceNum={index}
              serviceId={serviceFilter}
            />
          </Popover>
        ))}
      {totalInstanceCount > TOTAL_VISIBLE_INSTANCES ? (
        <Text
          font={{ size: 'small', weight: 'semi-bold' }}
          color={Color.GREY_600}
          margin={{ left: 'xsmall' }}
        >{`+${numberFormatter(totalInstanceCount - TOTAL_VISIBLE_INSTANCES)}`}</Text>
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
        source
      })

      const baseUrl = window.location.href.split('#')[0]
      window.open(`${baseUrl}#${route}`)
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
    width: '50%'
  },
  pipelineExecution: {
    width: '35%'
  }
}

export const EnvironmentDetailInfraTable = (
  props: React.PropsWithChildren<{
    tableType: InfraViewTableType
    loading?: boolean
    data?: InstanceGroupedByInfrastructureV2[]
    error?: GetDataError<unknown> | null
    refetch?: () => Promise<void>
    artifactFilter?: string
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
    artifactFilter,
    envFilter,
    serviceFilter
  } = props

  const { getString } = useStrings()
  const tableData: TableRowData[] = useMemo(() => {
    switch (tableType) {
      case InfraViewTableType.SUMMARY:
        return getSummaryViewTableData(data, tableType, artifactFilter, envFilter, serviceFilter)
      case InfraViewTableType.FULL:
        return getFullViewTableData(data, tableType, artifactFilter, envFilter, serviceFilter)
    }
  }, [data, artifactFilter, envFilter, tableType])

  const columns: Column<TableRowData>[] = useMemo(() => {
    const columnsArray = [
      {
        Header: (
          <Text lineClamp={1} color={Color.GREY_600}>
            {'INFRA / CLUSTER'}
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
        Header: getString('cd.serviceDashboard.headers.instances'),
        id: 'pipelineExecution',
        width: columnsProperties.pipelineExecution.width,
        Cell: RenderPipelineExecution
      }
    ]
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
      return DialogEmptyState()
    })()
    return component
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
