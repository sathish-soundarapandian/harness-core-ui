/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  Popover,
  ButtonProps,
  useConfirmationDialog,
  Layout,
  ButtonSize,
  ButtonVariation
} from '@harness/uicore'
import { Classes, Intent, Menu, MenuItem, Position } from '@blueprintjs/core'
import { Link } from 'react-router-dom'
import { defaultTo } from 'lodash-es'

import { HandleInterruptQueryParams, useHandleInterrupt, useHandleStageInterrupt } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import {
  isExecutionComplete,
  isExecutionActive,
  isExecutionPaused,
  isExecutionPausing,
  ExecutionStatus,
  isRetryPipelineAllowed
} from '@pipeline/utils/statusHelpers'
import { getFeaturePropsForRunPipelineButton } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import { useRunPipelineModalV1 } from '@pipeline/v1/components/RunPipelineModalV1/useRunPipelineModalV1'
import type { StringKeys } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ExecutionPathProps, GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { killEvent } from '@common/utils/eventUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isSimplifiedYAMLEnabled } from '@common/utils/utils'
import { PipelineExecutionActions } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useRunPipelineModal } from '../RunPipelineModal/useRunPipelineModal'
import { useExecutionCompareContext } from '../ExecutionCompareYaml/ExecutionCompareContext'
import { useOpenRetryPipelineModal } from './useOpenRetryPipelineModal'
import css from './ExecutionActions.module.scss'

const commonButtonProps: ButtonProps = {
  variation: ButtonVariation.ICON,
  tooltipProps: {
    isDark: true
  }
}

export interface ExecutionActionsProps {
  executionStatus?: ExecutionStatus
  params: PipelineType<{
    orgIdentifier: string
    projectIdentifier: string
    pipelineIdentifier: string
    executionIdentifier: string
    accountId: string
    stagesExecuted?: string[]
  }> &
    GitQueryParams
  refetch?(): Promise<void>
  noMenu?: boolean
  stageId?: string
  stageName?: string
  canEdit?: boolean
  canExecute?: boolean
  canRetry?: boolean
  modules?: string[]
  showEditButton?: boolean
  isPipelineInvalid?: boolean
  source: ExecutionPathProps['source']
  onViewCompiledYaml?: () => void
  onCompareExecutions?: () => void
  onReRunInDebugMode?: (() => void) | undefined
  menuOnlyActions?: boolean
  isExecutionListView?: boolean
  hideRetryOption?: boolean
}

export function getValidExecutionActions(canExecute: boolean, executionStatus?: ExecutionStatus) {
  return {
    canAbort: isExecutionActive(executionStatus) && canExecute,
    canRollback: isExecutionActive(executionStatus) && canExecute,
    canPause:
      isExecutionActive(executionStatus) &&
      !isExecutionPaused(executionStatus) &&
      !isExecutionPausing(executionStatus) &&
      canExecute,
    canRerun: isExecutionComplete(executionStatus) && canExecute,
    canResume: isExecutionPaused(executionStatus) && canExecute
  }
}

function getActionTexts(stageId?: string): {
  abortText: StringKeys
  pauseText: StringKeys
  rerunText: StringKeys
  resumeText: StringKeys
  UserMarkedFailure: StringKeys
} {
  return {
    abortText: stageId ? 'pipeline.execution.actions.abortStage' : 'pipeline.execution.actions.abortPipeline',
    pauseText: stageId ? 'pipeline.execution.actions.pauseStage' : 'pipeline.execution.actions.pausePipeline',
    rerunText: stageId ? 'pipeline.execution.actions.rerunStage' : 'pipeline.execution.actions.rerunPipeline',
    resumeText: stageId ? 'pipeline.execution.actions.resumeStage' : 'pipeline.execution.actions.resumePipeline',
    UserMarkedFailure: 'pipeline.failureStrategies.strategiesLabel.UserMarkedFailure'
  }
}

function getSuccessMessage(
  getString: (key: StringKeys, vars?: Record<string, any>) => string,
  interruptType: HandleInterruptQueryParams['interruptType'],
  stageId?: string,
  stageName?: string
): string {
  if (stageId) {
    return interruptType === 'AbortAll'
      ? getString('pipeline.execution.stageActionMessages.abortedMessage', {
          stageName
        })
      : interruptType === 'Pause'
      ? getString('pipeline.execution.stageActionMessages.pausedMessage', {
          stageName
        })
      : interruptType === 'Resume'
      ? getString('pipeline.execution.stageActionMessages.resumedMessage', {
          stageName
        })
      : interruptType === 'UserMarkedFailure'
      ? getString('pipeline.execution.stageActionMessages.userMarkFailedMessage', { stageName })
      : ''
  } else {
    return interruptType === 'AbortAll'
      ? getString('pipeline.execution.pipelineActionMessages.abortedMessage')
      : interruptType === 'Pause'
      ? getString('pipeline.execution.pipelineActionMessages.pausedMessage')
      : interruptType === 'Resume'
      ? getString('pipeline.execution.pipelineActionMessages.resumedMessage')
      : ''
  }
}

// eslint-disable-next-line react/function-component-definition
const ExecutionActions: React.FC<ExecutionActionsProps> = props => {
  const {
    executionStatus,
    params,
    noMenu,
    stageId,
    canEdit = true,
    canExecute = true,
    stageName,
    canRetry = false,
    modules,
    source,
    showEditButton = true,
    isPipelineInvalid,
    onViewCompiledYaml,
    onCompareExecutions,
    onReRunInDebugMode,
    menuOnlyActions,
    isExecutionListView,
    hideRetryOption = false
  } = props
  const {
    orgIdentifier,
    executionIdentifier,
    accountId,
    projectIdentifier,
    pipelineIdentifier,
    module,
    branch,
    repoIdentifier,
    connectorRef,
    repoName,
    storeType,
    stagesExecuted
  } = params
  const { mutate: interrupt } = useHandleInterrupt({
    planExecutionId: executionIdentifier
  })
  const { mutate: stageInterrupt } = useHandleStageInterrupt({
    planExecutionId: executionIdentifier,
    nodeExecutionId: defaultTo(stageId, '')
  })

  const { showSuccess, showError, clear } = useToaster()
  const { getString } = useStrings()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { isCompareMode } = useExecutionCompareContext()
  const { trackEvent } = useTelemetry()
  const { getRBACErrorMessage } = useRBACError()
  const { openDialog: openAbortDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('pipeline.execution.dialogMessages.abortExecution'),
    titleText: getString('pipeline.execution.dialogMessages.abortTitle'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    onCloseDialog: async isConfirmed => {
      // istanbul ignore else
      if (isConfirmed) {
        abortPipeline()
      }
    }
  })

  const { openDialog: openMarkAsFailedDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('pipeline.execution.dialogMessages.markAsFailedConfirmation'),
    titleText: getString('pipeline.execution.dialogMessages.markAsFailedTitle'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    onCloseDialog: async isConfirmed => {
      /* istanbul ignore else */
      if (isConfirmed) {
        markStageAsFailed()
      }
    }
  })

  const { CI_YAML_VERSIONING, PIE_DEPRECATE_PAUSE_INTERRUPT_NG } = useFeatureFlags()

  const { canAbort, canPause, canRerun, canResume, canRollback } = getValidExecutionActions(canExecute, executionStatus)
  const { abortText, pauseText, rerunText, resumeText, UserMarkedFailure } = getActionTexts(stageId)

  const interruptMethod = stageId ? stageInterrupt : interrupt

  const commonRouteProps = {
    orgIdentifier,
    pipelineIdentifier,
    projectIdentifier,
    accountId,
    module,
    connectorRef,
    repoName,
    repoIdentifier,
    branch,
    storeType
  }

  const executionDetailsView = routes.toExecutionPipelineView({ ...commonRouteProps, source, executionIdentifier })
  const pipelineDetailsView = isSimplifiedYAMLEnabled(module, CI_YAML_VERSIONING)
    ? routes.toPipelineStudioV1(commonRouteProps)
    : routes.toPipelineStudio(commonRouteProps)

  async function executeAction(interruptType: HandleInterruptQueryParams['interruptType']): Promise<void> {
    clear()
    try {
      const successMessage = getSuccessMessage(getString, interruptType, stageId, stageName)
      await interruptMethod({} as never, {
        queryParams: {
          orgIdentifier,
          accountIdentifier: accountId,
          projectIdentifier,
          interruptType
        }
      })
      showSuccess(successMessage)
    } catch (e) {
      const errorMessage = getRBACErrorMessage(e)
      showError(errorMessage)
    }
  }

  async function abortPipeline(): Promise<void> {
    await executeAction('AbortAll')
  }

  async function pausePipeline(): Promise<void> {
    await executeAction('Pause')
  }

  async function resumePipeline(): Promise<void> {
    await executeAction('Resume')
  }

  async function markStageAsFailed(): Promise<void> {
    await executeAction('UserMarkedFailure')
  }

  /*--------------------------------------Retry Pipeline---------------------------------------------*/
  const { openRetryPipelineModal } = useOpenRetryPipelineModal({ modules, params })
  const retryPipeline = (): void => {
    trackEvent(PipelineExecutionActions.RetryPipeline, { triggered_from: 'kebab-menu' })
    openRetryPipelineModal()
  }
  const showRetryPipelineOption = isRetryPipelineAllowed(executionStatus) && canRetry && !hideRetryOption

  /*--------------------------------------Retry Pipeline---------------------------------------------*/

  /*--------------------------------------Run Pipeline---------------------------------------------*/
  const reRunPipeline = (): void => {
    trackEvent(PipelineExecutionActions.ReRunPipeline, { triggered_from: 'kebab-menu' })
    isSimplifiedYAMLEnabled(module, CI_YAML_VERSIONING) ? openRunPipelineModalV1() : openRunPipelineModal()
  }

  const { openRunPipelineModal } = useRunPipelineModal({
    pipelineIdentifier,
    executionId: executionIdentifier,
    repoIdentifier: isGitSyncEnabled ? repoIdentifier : repoName,
    branch,
    connectorRef,
    storeType,
    stagesExecuted
  })
  const { openRunPipelineModalV1 } = useRunPipelineModalV1({
    pipelineIdentifier,
    executionId: executionIdentifier,
    repoIdentifier: isGitSyncEnabled ? repoIdentifier : repoName,
    branch,
    connectorRef,
    storeType
  })

  /*--------------------------------------Run Pipeline---------------------------------------------*/

  return (
    <Layout.Horizontal onClick={killEvent}>
      {!menuOnlyActions && (
        <>
          {!PIE_DEPRECATE_PAUSE_INTERRUPT_NG && canResume && (
            <Button
              size={ButtonSize.SMALL}
              icon="play"
              tooltip={getString(resumeText)}
              onClick={resumePipeline}
              {...commonButtonProps}
              disabled={!canExecute}
            />
          )}

          {!PIE_DEPRECATE_PAUSE_INTERRUPT_NG && canPause && (
            <Button
              size={ButtonSize.SMALL}
              icon="pause"
              tooltip={getString(pauseText)}
              onClick={pausePipeline}
              {...commonButtonProps}
              disabled={!canExecute}
            />
          )}

          {canAbort && (
            <Button
              size={ButtonSize.SMALL}
              icon="stop"
              tooltip={getString(abortText)}
              onClick={openAbortDialog}
              {...commonButtonProps}
              disabled={!canExecute}
            />
          )}

          {stageId && canRollback && (
            <Button
              size={ButtonSize.SMALL}
              icon="main-rollback"
              tooltip={getString(UserMarkedFailure)}
              onClick={openMarkAsFailedDialog}
              {...commonButtonProps}
              disabled={!canExecute}
            />
          )}
        </>
      )}

      {!noMenu && (
        <Popover className={Classes.DARK} position={Position.LEFT}>
          <Button icon="Options" {...commonButtonProps} aria-label="execution menu actions" />
          <Menu style={{ backgroundColor: 'unset' }}>
            {showRetryPipelineOption && (
              <RbacMenuItem
                data-test-id="retry-failed-pipeline"
                featuresProps={getFeaturePropsForRunPipelineButton({ modules, getString })}
                text={getString('pipeline.execution.actions.reRunFromStage')}
                onClick={retryPipeline}
                disabled={!canRerun || isPipelineInvalid}
              />
            )}
            {isExecutionListView && (
              <Link to={executionDetailsView} className={css.link}>
                <Menu.Item tagName="div" text={getString('pipeline.viewExecution')} />
              </Link>
            )}
            {showEditButton && (
              <Link to={pipelineDetailsView} className={css.link}>
                <Menu.Item
                  tagName="div"
                  text={canEdit ? getString('editPipeline') : getString('pipeline.viewPipeline')}
                />
              </Link>
            )}
            {!stageId && (
              <RbacMenuItem
                featuresProps={getFeaturePropsForRunPipelineButton({ modules, getString })}
                text={getString(rerunText)}
                disabled={!canRerun || isPipelineInvalid}
                onClick={reRunPipeline}
              />
            )}
            {onReRunInDebugMode && (
              <MenuItem
                text={getString('pipeline.execution.actions.reRunInDebugMode')}
                onClick={onReRunInDebugMode}
                disabled={!canRerun || isPipelineInvalid}
              />
            )}
            <MenuItem text={getString(abortText)} onClick={openAbortDialog} disabled={!canAbort} />
            {PIE_DEPRECATE_PAUSE_INTERRUPT_NG ? null : (
              <MenuItem text={getString(pauseText)} onClick={pausePipeline} disabled={!canPause} />
            )}
            {PIE_DEPRECATE_PAUSE_INTERRUPT_NG ? null : (
              <MenuItem text={getString(resumeText)} onClick={resumePipeline} disabled={!canResume} />
            )}

            {onViewCompiledYaml ? (
              <MenuItem text={getString('pipeline.execution.actions.viewCompiledYaml')} onClick={onViewCompiledYaml} />
            ) : null}
            {isExecutionListView && (
              <>
                <MenuItem
                  text={getString('pipeline.execution.actions.compareExecutions')}
                  onClick={onCompareExecutions}
                  disabled={isCompareMode}
                  hidden={!!onCompareExecutions}
                />
              </>
            )}
          </Menu>
        </Popover>
      )}
    </Layout.Horizontal>
  )
}

export default ExecutionActions
