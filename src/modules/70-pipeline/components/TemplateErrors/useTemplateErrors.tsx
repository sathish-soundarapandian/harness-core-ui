/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@wings-software/uicore'
import type { ErrorNodeSummary } from 'services/pipeline-ng'
import {
  ReconcileDialog,
  TemplateErrorEntity
} from '@pipeline/components/TemplateLibraryErrorHandling/ReconcileDialog/ReconcileDialog'
import css from '@pipeline/components/TemplateLibraryErrorHandling/OutOfSyncErrorStrip/OutOfSyncErrorStrip.module.scss'

interface OpenTemplateErrorsModalProps {
  error: ErrorNodeSummary
  originalYaml: string
  onSave: (refreshedYaml: string) => Promise<void>
}

interface UseTemplateErrorsReturnType {
  openTemplateErrorsModal: (props: OpenTemplateErrorsModalProps) => void
}

interface TemplateErrors {
  entity: TemplateErrorEntity
}

export default function useTemplateErrors({ entity }: TemplateErrors): UseTemplateErrorsReturnType {
  const [modalProps, setModalPros] = React.useState<OpenTemplateErrorsModalProps>()

  const [showReconcileDialog, hideReconcileDialog] = useModalHook(() => {
    return (
      <Dialog enforceFocus={false} isOpen={true} onClose={hideReconcileDialog} className={css.reconcileDialog}>
        {modalProps && (
          <ReconcileDialog
            errorNodeSummary={modalProps.error}
            entity={entity}
            originalEntityYaml={modalProps.originalYaml}
            updateRootEntity={async (refreshedYaml: string) => {
              hideReconcileDialog()
              await modalProps?.onSave(refreshedYaml)
            }}
          />
        )}
      </Dialog>
    )
  }, [entity, modalProps])

  const openTemplateErrorsModal = React.useCallback(
    ({ error, originalYaml, onSave }) => {
      setModalPros({
        error,
        originalYaml,
        onSave
      })
      showReconcileDialog()
    },
    [setModalPros, showReconcileDialog]
  )

  return { openTemplateErrorsModal }
}
