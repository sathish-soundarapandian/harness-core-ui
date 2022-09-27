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
  getErrorInfoFromErrorObject,
  Layout,
  ButtonSize,
  ButtonVariation
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Classes, Dialog, IDialogProps, Intent, Menu, MenuItem, Position } from '@blueprintjs/core'
import { Link, useLocation, matchPath } from 'react-router-dom'
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
import type { StringKeys } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ExecutionPathProps, GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { killEvent } from '@common/utils/eventUtils'
import RetryPipeline from '../RetryPipeline/RetryPipeline'
import { useRunPipelineModal } from '../RunPipelineModal/useRunPipelineModal'
import { useExecutionCompareContext } from '../ExecutionCompareYaml/ExecutionCompareContext'
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
  menuOnlyActions?: boolean
}

function getValidExecutionActions(canExecute: boolean, executionStatus?: ExecutionStatus) {
  return {
    canAbort: isExecutionActive(executionStatus) && canExecute,
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
} {
  return {
    abortText: stageId ? 'pipeline.execution.actions.abortStage' : 'pipeline.execution.actions.abortPipeline',
    pauseText: stageId ? 'pipeline.execution.actions.pauseStage' : 'pipeline.execution.actions.pausePipeline',
    rerunText: stageId ? 'pipeline.execution.actions.rerunStage' : 'pipeline.execution.actions.rerunPipeline',
    resumeText: stageId ? 'pipeline.execution.actions.resumeStage' : 'pipeline.execution.actions.resumePipeline'
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
    menuOnlyActions
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
  const location = useLocation()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { isCompareMode } = useExecutionCompareContext()

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

  const { canAbort, canPause, canRerun, canResume } = getValidExecutionActions(canExecute, executionStatus)
  const { abortText, pauseText, rerunText, resumeText } = getActionTexts(stageId)

  const interruptMethod = stageId ? stageInterrupt : interrupt

  const executionDetailsView = routes.toExecutionPipelineView({
    source,
    orgIdentifier,
    pipelineIdentifier,
    executionIdentifier,
    projectIdentifier,
    accountId,
    module
  })
  const pipelineDetailsView = routes.toPipelineStudio({
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier,
    accountId,
    module,
    branch,
    repoIdentifier,
    connectorRef,
    repoName,
    storeType
  })

  const isExecutionDetailsView = !!matchPath(location.pathname, {
    path: executionDetailsView
  })

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
      const errorMessage = getErrorInfoFromErrorObject(e)
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

  /*--------------------------------------Retry Pipeline---------------------------------------------*/
  const retryPipeline = (): void => {
    showRetryPipelineModal()
  }
  const showRetryPipelineOption = isRetryPipelineAllowed(executionStatus) && canRetry

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false,
    enforceFocus: false,
    className: css.runPipelineDialog,
    style: { width: 872, height: 'fit-content', overflow: 'auto' }
  }

  const [showRetryPipelineModal, hideRetryPipelineModal] = useModalHook(() => {
    const onClose = (): void => {
      hideRetryPipelineModal()
    }

    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS}>
        <div className={css.modalContent}>
          <RetryPipeline
            onClose={onClose}
            executionIdentifier={executionIdentifier}
            pipelineIdentifier={pipelineIdentifier}
            modules={modules}
          />
          <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
        </div>
      </Dialog>
    )
  }, [pipelineIdentifier, executionIdentifier])

  /*--------------------------------------Retry Pipeline---------------------------------------------*/

  /*--------------------------------------Run Pipeline---------------------------------------------*/

  const reRunPipeline = (): void => {
    openRunPipelineModal()
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

  /*--------------------------------------Run Pipeline---------------------------------------------*/

  return (
    <Layout.Horizontal onClick={killEvent}>
      {!menuOnlyActions && (
        <>
          {canResume && (
            <Button
              size={ButtonSize.SMALL}
              icon="play"
              tooltip={getString(resumeText)}
              onClick={resumePipeline}
              {...commonButtonProps}
              disabled={!canExecute}
            />
          )}

          {!stageId && canRerun && (
            <RbacButton
              icon="repeat"
              tooltip={isPipelineInvalid ? getString('pipeline.cannotRunInvalidPipeline') : getString(rerunText)}
              onClick={reRunPipeline}
              {...commonButtonProps}
              disabled={!canExecute || isPipelineInvalid}
              featuresProps={getFeaturePropsForRunPipelineButton({ modules, getString })}
            />
          )}

          {canPause && (
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
                text={getString('pipeline.retryPipeline')}
                onClick={retryPipeline}
                disabled={isPipelineInvalid}
              />
            )}
            {!isExecutionDetailsView && (
              <Menu.Item
                className={css.link}
                text={<Link to={executionDetailsView}>{getString('pipeline.viewExecution')}</Link>}
              />
            )}
            <Menu.Item
              hidden={!showEditButton}
              disabled={!canEdit}
              className={css.link}
              text={
                <Link to={pipelineDetailsView}>
                  {canEdit ? getString('editPipeline') : getString('pipeline.viewPipeline')}
                </Link>
              }
            />
            {!stageId && (
              <RbacMenuItem
                featuresProps={getFeaturePropsForRunPipelineButton({ modules, getString })}
                text={getString(rerunText)}
                disabled={!canRerun || isPipelineInvalid}
                onClick={reRunPipeline}
              />
            )}
            <MenuItem text={getString(abortText)} onClick={openAbortDialog} disabled={!canAbort} />
            <MenuItem text={getString(pauseText)} onClick={pausePipeline} disabled={!canPause} />
            <MenuItem text={getString(resumeText)} onClick={resumePipeline} disabled={!canResume} />
            {!isExecutionDetailsView && (
              <>
                <MenuItem
                  text={getString('pipeline.execution.actions.viewCompiledYaml')}
                  onClick={onViewCompiledYaml}
                  hidden={!!onViewCompiledYaml}
                />
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
