/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { parse } from 'yaml'
import ReactTimeago from 'react-timeago'
import { useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import {
  Button,
  Layout,
  Popover,
  Text,
  Icon,
  Switch,
  Container,
  SparkChart,
  TagsPopover,
  tagsType,
  useConfirmationDialog,
  useToaster,
  TableV2,
  HarnessDocTooltip
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import copy from 'clipboard-copy'
import { Classes, Intent, Menu, Position } from '@blueprintjs/core'
import { isUndefined, isEmpty, sum, get } from 'lodash-es'
import cx from 'classnames'
import {
  NGTriggerDetailsResponse,
  PageNGTriggerDetailsResponse,
  useDeleteTrigger,
  useUpdateTrigger
} from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import type { UseStringsReturn } from 'framework/strings'
import useIsNewGitSyncRemotePipeline from '@triggers/components/Triggers/useIsNewGitSyncRemotePipeline'
import type { GitQueryParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import { useQueryParams } from '@common/hooks'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import { useIsTriggerCreatePermission } from '@triggers/components/Triggers/useIsTriggerCreatePermission'
import { getTriggerIcon, GitSourceProviders, getEnabledStatusTriggerValues } from '../utils/TriggersListUtils'
import { TriggerTypes, clearNullUndefined, ResponseStatus } from '../utils/TriggersWizardPageUtils'
import TriggerStatusCell from './subviews/TriggerStatusCell'
import css from './TriggersListSection.module.scss'

export interface GoToEditWizardInterface {
  triggerIdentifier: string
  // only used for url not showing undefined
  triggerType?: string
}
interface TriggersListSectionProps {
  triggerListData?: PageNGTriggerDetailsResponse
  refetchTriggerList: () => void
  goToEditWizard: ({ triggerIdentifier, triggerType }: GoToEditWizardInterface) => void
  goToDetails: ({ triggerIdentifier, triggerType }: GoToEditWizardInterface) => void
  isPipelineInvalid?: boolean
  gitAwareForTriggerEnabled?: boolean
  goToActivityHistory: ({ triggerIdentifier }: GoToEditWizardInterface) => void
}

// type CustomColumn<T extends object> = Column<T> & {
//   refetchTriggerList?: () => void
//   goToEditWizard?: ({ triggerIdentifier, triggerType }: GoToEditWizardInterface) => void
//   getString?: (key: string) => string
// }

interface RenderColumnRow {
  original: NGTriggerDetailsResponse
}
interface RenderColumnMenuColumn {
  refetchTriggerList: () => void
  goToEditWizard: ({ triggerIdentifier, triggerType }: GoToEditWizardInterface) => void
  showSuccess: (str: string) => void
  showError: (str: string) => void
  getString: UseStringsReturn['getString']
  projectIdentifier: string
  orgIdentifier: string
  accountId: string
  pipelineIdentifier: string
  isTriggerRbacDisabled: boolean
  goToActivityHistory: ({ triggerIdentifier }: GoToEditWizardInterface) => void
}

const RenderColumnMenu: Renderer<CellProps<NGTriggerDetailsResponse>> = ({
  row,
  column
}: {
  row: RenderColumnRow
  column: RenderColumnMenuColumn
}) => {
  const data = row.original
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { mutate: deleteTrigger } = useDeleteTrigger({
    queryParams: {
      accountIdentifier: column.accountId,
      orgIdentifier: column.orgIdentifier,
      projectIdentifier: column.projectIdentifier,
      targetIdentifier: column.pipelineIdentifier
    }
  })
  const disableActivityHistory = data.type !== TriggerTypes.SCHEDULE && data.type !== TriggerTypes.WEBHOOK
  const { openDialog: confirmDelete } = useConfirmationDialog({
    contentText: `${column.getString('triggers.confirmDelete')} ${data.name || /* istanbul ignore next */ ''}`,
    titleText: column.getString('common.triggerLabel'),
    confirmButtonText: column.getString('delete'),
    cancelButtonText: column.getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */
      if (isConfirmed) {
        try {
          const deleted = await deleteTrigger(data.identifier || /* istanbul ignore next */ '', {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */
          if (deleted.status === ResponseStatus.SUCCESS) {
            column.showSuccess(
              `${column.getString('common.triggerLabel')} ${
                data.name || /* istanbul ignore next */ ''
              } ${column.getString('deleted')}`
            )
          }
          column.refetchTriggerList?.()
        } catch (err) {
          /* istanbul ignore next */
          column.showError(err?.data?.message)
        }
      }
    }
  })
  const { CDS_TRIGGER_ACTIVITY_PAGE } = useFeatureFlags()
  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          className={css.actionButton}
          icon="more"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
          data-testid={`${data.identifier}-more-button`}
        />
        <Menu style={{ minWidth: 'unset' }}>
          <Menu.Item
            icon="edit"
            className={column.isTriggerRbacDisabled ? css.disabledOption : ''}
            textClassName={column.isTriggerRbacDisabled ? css.disabledOption : ''}
            text={column.getString('edit')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              if (column.isTriggerRbacDisabled) {
                return
              }
              if (data?.identifier && data.type) {
                column.goToEditWizard({ triggerIdentifier: data.identifier, triggerType: data.type })
              }
              setMenuOpen(false)
            }}
            data-testid={`${data.identifier}-edit-button`}
          />
          <Menu.Divider />
          {CDS_TRIGGER_ACTIVITY_PAGE && (
            <>
              <Menu.Item
                icon="history"
                text={column.getString('activityHistoryLabel')}
                className={disableActivityHistory ? css.disabledOption : ''}
                textClassName={disableActivityHistory ? css.disabledOption : ''}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  if (data?.identifier && data.type) {
                    column.goToActivityHistory({ triggerIdentifier: data.identifier })
                  }
                  setMenuOpen(false)
                }}
              />
              <Menu.Divider />
            </>
          )}
          <Menu.Item
            icon="trash"
            className={column.isTriggerRbacDisabled ? css.disabledOption : ''}
            textClassName={column.isTriggerRbacDisabled ? css.disabledOption : ''}
            text={column.getString('delete')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              if (column.isTriggerRbacDisabled) {
                return
              }
              confirmDelete()
              setMenuOpen(false)
            }}
            data-testid={`${data.identifier}-delete-button`}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const RenderCenteredColumnHeader = (header: string): JSX.Element => <div className={css.textCentered}>{header}</div>

const RenderColumnTrigger: Renderer<CellProps<NGTriggerDetailsResponse>> = ({
  row,
  column
}: {
  row: RenderColumnRow
  column: { getString: UseStringsReturn['getString'] }
}) => {
  const data = row.original
  return (
    <>
      <Layout.Horizontal spacing="small" data-testid={data.identifier} className={css.triggerNameStyle}>
        <Icon
          name={
            data.type
              ? getTriggerIcon({
                  type: data.type,
                  webhookSourceRepo: data?.webhookDetails?.webhookSourceRepo,
                  buildType: data?.buildDetails?.buildType
                })
              : 'yaml-builder-trigger'
          }
          size={26}
        />
        <Layout.Vertical padding={{ left: 'small' }}>
          <Layout.Horizontal spacing="small" data-testid={data.identifier}>
            <Text color={Color.BLACK} lineClamp={1}>
              {data.name}
            </Text>
            {!isEmpty(data.tags) ? <TagsPopover className={css.tags} tags={data.tags as tagsType} /> : null}
          </Layout.Horizontal>
          <Text color={Color.GREY_400} lineClamp={1}>
            {column.getString('idLabel', { id: data.identifier })}
          </Text>
        </Layout.Vertical>
      </Layout.Horizontal>
    </>
  )
}

const RenderColumnStatus: Renderer<CellProps<NGTriggerDetailsResponse>> = ({ row }) => {
  const { triggerStatus } = row.original
  return triggerStatus ? <TriggerStatusCell triggerStatus={triggerStatus} /> : null
}

const RenderColumnActivity: Renderer<CellProps<NGTriggerDetailsResponse>> = ({
  row,
  column
}: {
  row: RenderColumnRow
  column: { getString: UseStringsReturn['getString'] }
}) => {
  const data = row.original as any // temporary until API ready
  const executions = data.executions
  const numDays = executions?.length
  if (numDays === 0) return undefined
  const numActivations = sum(executions)
  return (
    <Layout.Horizontal flex={{ align: 'center-center' }} style={{ justifyContent: 'flex-start' }} spacing="xsmall">
      <span className={css.activityChart}>{numActivations !== 0 && <SparkChart data={executions} />}</span>
      <Container style={{ textAlign: 'start' }}>
        <span>{column.getString('triggers.activityActivation', { numActivations })}</span>
        <Text>{column.getString('triggers.activityDays', { numDays })}</Text>
      </Container>
    </Layout.Horizontal>
  )
}

const RenderColumnLastActivation: Renderer<CellProps<NGTriggerDetailsResponse>> = ({ row }) => {
  const data = row.original
  const lastExecutionTime = data.lastTriggerExecutionDetails?.lastExecutionTime
  const lastExecutionSuccessful = data.lastTriggerExecutionDetails?.lastExecutionSuccessful

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-start' }} spacing="small" data-testid={data.identifier}>
      <div className={css.activityStatement}>
        {!isUndefined(lastExecutionTime) && !isUndefined(lastExecutionSuccessful) ? (
          <>
            <Layout.Horizontal style={{ alignItems: 'center' }}>
              <Container style={{ textAlign: 'start' }}>
                <Text>{lastExecutionTime ? <ReactTimeago date={lastExecutionTime} /> : null}</Text>
              </Container>
              <Icon
                style={{ paddingLeft: 'var(--spacing-xsmall)' }}
                name="dot"
                color={lastExecutionSuccessful ? 'green500' : 'red500'}
                size={20}
              />
            </Layout.Horizontal>
          </>
        ) : null}
      </div>
    </Layout.Horizontal>
  )
}

const RenderWebhookIcon = ({
  type,
  webhookSourceRepo,
  webhookUrl,
  column,
  curlCommand,
  identifier
}: {
  type?: string
  webhookSourceRepo?: string
  webhookUrl?: string
  column: {
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
    getString: UseStringsReturn['getString']
    isTriggerRbacDisabled: boolean
  }
  identifier?: string
  curlCommand?: string
}): JSX.Element => {
  const [optionsOpen, setOptionsOpen] = React.useState(false)
  if (!type || type !== TriggerTypes.WEBHOOK || !webhookUrl) {
    return <Text color={Color.GREY_400}>{column.getString('na')}</Text>
  }

  if (webhookSourceRepo?.toLowerCase() === GitSourceProviders.CUSTOM.value.toLowerCase()) {
    return (
      <Popover
        isOpen={optionsOpen}
        onInteraction={nextOpenState => {
          setOptionsOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          className={cx(css.webhookUrl, column.isTriggerRbacDisabled ? css.disabledOption : '')}
          icon="webhook"
          iconProps={{
            size: 20
          }}
          onClick={e => {
            e.stopPropagation()
            if (column.isTriggerRbacDisabled) {
              return
            }
            setOptionsOpen(true)
          }}
          data-testid={`${identifier}-copy`}
        />
        <Menu style={{ minWidth: 'unset' }}>
          <Menu.Item
            text={column.getString('triggers.copyAsUrl')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              copy(webhookUrl)
              ;(column as any).showSuccess(column.getString('triggers.toast.webhookUrlCopied'))
              setOptionsOpen(false)
            }}
            data-testid={`${identifier}-copyAsUrl`}
          />
          {curlCommand && (
            <>
              <Menu.Divider />
              <Menu.Item
                text={column.getString('triggers.copyAsCurl')}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  copy(curlCommand)
                  ;(column as any).showSuccess(column.getString('triggers.toast.webhookCurlCopied'))
                  setOptionsOpen(false)
                }}
                data-testid={`${identifier}-copyAsCurl`}
              />
            </>
          )}
        </Menu>
      </Popover>
    )
  } else {
    return (
      <Button
        className={css.webhookUrl}
        icon="webhook"
        iconProps={{
          size: 20
        }}
        color={Color.BLUE_500}
        minimal
        onClick={e => {
          e.stopPropagation()
          copy(webhookUrl)
          ;(column as any).showSuccess(column.getString('triggers.toast.webhookUrlCopied'))
        }}
        data-testid={`${identifier}-copy`}
      />
    )
  }
}

const RenderColumnWebhook: Renderer<CellProps<NGTriggerDetailsResponse>> = ({
  row,
  column
}: {
  row: RenderColumnRow
  column: {
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
    getString: UseStringsReturn['getString']
    isTriggerRbacDisabled: boolean
  }
}) => {
  const data = row.original

  return (
    <div className={css.textCentered}>
      {RenderWebhookIcon({
        type: data?.type,
        webhookSourceRepo: data?.webhookDetails?.webhookSourceRepo,
        webhookUrl: data?.webhookUrl,
        curlCommand: data?.webhookCurlCommand,
        identifier: data.identifier,
        column
      })}
    </div>
  )
}

const RenderColumnEnable: Renderer<CellProps<NGTriggerDetailsResponse>> = ({
  row,
  column
}: {
  row: RenderColumnRow
  column: {
    showSuccess: (str: string) => void
    showError: (str: string) => void
    getString: UseStringsReturn['getString']
    refetchTriggerList: () => void
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    pipelineIdentifier: string
    isTriggerRbacDisabled: boolean
  }
}) => {
  const data = row.original
  const isNewGitSyncRemotePipeline = useIsNewGitSyncRemotePipeline()
  const { branch, connectorRef, repoName, storeType } = useQueryParams<GitQueryParams>()

  const { mutate: updateTrigger, loading: updateTriggerLoading } = useUpdateTrigger({
    triggerIdentifier: data.identifier as string,
    queryParams: {
      accountIdentifier: column.accountId,
      orgIdentifier: column.orgIdentifier,
      projectIdentifier: column.projectIdentifier,
      targetIdentifier: column.pipelineIdentifier,
      ignoreError: true,
      ...(isNewGitSyncRemotePipeline && {
        branch,
        connectorRef,
        repoName,
        storeType
      })
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  return (
    <div className={css.textCentered} onClick={e => e.stopPropagation()}>
      <Switch
        label=""
        className={column.isTriggerRbacDisabled ? css.disabledOption : ''}
        checked={data.enabled}
        disabled={updateTriggerLoading || column.isTriggerRbacDisabled}
        onChange={async () => {
          if (column.isTriggerRbacDisabled) {
            return
          }
          const { values, error } = getEnabledStatusTriggerValues({
            data,
            enabled: !data.enabled,
            getString: column.getString
          })
          if (error) {
            column.showError(error)
            return
          }
          try {
            const { status, data: dataResponse } = await updateTrigger(
              yamlStringify({ trigger: clearNullUndefined(values) }) as any
            )
            if (dataResponse?.errors && !isEmpty(dataResponse?.errors)) {
              column.showError(column.getString('triggers.toast.existingTriggerError'))
              return
            } else if (status === ResponseStatus.SUCCESS && dataResponse) {
              column.showSuccess(
                column.getString('triggers.toast.toggleEnable', {
                  enabled: dataResponse.enabled ? 'enabled' : 'disabled',
                  name: dataResponse.name || ''
                })
              )
              column.refetchTriggerList?.()
            }
          } catch (err) {
            column.showError(err?.data?.message)
          }
        }}
        data-testid={`${data.identifier}-enabled`}
      />
    </div>
  )
}

const RenderPipelineReferenceBranch: Renderer<CellProps<NGTriggerDetailsResponse>> = ({
  row
}: {
  row: RenderColumnRow
}): JSX.Element => {
  let data
  try {
    data = parse(row.original?.yaml || '')
    return (
      <Container flex>
        <Text icon="git-new-branch" iconProps={{ size: 14 }} lineClamp={1}>
          {get(data, 'trigger.pipelineBranchName')}
        </Text>
      </Container>
    )
  } catch (e) {
    return <></>
  }
}

export const TriggersListSection: React.FC<TriggersListSectionProps> = ({
  triggerListData,
  refetchTriggerList,
  goToEditWizard,
  goToDetails,
  isPipelineInvalid,
  gitAwareForTriggerEnabled,
  goToActivityHistory
}): JSX.Element => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<PipelinePathProps>()
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const data = get(triggerListData, 'content')
  const pageIndex = get(triggerListData, 'pageIndex', DEFAULT_PAGE_INDEX)
  const pageSize = get(triggerListData, 'pageSize', PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : DEFAULT_PAGE_SIZE)
  const totalItems = get(triggerListData, 'totalItems', 0)
  const totalPages = get(triggerListData, 'totalPages', 0)

  const isTriggerCreatePermission = useIsTriggerCreatePermission()

  const isTriggerRbacDisabled = !isTriggerCreatePermission || isPipelineInvalid

  const columns: any = React.useMemo(
    // const columns: CustomColumn<NGTriggerDetailsResponse>[] = React.useMemo( // wait for backend to support condition
    () => [
      {
        Header: getString('common.triggerLabel').toUpperCase(),
        accessor: 'name',
        width: gitAwareForTriggerEnabled ? '20%' : '22%',
        Cell: RenderColumnTrigger,
        getString
      },
      {
        Header: 'STATUS',
        accessor: 'status',
        width: gitAwareForTriggerEnabled ? '10%' : '18%',
        disableSortBy: true,
        Cell: RenderColumnStatus,
        getString
      },
      ...(gitAwareForTriggerEnabled
        ? [
            {
              Header: (
                <Text
                  font={{ variation: FontVariation.TABLE_HEADERS }}
                  data-tooltip-id="triggerPipelineReferenceBranch"
                >
                  {getString('triggers.pipelineReferenceBranch').toUpperCase()}
                  <HarnessDocTooltip tooltipId="triggerPipelineReferenceBranch" useStandAlone={true} />
                </Text>
              ),
              accessor: 'yaml',
              width: '20%',
              disableSortBy: true,
              Cell: RenderPipelineReferenceBranch,
              getString
            }
          ]
        : []),
      {
        Header: getString('activity').toUpperCase(),
        accessor: 'activity',
        width: gitAwareForTriggerEnabled ? '15%' : '20%',
        Cell: RenderColumnActivity,
        disableSortBy: true,
        getString
      },
      {
        Header: getString('triggers.lastActivationLabel'),
        accessor: 'lastExecutionTime',
        width: gitAwareForTriggerEnabled ? '10%' : '15%',
        Cell: RenderColumnLastActivation,
        disableSortBy: true
      },

      {
        Header: RenderCenteredColumnHeader(getString('execution.triggerType.WEBHOOK').toUpperCase()),
        accessor: 'webhook',
        width: '10%',
        Cell: RenderColumnWebhook,
        disableSortBy: true,
        showSuccess,
        orgIdentifier,
        projectIdentifier,
        accountId,
        getString,
        isTriggerRbacDisabled
      },
      {
        Header: RenderCenteredColumnHeader(getString('enabledLabel').toUpperCase()),
        accessor: 'enable',
        width: '10%',
        Cell: RenderColumnEnable,
        disableSortBy: true,
        projectIdentifier,
        orgIdentifier,
        accountId,
        pipelineIdentifier,
        showSuccess,
        showError,
        refetchTriggerList,
        getString,
        isTriggerRbacDisabled
      },
      {
        Header: '',
        accessor: 'type',
        width: '5%',
        Cell: RenderColumnMenu,
        disableSortBy: true,
        refetchTriggerList,
        goToEditWizard,
        showSuccess,
        showError,
        projectIdentifier,
        orgIdentifier,
        accountId,
        pipelineIdentifier,
        getString,
        isTriggerRbacDisabled,
        goToActivityHistory
      }
    ],
    [goToEditWizard, refetchTriggerList, getString, gitAwareForTriggerEnabled, goToActivityHistory]
  )

  const paginationProps = useDefaultPaginationProps({
    itemCount: totalItems,
    pageSize,
    pageCount: totalPages,
    pageIndex
  })

  return (
    <TableV2<NGTriggerDetailsResponse>
      className={css.table}
      columns={columns}
      data={data || /* istanbul ignore next */ []}
      pagination={paginationProps}
      onRowClick={item => goToDetails({ triggerIdentifier: item.identifier || '' })}
    />
  )
}
