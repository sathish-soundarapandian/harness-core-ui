import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Button,
  ButtonVariation,
  Container,
  Icon,
  Layout,
  ModalDialog,
  NoDataCard,
  PageError,
  PageSpinner,
  TableV2,
  Text
} from '@harness/uicore'
import { Intent } from '@harness/design-system'
import type { CellProps, Column, Renderer, Row, UseExpandedRowProps } from 'react-table'
import { noop } from 'lodash-es'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetTasksLog, GetTasksLogQueryParams, DelegateStackDriverLog } from 'services/portal'
import type { ExecutionNode } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'

import css from './DelegateTaskLogs.module.scss'

interface DelegateTaskLogsProps {
  step: ExecutionNode
}

export default function DelegateTaskLogs({ step }: DelegateTaskLogsProps): JSX.Element {
  // TODO: Add segment event
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [currentPageToken, setCurrentPageToken] = useState<string | undefined>('')
  const { getString } = useStrings()
  const [previousPageStack, setPreviousPageStack] = useState<Array<string>>([])
  const pageSize = 1000

  /* istanbul ignore next */
  const taskIds = step.delegateInfoList?.map(delegate => delegate.taskId || '')?.filter(a => a)
  /* istanbul ignore next */
  const startTime = Math.floor((step?.startTs as number) / 1000)
  /* istanbul ignore next */
  const endTime = Math.floor((step?.endTs || Date.now()) / 1000)

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
      <Container padding={{ left: 'xlarge' }} data-testid={`row-content-${row.index}`}>
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
        />
        <Layout.Horizontal margin={{ bottom: 'large' }} spacing={'medium'} flex={{ justifyContent: 'center' }}>
          <Button
            variation={ButtonVariation.PRIMARY}
            icon={'chevron-left'}
            disabled={previousPageToken === null}
            onClick={() => {
              if (previousPageStack.length > 0 && previousPageToken !== null) {
                setPreviousPageStack(previousPageStack.slice(0, previousPageStack.length - 1))
                refetch({ queryParams: { ...queryParams, pageToken: previousPageToken } })
              }
            }}
            data-testid="button-previous"
          >
            {getString('previous')}
          </Button>
          <Button
            variation={ButtonVariation.PRIMARY}
            icon={'chevron-right'}
            disabled={data?.resource?.pageToken === undefined}
            onClick={() => {
              if (currentPageToken !== null && currentPageToken !== undefined) {
                setPreviousPageStack([...previousPageStack, currentPageToken])
              }
              /* istanbul ignore next */
              const nextPageToken = data?.resource?.pageToken
              setCurrentPageToken(nextPageToken)
              refetch({ queryParams: { ...queryParams, pageToken: nextPageToken } })
            }}
            data-testid="button-next"
          >
            {getString('next')}
          </Button>
        </Layout.Horizontal>
      </>
    )
  } else {
    return <NoDataCard />
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
