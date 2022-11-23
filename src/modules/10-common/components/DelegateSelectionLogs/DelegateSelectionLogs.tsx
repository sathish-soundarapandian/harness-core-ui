/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Layout } from '@harness/uicore'
import { upperFirst } from 'lodash-es'
import React from 'react'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import { DelegateSelectionLogsTask } from './DelegateSelectionLogsTask'
import css from './DelegateSelectionLogs.module.scss'

export interface DelegateTaskData {
  taskId: string
  taskName: string
  delegateName?: string
}

export interface UseDelegateSelectionLogsModalReturn {
  openDelegateSelectionLogsModal: (task: DelegateTaskData, modalProps?: IDialogProps) => void
  hideModal: () => void
}

export function useDelegateSelectionLogsModal(): UseDelegateSelectionLogsModalReturn {
  const [delegateTask, setDelegateTask] = React.useState<DelegateTaskData | null>(null)
  const { getString } = useStrings()
  const [modalProps, setModalProps] = React.useState<IDialogProps>({
    isOpen: true,
    enforceFocus: false,
    title: upperFirst(getString('common.logs.delegateSelectionLogs')),
    isCloseButtonShown: true,
    onClose: () => {
      hideModal()
    },
    style: {
      width: 900,
      minHeight: 240,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  })

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        {!!delegateTask && (
          <Layout.Vertical spacing="xxlarge" padding="large" className={css.main}>
            <DelegateSelectionLogsTask task={delegateTask} />
          </Layout.Vertical>
        )}
      </Dialog>
    ),
    [delegateTask, modalProps]
  )
  return {
    openDelegateSelectionLogsModal: (task, _modalProps?: IDialogProps | undefined) => {
      setDelegateTask(task)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    hideModal
  }
}
