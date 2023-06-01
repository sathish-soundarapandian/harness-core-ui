/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { HideModal, ShowModal, useModalHook } from '@harness/use-modal'
import { ModalDialog } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ResourceType } from '@common/interfaces/GitSyncInterface'
import type { GitSyncFormFields } from '@gitsync/components/GitSyncForm/GitSyncForm'
import EditGitMetadata from './EditGitMetadata'
import type { ExtraQueryParams } from './MigrateUtils'

interface UseEditGitMetadataReturnType {
  showEditGitMetadataModal: ShowModal
  hideEditGitMetadataeModal: HideModal
}

export interface UseEditGitMetadataProps {
  resourceType: ResourceType
  identifier: string
  metadata: GitSyncFormFields
  extraQueryParams?: ExtraQueryParams
  modalTitle?: string
  onSuccess?: () => void
  onFailure?: () => void
}

export default function useEditGitMetadata(props: UseEditGitMetadataProps): UseEditGitMetadataReturnType {
  const { resourceType, modalTitle, identifier, extraQueryParams, metadata, onSuccess, onFailure } = props
  const { connectorRef, repo, filePath } = metadata

  const { getString } = useStrings()

  const onMigrateSuccess = (): void => {
    hideEditGitMetadataeModal()
    onSuccess?.()
  }

  const onMigrateFailure = (): void => {
    onFailure?.()
  }

  const getModalTitle = (): string => {
    return modalTitle ?? getString('pipeline.editingGitMetadata')
  }

  const [showEditGitMetadataModal, hideEditGitMetadataeModal] = useModalHook(() => {
    return (
      <ModalDialog
        enforceFocus={false}
        isOpen={true}
        onClose={hideEditGitMetadataeModal}
        title={getModalTitle()}
        width={800}
      >
        <EditGitMetadata
          initialValues={{
            connectorRef: connectorRef as string,
            repo: repo as string,
            filePath: filePath as string
          }}
          resourceType={resourceType}
          identifier={identifier}
          extraQueryParams={extraQueryParams}
          onCancelClick={hideEditGitMetadataeModal}
          onSuccess={onMigrateSuccess}
          onFailure={onMigrateFailure}
        />
      </ModalDialog>
    )
  }, [resourceType, modalTitle, connectorRef, repo, onMigrateSuccess, onMigrateFailure])

  return {
    showEditGitMetadataModal: showEditGitMetadataModal,
    hideEditGitMetadataeModal: hideEditGitMetadataeModal
  }
}
