/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Button,
  ButtonVariation,
  Container,
  Icon,
  Layout,
  ModalDialog,
  PageError,
  PageSpinner,
  TableV2,
  Text
} from '@harness/uicore'
import { Intent } from '@harness/design-system'
import type { CellProps, Column, Renderer, Row, UseExpandedRowProps } from 'react-table'
import { isEmpty, noop } from 'lodash-es'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetTasksLog, GetTasksLogQueryParams, DelegateStackDriverLog } from 'services/portal'
import type { ExecutionNode } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { useTrackEvent } from '@common/hooks/useTelemetry'
import { DelegateActions } from '@common/constants/TrackingConstants'

import css from './DelegateTaskLogs.module.scss'

export enum TaskContext {
  PipelineStep = 'Pipeline_Step',
  ConnectorValidation = 'Connector_Validation'
}

interface Task {
  taskId: string
  taskName: string
}

interface DelegateTaskLogsProps {
  step: ExecutionNode
  telemetry: {
    taskContext: TaskContext
    hasError: boolean
  }
  taskList: Task[]
}

export default function DelegateTaskLogs({ step, telemetry, taskList }: DelegateTaskLogsProps): JSX.Element {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [currentPageToken, setCurrentPageToken] = useState<string | undefined>('')
  const { getString } = useStrings()
  const [previousPageStack, setPreviousPageStack] = useState<Array<string>>([])
  const pageSize = 100
  const timePadding = 60 * 5 // 5 minutes

  useTrackEvent(DelegateActions.DelegateTaskLogsViewed, {
    task_context: telemetry.taskContext,
    has_error: telemetry.hasError
  })

  const delegateInfoList = step.delegateInfoList?.map(delegate => delegate.taskId || '')?.filter(a => a)
  const taskIdsFromProps = taskList.map(task => task.taskId)
  const taskIds = !isEmpty(delegateInfoList) ? delegateInfoList : taskIdsFromProps
  /* istanbul ignore next */
  const startTime = Math.floor((step?.startTs as number) / 1000) - timePadding
  /* istanbul ignore next */
  const endTime = Math.floor((step?.endTs || Date.now()) / 1000) + timePadding

  const queryParams: GetTasksLogQueryParams = {
    accountId,
    taskIds,
    orgId: orgIdentifier,
    projectId: projectIdentifier,
    startTime,
    endTime,
    pageSize
  }

  const { data, loading, refetch, error } = useGetTasksLog({
    queryParams,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const RenderExpandColumn: Renderer<{
    row: UseExpandedRowProps<DelegateStackDriverLog> & Row<DelegateStackDriverLog>
  }> = ({ row }) => {
    return (
      <Icon
        name={row.isExpanded ? 'chevron-down' : 'chevron-right'}
        {...row.getToggleRowExpandedProps()}
        data-testid={`expand-row-${row.index}`}
      />
    )
  }

  const RenderMessageColumn: Renderer<CellProps<DelegateStackDriverLog>> = ({ row }) => {
    return (
      <Text lineClamp={1} intent={row.original.severity === 'ERROR' ? Intent.DANGER : Intent.NONE}>
        {row.original.message}
      </Text>
    )
  }

  function renderRowSubComponent({ row }: { row: Row<DelegateStackDriverLog> }): JSX.Element {
    return (
      <Container padding={{ left: 'xlarge' }} data-testid={`row-content-${row.index}`} className={css.jsonContainer}>
        <pre>{JSON.stringify(row.original, null, 4)}</pre>
      </Container>
    )
  }

  const columns: Column<DelegateStackDriverLog>[] = React.useMemo(() => {
    const cols: Column<DelegateStackDriverLog>[] = [
      {
        Header: '',
        width: '30px',
        id: 'expander',
        Cell: RenderExpandColumn
      },
      {
        Header: 'Severity',
        id: 'severity',
        accessor: row => row.severity,
        width: '100px'
      },
      {
        Header: 'Time',
        id: 'time',
        accessor: row => row.isotime,
        width: '200px'
      },
      {
        Header: 'Message',
        id: 'message',
        accessor: row => row.message,
        Cell: RenderMessageColumn,
        width: '80%'
      }
    ]
    if (taskIds && taskIds.length > 1) {
      cols.splice(3, 0, {
        Header: 'Task Id',
        id: 'taskid',
        accessor: row => row.taskId,
        width: '200px'
      })
      cols[4].width = '60%'
    }
    return cols
  }, [taskIds])

  /* istanbul ignore next */
  if (loading) return <PageSpinner />

  /* istanbul ignore next */
  if (error) return <PageError message={error.message} />

  if (data?.resource?.content && data.resource.content.length > 0) {
    const previousPageToken = previousPageStack.length > 0 ? previousPageStack[previousPageStack.length - 1] : null
    return (
      <>
        <TableV2<DelegateStackDriverLog>
          data={data.resource.content}
          columns={columns}
          minimal
          renderRowSubComponent={renderRowSubComponent}
          onRowClick={noop}
          className={css.table}
        />
        <Layout.Horizontal spacing={'medium'}>
          <Button
            variation={ButtonVariation.SECONDARY}
            icon={'chevron-left'}
            disabled={previousPageToken === null}
            onClick={() => {
              if (previousPageStack.length > 0 && previousPageToken !== null) {
                setPreviousPageStack(previousPageStack.slice(0, previousPageStack.length - 1))
                return refetch({ queryParams: { ...queryParams, pageToken: previousPageToken } })
              }
            }}
            data-testid="button-previous"
          >
            {getString('previous')}
          </Button>
          <Button
            variation={ButtonVariation.SECONDARY}
            rightIcon={'chevron-right'}
            disabled={data?.resource?.pageToken === undefined || data?.resource?.pageToken === null}
            onClick={() => {
              if (currentPageToken !== null && currentPageToken !== undefined) {
                setPreviousPageStack([...previousPageStack, currentPageToken])
              }
              /* istanbul ignore next */
              const nextPageToken = data?.resource?.pageToken
              setCurrentPageToken(nextPageToken)
              return refetch({ queryParams: { ...queryParams, pageToken: nextPageToken } })
            }}
            data-testid="button-next"
          >
            {getString('next')}
          </Button>
        </Layout.Horizontal>
      </>
    )
  } else {
    return (
      <Layout.Vertical flex={{ align: 'center-center' }} spacing="medium" margin="xlarge">
        <Icon name="delegates-icon" size={48} />
        <Text font={{ size: 'medium' }}>{getString('common.logs.noLogsText')}</Text>
        <Button variation={ButtonVariation.SECONDARY} icon={'main-refresh'} onClick={() => refetch({ queryParams })}>
          {getString('common.reload')}
        </Button>
      </Layout.Vertical>
    )
  }
}

interface DelegateTaskLogsModalProps extends DelegateTaskLogsProps {
  isOpen: boolean
  close(): void
}

export function DelegateTaskLogsModal({ isOpen, close, ...rest }: DelegateTaskLogsModalProps): JSX.Element {
  const { getString } = useStrings()
  return (
    <ModalDialog
      isOpen={isOpen}
      onClose={close}
      enforceFocus={false}
      title={getString('common.logs.delegateTaskLogs')}
      className={css.delegateTaskLogsModal}
    >
      <DelegateTaskLogs {...rest} />
    </ModalDialog>
  )
}
