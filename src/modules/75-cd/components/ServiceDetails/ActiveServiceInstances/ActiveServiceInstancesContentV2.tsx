/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { CellProps, Renderer } from 'react-table'
import cx from 'classnames'
import { defaultTo } from 'lodash-es'
import { Color, FontVariation } from '@harness/design-system'
import { Container, Layout, Popover, Text, PageError, useToaster } from '@harness/uicore'
import { HTMLTable, PopoverInteractionKind, Position } from '@blueprintjs/core'
import type { GetDataError } from 'restful-react'
import ReactTimeago from 'react-timeago'
import { useParams } from 'react-router-dom'
import { PageSpinner, Table } from '@common/components'
import type { InstanceGroupedByArtifactV2, InstanceGroupedByInfrastructureV2 } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import MostActiveServicesEmptyState from '@cd/icons/MostActiveServicesEmptyState.svg'
import { numberFormatter } from '@common/utils/utils'
import routes from '@common/RouteDefinitions'
import type { PipelineType, PipelinePathProps, ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import { windowLocationUrlPartBeforeHash } from 'framework/utils/WindowLocation'
import { ActiveServiceInstancePopover } from './ActiveServiceInstancePopover'
import css from './ActiveServiceInstances.module.scss'

let TOTAL_VISIBLE_INSTANCES = 7
export interface TableRowData {
  artifactVersion?: string
  artifactPath?: string
  envId?: string
  envName?: string
  infraIdentifier?: string
  infraName?: string
  instanceCount?: number
  lastPipelineExecutionId?: string
  lastPipelineExecutionName?: string
  lastDeployedAt?: number
  showArtifact?: boolean
  showEnv?: boolean
  totalEnvs?: number
  totalInfras?: number
  showInfra?: boolean
  tableType?: TableType
  clusterIdentifier?: string
}

export enum TableType {
  PREVIEW = 'preview', // for card (headers visible, no Pipeline column, Clusters as count)
  SUMMARY = 'summary', // for details popup collapsed row, assuming single entry in 'data' (headers hidden)
  FULL = 'full' // for details popup expanded row (headers hidden)
}

export const isClusterData = (data: InstanceGroupedByArtifactV2[]): boolean => {
  let isCluster = false
  data.forEach(artifact => {
    artifact.instanceGroupedByEnvironmentList?.forEach(env => {
      if (env.instanceGroupedByClusterList?.length) {
        isCluster = true
      }
    })
  })
  return isCluster
}

// full table is the expanded table in the dialog
export const getFullTableData = (instanceGroupedByArtifactV2?: InstanceGroupedByArtifactV2[]): TableRowData[] => {
  const tableData: TableRowData[] = []
  instanceGroupedByArtifactV2?.forEach(artifact => {
    if (artifact.instanceGroupedByEnvironmentList) {
      const artifactVersion = artifact.artifactVersion
      let envShow = true
      artifact.instanceGroupedByEnvironmentList.forEach(env => {
        if (env.envId && env.envName) {
          const getData = (entity: InstanceGroupedByInfrastructureV2, index: number, isCluster: boolean): void => {
            const commonFields: TableRowData = {
              artifactVersion: artifactVersion,
              artifactPath: defaultTo(artifact.artifactPath, ''),
              showArtifact: envShow && !index,
              showEnv: !index,
              infraIdentifier: defaultTo(entity.infraIdentifier, ''),
              clusterIdentifier: defaultTo(entity.clusterIdentifier, ''),
              infraName: isCluster ? defaultTo(entity.clusterIdentifier, '-') : defaultTo(entity.infraName, '-'),
              instanceCount: 0,
              lastPipelineExecutionId: '',
              lastPipelineExecutionName: '',
              lastDeployedAt: 0,
              envId: defaultTo(env.envId, ''),
              envName: defaultTo(env.envName, ''),
              tableType: TableType.FULL,
              showInfra: true
            }

            if (entity.instanceGroupedByPipelineExecutionList) {
              entity.instanceGroupedByPipelineExecutionList.forEach((item, idx) => {
                tableData.push({
                  ...commonFields,
                  showArtifact: envShow && !index && !idx,
                  showEnv: !index && !idx,
                  showInfra: !idx,
                  instanceCount: defaultTo(item.count, 0),
                  lastPipelineExecutionId: defaultTo(item.lastPipelineExecutionId, ''),
                  lastPipelineExecutionName: defaultTo(item.lastPipelineExecutionName, ''),
                  lastDeployedAt: defaultTo(item.lastDeployedAt, 0)
                })
              })
            } else {
              tableData.push(commonFields)
            }
          }
          env.instanceGroupedByInfraList?.forEach((infra, infraIndex) => {
            getData(infra, infraIndex, false)
          })
          env.instanceGroupedByClusterList?.forEach((cluster, clusterIndex) => {
            getData(cluster, clusterIndex, true)
          })
          if (!env.instanceGroupedByClusterList?.length && !env.instanceGroupedByInfraList?.length) {
            tableData.push({
              artifactVersion: artifactVersion,
              artifactPath: defaultTo(artifact.artifactPath, ''),
              showArtifact: envShow,
              envId: env.envId,
              envName: env.envName,
              showEnv: true,
              infraIdentifier: '',
              clusterIdentifier: '',
              infraName: '-',
              instanceCount: 0,
              lastPipelineExecutionId: '',
              lastPipelineExecutionName: '',
              lastDeployedAt: 0,
              showInfra: true,
              tableType: TableType.FULL
            })
          }
          envShow = false
        }
      })
    }
  })
  return tableData
}

// preview is the table on serviceDetail page
export const getPreviewTableData = (instanceGroupedByArtifactV2?: InstanceGroupedByArtifactV2[]): TableRowData[] => {
  const tableData: TableRowData[] = []
  instanceGroupedByArtifactV2?.forEach(artifact => {
    if (artifact.instanceGroupedByEnvironmentList) {
      let envShow = true
      artifact.instanceGroupedByEnvironmentList?.forEach(env => {
        let totalInstancesPerEnv = 0
        let totalInfraPerEnv = 0
        if (env.envId && env.envName) {
          env.instanceGroupedByInfraList?.forEach(infra => {
            infra.instanceGroupedByPipelineExecutionList?.forEach(item => {
              totalInstancesPerEnv += defaultTo(item.count, 0)
            })
            if (infra.infraIdentifier) {
              totalInfraPerEnv += 1
            }
          })
          env.instanceGroupedByClusterList?.forEach(cluster => {
            cluster.instanceGroupedByPipelineExecutionList?.forEach(
              item => (totalInstancesPerEnv += defaultTo(item.count, 0))
            )
            if (cluster.clusterIdentifier) {
              totalInfraPerEnv += 1
            }
          })
          tableData.push({
            artifactVersion: artifact.artifactVersion,
            artifactPath: defaultTo(artifact.artifactPath, ''),
            showArtifact: envShow,
            envId: env.envId,
            envName: env.envName,
            showEnv: true,
            totalInfras: totalInfraPerEnv,
            instanceCount: totalInstancesPerEnv,
            tableType: TableType.PREVIEW,
            showInfra: true
          })
          envShow = false
        }
      })
    }
  })
  return tableData
}

// summaryView is the compressed data on dialog
export const getSummaryTableData = (instanceGroupedByArtifactV2?: InstanceGroupedByArtifactV2[]): TableRowData[] => {
  const tableData: TableRowData[] = []
  let artifactVersion: string | undefined
  let artifactPath: string | undefined
  let envName: string | undefined
  let infraName: string | undefined
  let totalEnvs = 0
  let totalInfras = 0
  let totalInstances = 0
  let lastDeployedAt = 0
  instanceGroupedByArtifactV2?.forEach(artifact => {
    if (artifact.instanceGroupedByEnvironmentList) {
      artifactVersion = artifact.artifactVersion
      artifactPath ??= artifact.artifactPath
      artifact.instanceGroupedByEnvironmentList?.forEach(env => {
        if (env.envId && env.envName) {
          totalEnvs++
          envName ??= env.envName
          env.instanceGroupedByInfraList?.forEach(infra => {
            infraName ??= infra.infraName
            totalInfras++
            infra.instanceGroupedByPipelineExecutionList?.forEach(item => (totalInstances += defaultTo(item.count, 0)))
            lastDeployedAt = defaultTo(infra.lastDeployedAt, 0)
          })
          env.instanceGroupedByClusterList?.forEach(cluster => {
            infraName ??= cluster.clusterIdentifier
            totalInfras++
            cluster.instanceGroupedByPipelineExecutionList?.forEach(
              item => (totalInstances += defaultTo(item.count, 0))
            )
            lastDeployedAt = defaultTo(cluster.lastDeployedAt, 0)
          })
        }
      })
    }
  })
  if (totalEnvs) {
    tableData.push({
      artifactVersion: artifactVersion,
      artifactPath: defaultTo(artifactPath, ''),
      showArtifact: true,
      envName: envName,
      showEnv: true,
      totalEnvs: totalEnvs,
      infraName: infraName,
      totalInfras: totalInfras,
      instanceCount: totalInstances,
      lastDeployedAt: lastDeployedAt,
      tableType: TableType.SUMMARY,
      showInfra: true
    })
  }
  return tableData
}

export const RenderArtifactVersion: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { artifactVersion, showArtifact, artifactPath }
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

  return showArtifact ? (
    <Popover
      interactionKind="hover"
      disabled={!artifactVersion}
      modifiers={{ preventOverflow: { escapeWithReference: true } }}
      position={Position.RIGHT}
    >
      <Text
        style={{ maxWidth: '200px', paddingRight: 'var(--spacing-5)' }}
        font={{ size: 'small', weight: 'semi-bold' }}
        lineClamp={1}
        tooltipProps={{ disabled: true }}
        color={Color.GREY_800}
      >
        {artifactVersion ? artifactVersion : '-'}
      </Text>
      {popoverTable}
    </Popover>
  ) : (
    <></>
  )
}

export const RenderEnvironment: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { showEnv, envName, totalEnvs }
  }
}) => {
  return showEnv ? (
    <Container className={css.paddedContainer}>
      <Container flex>
        <Container className={css.envContainer}>
          <Text className={css.environmentRow} font={{ size: 'small' }} color={Color.WHITE} lineClamp={1}>
            {envName}
          </Text>
        </Container>
        {totalEnvs && totalEnvs > 1 && (
          <Text
            font={{ size: 'xsmall' }}
            style={{ lineHeight: 'small' }}
            className={css.plusMore}
            color={Color.GREY_500}
          >
            + {totalEnvs - 1}
          </Text>
        )}
      </Container>
    </Container>
  ) : (
    <></>
  )
}

export const RenderInfra: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { infraName, totalInfras, showInfra }
  }
}) => {
  return infraName ? (
    <Container flex>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} width={'100%'}>
        {showInfra ? (
          <Text
            style={{ paddingRight: 'var(--spacing-2)' }}
            className={cx({ [css.infraVisible]: totalInfras && totalInfras > 1 })}
            font={{ size: 'small', weight: 'semi-bold' }}
            lineClamp={1}
            color={Color.GREY_800}
          >
            {infraName}
          </Text>
        ) : null}
        {totalInfras && totalInfras > 1 && (
          <Text
            font={{ size: 'xsmall' }}
            style={{ lineHeight: 'small' }}
            className={css.plusMore}
            color={Color.GREY_500}
            width={'30%'}
          >
            + {totalInfras - 1}
          </Text>
        )}
      </Layout.Horizontal>
    </Container>
  ) : (
    <>{'-'}</>
  )
}

export const RenderInfraCount: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { totalInfras }
  }
}) => {
  return totalInfras ? (
    <Container className={css.paddedContainer}>
      <Text
        font={{ size: 'xsmall', weight: 'bold' }}
        background={Color.GREY_100}
        className={cx(css.countBadge, css.overflow)}
      >
        {numberFormatter(totalInfras)}
      </Text>
    </Container>
  ) : (
    <Text className={css.textStyle}>{'-'}</Text>
  )
}

const RenderInstanceCount: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: { instanceCount }
  }
}) => {
  return instanceCount ? (
    <Container className={css.paddedContainer}>
      <Text
        font={{ size: 'xsmall', weight: 'bold' }}
        background={Color.PRIMARY_1}
        className={cx(css.countBadge, css.overflow)}
      >
        {numberFormatter(instanceCount)}
      </Text>
    </Container>
  ) : (
    <></>
  )
}

const RenderInstances: Renderer<CellProps<TableRowData>> = ({
  row: {
    original: {
      envId,
      artifactVersion: buildId,
      instanceCount,
      tableType,
      infraIdentifier,
      lastPipelineExecutionId,
      clusterIdentifier
    }
  }
}) => {
  TOTAL_VISIBLE_INSTANCES = tableType === TableType.PREVIEW ? 4 : 7

  const clusterId = clusterIdentifier ? clusterIdentifier : undefined
  const infraId = infraIdentifier ? infraIdentifier : undefined
  const pipelineExecutionId = lastPipelineExecutionId ? lastPipelineExecutionId : undefined

  return instanceCount ? (
    <Container className={cx(css.paddedContainer, css.hexContainer)} flex={{ justifyContent: 'flex-start' }}>
      {Array(Math.min(instanceCount, TOTAL_VISIBLE_INSTANCES))
        .fill(null)
        .map((_, index) => (
          <Popover
            interactionKind={PopoverInteractionKind.HOVER}
            disabled={tableType === TableType.SUMMARY}
            key={`${buildId}_${envId}_${index}`}
            position={Position.TOP}
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
              infraIdentifier={infraId}
              clusterId={clusterId}
              isEnvDetail={true}
              pipelineExecutionId={pipelineExecutionId}
            />
          </Popover>
        ))}
      {instanceCount > TOTAL_VISIBLE_INSTANCES ? (
        <Text
          font={{ size: 'small', weight: 'semi-bold' }}
          color={Color.GREY_600}
          margin={{ left: 'xsmall' }}
        >{`+${numberFormatter(instanceCount - TOTAL_VISIBLE_INSTANCES)}`}</Text>
      ) : (
        <></>
      )}
    </Container>
  ) : (
    <></>
  )
}

// Inspired by 'ServicesList > RenderLastDeployment', consider reusing
export const RenderPipelineExecution: Renderer<CellProps<TableRowData>> = ({
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
      {lastDeployedAt ? (
        <ReactTimeago
          date={new Date(lastDeployedAt)}
          component={val => (
            <Text font={{ size: 'small' }} color={Color.GREY_500}>
              {' '}
              {val.children}{' '}
            </Text>
          )}
        />
      ) : null}
    </Layout.Vertical>
  )
}

const columnsProperties = {
  artifacts: {
    width: {
      preview: '26%',
      summary: '18%',
      full: '18%'
    }
  },
  envs: {
    width: {
      preview: '22%',
      summary: '17%',
      full: '17%'
    }
  },
  infras: {
    width: {
      preview: '13%',
      summary: '17%',
      full: '17%'
    }
  },
  instancesCount: {
    width: {
      preview: '8%',
      summary: '5%',
      full: '5%'
    }
  },
  instances: {
    width: {
      preview: '32%',
      summary: '28%',
      full: '28%'
    }
  },
  pipelines: {
    width: {
      preview: '0%',
      summary: '23%',
      full: '23%'
    }
  }
}

export const ActiveServiceInstancesContentV2 = (
  props: React.PropsWithChildren<{
    tableType: TableType
    loading?: boolean
    data?: InstanceGroupedByArtifactV2[]
    error?: GetDataError<unknown> | null
    refetch?: () => Promise<void>
  }>
): React.ReactElement => {
  const { tableType, loading = false, data, error, refetch } = props
  const isCluster = isClusterData(defaultTo(data, []))
  const { getString } = useStrings()
  const tableData: TableRowData[] = useMemo(() => {
    switch (tableType) {
      case TableType.SUMMARY:
        return getSummaryTableData(data)
      case TableType.PREVIEW:
        return getPreviewTableData(data)
      case TableType.FULL:
        return getFullTableData(data)
    }
  }, [data, tableType])

  const columns = useMemo(() => {
    const columnsArray = [
      {
        Header: getString('cd.serviceDashboard.headers.artifactVersion'),
        id: 'artifact',
        width: columnsProperties.artifacts.width[tableType],
        Cell: RenderArtifactVersion
      },
      {
        Header: getString('cd.serviceDashboard.headers.environment'),
        id: 'env',
        width: columnsProperties.envs.width[tableType],
        Cell: RenderEnvironment
      },
      {
        Header: (
          <Text lineClamp={1} color={Color.GREY_900}>
            {isCluster
              ? getString('common.cluster')
              : getString('cd.serviceDashboard.headers.infrastructures').toLocaleUpperCase()}
          </Text>
        ),
        id: 'infra',
        width: columnsProperties.infras.width[tableType],
        Cell: tableType == TableType.PREVIEW ? RenderInfraCount : RenderInfra
      },
      {
        Header: getString('cd.serviceDashboard.headers.instances'),
        id: 'instances',
        width: columnsProperties.instancesCount.width[tableType],
        Cell: RenderInstanceCount
      },
      {
        Header: '',
        id: 'deployments',
        width: columnsProperties.instances.width[tableType],
        Cell: RenderInstances
      }
    ]

    if (tableType != TableType.PREVIEW) {
      columnsArray.push({
        Header: getString('auditTrail.resourceLabel.pipelineExecution'),
        id: 'pipeline',
        width: columnsProperties.pipelines.width[tableType],
        Cell: RenderPipelineExecution
      })
    }

    return columnsArray
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCluster])

  if (loading || error || !(data || []).length || (tableType === TableType.PREVIEW && !tableData.length)) {
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
      return (
        <Layout.Vertical
          height="360px"
          flex={{ align: 'center-center' }}
          data-test="ActiveServiceInstancesEmpty"
          className={css.activeServiceInstancesEmpty}
        >
          <Container margin={{ bottom: 'medium' }}>
            <img width="50" height="50" src={MostActiveServicesEmptyState} style={{ alignSelf: 'center' }} />
          </Container>
          <Text color={Color.GREY_400}>{getString('cd.serviceDashboard.noActiveServiceInstances')}</Text>
        </Layout.Vertical>
      )
    })()
    return component
  }

  return (
    <Layout.Horizontal padding={{ top: 'medium' }}>
      <Table<TableRowData>
        columns={columns}
        data={tableData}
        className={css.instanceTable}
        hideHeaders={tableType != TableType.PREVIEW}
      />
    </Layout.Horizontal>
  )
}
