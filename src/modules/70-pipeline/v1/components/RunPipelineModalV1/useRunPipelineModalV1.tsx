/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import type { InputSetSelectorProps } from '@pipeline/components/InputSetSelector/InputSetSelector'
import type { ExecutionPathProps, GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { RunPipelineFormV1 } from './RunPipelineFormV1'
import css from '../../../components/RunPipelineModal/RunPipelineForm.module.scss'

export interface RunPipelineModalV1Params {
  pipelineIdentifier: string
  executionId?: string
  inputSetSelected?: InputSetSelectorProps['value']
}

export interface useRunPipelineModalReturn {
  openRunPipelineModalV1: (debugMode?: boolean) => void
  closeRunPipelineModalV1: () => void
}

export const useRunPipelineModalV1 = (
  runPipelineModalParams: RunPipelineModalV1Params & Omit<GitQueryParams, 'repoName'>
): useRunPipelineModalReturn => {
  const { inputSetSelected, pipelineIdentifier, branch, repoIdentifier, connectorRef, storeType, executionId } =
    runPipelineModalParams
  const {
    projectIdentifier,
    orgIdentifier,
    accountId,
    module,
    executionIdentifier,
    source = 'executions'
  } = useParams<PipelineType<ExecutionPathProps>>()

  const storeMetadata = {
    connectorRef,
    repoName: repoIdentifier,
    branch
  }

  const planExecutionId: string | undefined = executionIdentifier ?? executionId

  const runModalProps: IDialogProps = {
    isOpen: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: false,
    enforceFocus: false,
    className: css.runPipelineDialog,
    style: { width: 872, height: 'fit-content', overflow: 'auto' },
    isCloseButtonShown: false
  }
  const [isDebugMode, setIsDebugMode] = useState(false)

  const [showRunPipelineModal, hideRunPipelineModal] = useModalHook(
    () => (
      <Dialog {...runModalProps}>
        <Layout.Vertical className={css.modalContent}>
          <RunPipelineFormV1
            pipelineIdentifier={pipelineIdentifier}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
            accountId={accountId}
            module={module}
            repoIdentifier={repoIdentifier}
            source={source}
            branch={branch}
            connectorRef={connectorRef}
            storeType={storeType}
            onClose={() => {
              hideRunPipelineModal()
            }}
            executionIdentifier={planExecutionId}
            storeMetadata={storeMetadata}
            isDebugMode={isDebugMode}
          />
          <Button
            aria-label="close modal"
            icon="cross"
            variation={ButtonVariation.ICON}
            onClick={() => hideRunPipelineModal()}
            className={css.crossIcon}
          />
        </Layout.Vertical>
      </Dialog>
    ),
    [branch, repoIdentifier, pipelineIdentifier, inputSetSelected, planExecutionId]
  )

  const open = useCallback(
    (debugMode?: boolean) => {
      setIsDebugMode(!!debugMode)
      showRunPipelineModal()
    },
    [showRunPipelineModal]
  )

  return {
    openRunPipelineModalV1: (debugMode?: boolean) => open(debugMode),
    closeRunPipelineModalV1: hideRunPipelineModal
  }
}
