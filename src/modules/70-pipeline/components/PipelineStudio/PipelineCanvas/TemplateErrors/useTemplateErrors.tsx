/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import type { ErrorNodeSummary } from 'services/pipeline-ng'
import { ReconcileDialog } from '@pipeline/components/TemplateLibraryErrorHandling/ReconcileDialog/ReconcileDialog'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import type { UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import css from '@pipeline/components/TemplateLibraryErrorHandling/OutOfSyncErrorStrip/OutOfSyncErrorStrip.module.scss'

interface UseTemplateErrorsReturnType {
  openTemplateErrorsModal: (response: any) => void
  hideTemplateErrorsDialog: () => void
}

interface TemplateErrors {
  entity: 'Pipeline' | 'Template'
  originalEntityYaml: string
  storeMetadata?: StoreMetadata
  onSave: (latestEntityYaml: string, currStoreMetadata: StoreMetadata) => Promise<UseSaveSuccessResponse>
}

export default function useTemplateErrors(props: TemplateErrors): UseTemplateErrorsReturnType {
  const { entity, originalEntityYaml, storeMetadata, onSave } = props
  const [errorNodeSummary, setErrorNodeSummary] = React.useState<ErrorNodeSummary>()

  const onSaveEntity = async (latestEntityYaml: string, currStoreMetadata: StoreMetadata) => {
    hideReconcileDialog()
    return onSave(latestEntityYaml, currStoreMetadata)
  }

  const [showReconcileDialog, hideReconcileDialog] = useModalHook(() => {
    return (
      <Dialog enforceFocus={false} isOpen={true} onClose={hideReconcileDialog} className={css.reconcileDialog}>
        {errorNodeSummary && (
          <ReconcileDialog
            templateInputsErrorNodeSummary={errorNodeSummary}
            entity={entity}
            reload={noop}
            originalEntityYaml={originalEntityYaml}
            storeMetadata={storeMetadata}
            onSaveEntity={onSaveEntity}
          />
        )}
      </Dialog>
    )
  }, [errorNodeSummary, originalEntityYaml, storeMetadata])

  const openTemplateErrorsModal = (errors: ErrorNodeSummary) => {
    setErrorNodeSummary(errors)
    showReconcileDialog()
  }

  const hideTemplateErrorsDialog = () => {
    hideReconcileDialog()
  }

  return {
    openTemplateErrorsModal,
    hideTemplateErrorsDialog
  }
}
