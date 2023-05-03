/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import ReactTimeago from 'react-timeago'
import { Color, FontVariation, Intent } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import {
  Text,
  TableV2,
  Container,
  useToaster,
  Layout,
  useConfirmationDialog,
  ButtonVariation,
  getErrorInfoFromErrorObject,
  Button
} from '@harness/uicore'
import type { Column } from 'react-table'
import { defaultTo, isEqual } from 'lodash-es'
import moment from 'moment'
import { Position } from '@blueprintjs/core'
import { windowLocationUrlPartBeforeHash } from 'framework/utils/WindowLocation'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import type { ExecutionPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { checkIfInstanceCanBeRolledBackPromise, triggerRollbackPromise } from 'services/cd-ng'
import RbacButton from '@rbac/components/Button/Button'
import {
  CellProps,
  CellType,
  PostProdRollbackListTableProps,
  PostProdTableData,
  columnWidth
} from './PostProdRollbackUtil'
import { RenderArtifact, RenderEnv, RenderInfra, RenderInstanceCount } from '../ServiceDetailsEnvTable'
import css from './PostProdRollback.module.scss'

export function RenderExecution({ row }: CellProps): CellType {
  const { pipelineName, pipelineId, planexecutionId, stageExecutionId, stageId } = row.original
  const { orgIdentifier, projectIdentifier, accountId, module, pipelineIdentifier } =
    useParams<PipelineType<PipelinePathProps>>()
  /* istanbul ignore next */
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'
  const { showError } = useToaster()
  const { getString } = useStrings()

  const handleClick = (): void => {
    /* istanbul ignore else */
    if (pipelineId && planexecutionId) {
      const route = routes.toExecutionPipelineView({
        orgIdentifier,
        pipelineIdentifier: pipelineId,
        executionIdentifier: planexecutionId,
        projectIdentifier,
        accountId,
        module,
        source
      })

      if (stageId && stageExecutionId) {
        window.open(`${windowLocationUrlPartBeforeHash()}#${route}?stage=${stageId}&stageExecId=${stageExecutionId}`)
      } else {
        window.open(`${windowLocationUrlPartBeforeHash()}#${route}`)
      }
    } else {
      showError(getString('cd.serviceDashboard.noLastDeployment'))
    }
  }

  return (
    <Container>
      <Text
        lineClamp={1}
        tooltipProps={{ isDark: true }}
        className={cx(css.columnStyle, css.cursor)}
        color={Color.PRIMARY_7}
        onClick={e => {
          e.stopPropagation()
          handleClick()
        }}
      >
        {pipelineName ? pipelineName : '-'}
      </Text>
    </Container>
  )
}

export function RenderStatus({ row }: CellProps): CellType {
  const { rollbackStatus } = row.original

  if (!rollbackStatus) {
    return <Text>-</Text>
  }
  return <ExecutionStatusLabel status={rollbackStatus} />
}

export function RenderLastDeployedTime({ row }: CellProps): CellType {
  const { lastDeployedAt } = row.original

  if (!lastDeployedAt) {
    return <Text>-</Text>
  }

  return (
    <Text
      font={{ variation: FontVariation.SMALL }}
      lineClamp={1}
      tooltipProps={{
        isDark: true,
        position: Position.BOTTOM_RIGHT,
        targetClassName: css.targetWidth
      }}
      tooltip={
        <Text
          icon="time"
          iconProps={{ size: 12, margin: 'xsmall', color: Color.GREY_100 }}
          font={{ size: 'small' }}
          color={Color.GREY_100}
          padding="medium"
        >
          {moment(lastDeployedAt).format('DD MMM, YYYY HH:mm z')}
        </Text>
      }
      alwaysShowTooltip={true}
      className={css.cursor}
    >
      <ReactTimeago date={lastDeployedAt as number} />
    </Text>
  )
}

export function PostProdRollbackListTable({
  data,
  isEnvGroup,
  setDrawerOpen
}: PostProdRollbackListTableProps): React.ReactElement {
  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()
  const [selectedRow, setSelectedRow] = React.useState<{
    infrastructureMappingId?: string
    instanceKey?: string
    uniqueRowKey: string
    artifact?: string
    infraName?: string
    pipelineId?: string
  }>()
  const {
    orgIdentifier,
    projectIdentifier,
    accountId,
    module,
    pipelineIdentifier: pipId
  } = useParams<PipelineType<PipelinePathProps>>()
  const source: ExecutionPathProps['source'] = pipId ? 'executions' : 'deployments'

  const requestParamForRollback = {
    body: {
      infrastructureMappingId: defaultTo(selectedRow?.infrastructureMappingId, ''),
      instanceKey: defaultTo(selectedRow?.instanceKey, '')
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  }

  //take user to pipeline execution if rollback is triggered successfully
  const directToRollbackExecution = (pipelineId: string, planExecutionId: string): void => {
    // istanbul ignore else
    if (pipelineId && planExecutionId) {
      const route = routes.toExecutionPipelineView({
        orgIdentifier,
        pipelineIdentifier: pipelineId,
        executionIdentifier: planExecutionId,
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

  // trigger the rollback if rollback is allowed
  const triggerRollbackAction = async (): Promise<void> => {
    clear()
    try {
      const response = await triggerRollbackPromise({ ...requestParamForRollback })
      // istanbul ignore else
      if (response.data?.rollbackTriggered) {
        showSuccess(getString('cd.serviceDashboard.postProdRollback.rollbackTriggedSuccessfully'))
        directToRollbackExecution(defaultTo(selectedRow?.pipelineId, ''), defaultTo(response.data?.planExecutionId, ''))
        setDrawerOpen(false)
      } else {
        showError(response.data?.message)
      }
    } catch (e: any) {
      // istanbul ignore next
      showError(getErrorInfoFromErrorObject(e))
    }
  }

  //check for valid rollback action
  const rollbackAction = async (): Promise<void> => {
    clear()
    try {
      const response = await checkIfInstanceCanBeRolledBackPromise({ ...requestParamForRollback })
      if (response.data?.rollbackAllowed) {
        await triggerRollbackAction()
      } else {
        showError(response.data?.message)
      }
    } catch (e: any) {
      // istanbul ignore next
      showError(getErrorInfoFromErrorObject(e))
    }
  }

  const confirmationText = (
    <Layout.Vertical>
      <Text margin={{ bottom: 'small' }}>
        {getString('cd.serviceDashboard.postProdRollback.rollbackConfirmationText')}
      </Text>
      <li style={{ marginLeft: 12 }}>
        <strong>{selectedRow?.infraName}</strong>
        {` (${selectedRow?.artifact})`}
      </li>
    </Layout.Vertical>
  )

  const { openDialog: openRollbackConfirmation, closeDialog } = useConfirmationDialog({
    contentText: confirmationText,
    titleText: getString('cd.serviceDashboard.postProdRollback.rollbackConfirmationTitle'),
    intent: Intent.WARNING,
    customButtons: (
      <Layout.Horizontal spacing="small">
        <Button
          text={getString('confirm')}
          onClick={async () => {
            await rollbackAction()
            closeDialog()
          }}
          variation={ButtonVariation.PRIMARY}
        />
        <Button
          text={getString('cancel')}
          onClick={() => {
            closeDialog()
          }}
          variation={ButtonVariation.TERTIARY}
        />
      </Layout.Horizontal>
    )
  })

  const haveEnvGroup = isEnvGroup ? 'haveEnvGroup' : 'noEnvGroup'

  const columns: Column<PostProdTableData>[] = useMemo(() => {
    const columnsArray = [
      {
        Header: getString('cd.infra'),
        id: 'infra',
        width: columnWidth.infras[haveEnvGroup],
        Cell: RenderInfra
      },
      {
        Header: getString('cd.serviceDashboard.artifact'),
        id: 'artifact',
        width: columnWidth.artifacts[haveEnvGroup],
        Cell: RenderArtifact
      },
      {
        Header: getString('cd.serviceDashboard.headers.instances'),
        id: 'instances',
        width: columnWidth.instancesCount[haveEnvGroup],
        Cell: RenderInstanceCount
      },
      {
        Header: getString('executionsText'),
        id: 'execution',
        width: columnWidth.execution[haveEnvGroup],
        Cell: RenderExecution
      },
      {
        Header: getString('cd.serviceDashboard.headers.rollbackStatus'),
        id: 'rollbackStatus',
        width: columnWidth.status[haveEnvGroup],
        Cell: RenderStatus
      },
      {
        Header: getString('cd.serviceDashboard.lastDeployment'),
        id: 'lastDeployedTime',
        width: columnWidth.lastDeployedTime[haveEnvGroup],
        Cell: RenderLastDeployedTime
      }
    ]

    if (isEnvGroup) {
      columnsArray.unshift({
        Header: getString('environment'),
        id: 'environment',
        width: columnWidth.envs[haveEnvGroup],
        Cell: RenderEnv
      })
    }
    return columnsArray as unknown as Column<PostProdTableData>[]
  }, [getString, haveEnvGroup, isEnvGroup])

  return (
    <>
      <TableV2
        columns={columns}
        data={data}
        sortable
        className={css.table}
        onRowClick={(row, idx) => {
          const uniqueRowKey = `${idx}_${row.infrastructureMappingId}_${row.instanceKey}`
          if (selectedRow?.uniqueRowKey === uniqueRowKey) {
            setSelectedRow(undefined)
          } else {
            setSelectedRow({
              infrastructureMappingId: row.infrastructureMappingId,
              instanceKey: row.instanceKey,
              uniqueRowKey,
              artifact: row.artifact,
              infraName: row.infrastructureName,
              pipelineId: row.pipelineId
            })
          }
        }}
        getRowClassName={row =>
          isEqual(
            `${row.index}_${row.original.infrastructureMappingId}_${row.original.instanceKey}`,
            selectedRow?.uniqueRowKey
          )
            ? css.selected
            : ''
        }
      />
      <Text
        icon="warning-icon"
        iconProps={{ color: Color.ORANGE_700 }}
        color={Color.ORANGE_700}
        padding={{ left: 'xxlarge', right: 'xxlarge' }}
        font={{ variation: FontVariation.BODY }}
      >
        {getString('cd.serviceDashboard.postProdRollback.rollbackWarningText')}
      </Text>
      <Layout.Horizontal spacing="medium" padding={{ bottom: 'xxxlarge', left: 'xxlarge' }}>
        <RbacButton
          variation={ButtonVariation.PRIMARY}
          text={getString('rollbackLabel')}
          permission={{
            resourceScope: {
              accountIdentifier: accountId,
              orgIdentifier,
              projectIdentifier
            },
            resource: {
              resourceType: ResourceType.PIPELINE,
              resourceIdentifier: selectedRow?.pipelineId
            },
            permission: PermissionIdentifier.EXECUTE_PIPELINE
          }}
          onClick={openRollbackConfirmation}
          disabled={!selectedRow?.uniqueRowKey}
          id="rollbackBtn"
        />
        <Button
          margin={{ left: 'small' }}
          text={getString('cancel')}
          onClick={() => {
            setDrawerOpen(false)
          }}
          id="cancelBtn"
          variation={ButtonVariation.SECONDARY}
        />
      </Layout.Horizontal>
    </>
  )
}
