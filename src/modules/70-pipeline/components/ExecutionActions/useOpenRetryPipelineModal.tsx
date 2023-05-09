/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button } from '@harness/uicore'
import { Dialog } from '@blueprintjs/core'
import { HideModal, useModalHook } from '@harness/use-modal'
import type { IDialogProps } from '@blueprintjs/core'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import RetryPipeline from '../RetryPipeline/RetryPipeline'
import css from './ExecutionActions.module.scss'

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

export interface RetryPipelineModalProps {
  modules?: string[]
  params: PipelineType<{
    orgIdentifier: string
    projectIdentifier: string
    pipelineIdentifier: string
    executionIdentifier: string
    accountId: string
    stagesExecuted?: string[]
  }> &
    GitQueryParams
}
export interface RetryPipelineModalReturnProps {
  openRetryPipelineModal: (fromLastStage?: boolean) => void
  hideRetryPipelineModal: HideModal
}

export function useOpenRetryPipelineModal({ modules, params }: RetryPipelineModalProps): RetryPipelineModalReturnProps {
  const { executionIdentifier, pipelineIdentifier } = params
  const [preSelectLastStage, setPreSelectLastStage] = React.useState(false)
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
            params={params}
            preSelectLastStage={preSelectLastStage}
          />
          <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
        </div>
      </Dialog>
    )
  }, [pipelineIdentifier, executionIdentifier, params])

  return {
    openRetryPipelineModal: (fromLastStage?: boolean) => {
      setPreSelectLastStage(!!fromLastStage)
      showRetryPipelineModal()
    },
    hideRetryPipelineModal
  }
}
