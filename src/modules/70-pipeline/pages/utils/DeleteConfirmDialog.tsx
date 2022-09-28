/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Intent, TextArea } from '@blueprintjs/core'
import { Text, useConfirmationDialog } from '@wings-software/uicore'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import type { PipelineDTO } from '@pipeline/components/PipelineModalListView/RunPipelineListView'
import type { InputSetLocal } from '../inputSet-list/InputSetListView'

const useGetEntityText = (entityType: string): string => {
  const { getString } = useStrings()

  switch (entityType) {
    case 'pipeline':
      return getString('common.pipeline')
    case 'inputSet':
      return getString('inputSets.inputSetLabel')
    case 'overlayInputSet':
      return getString('inputSets.overlayInputSet')
    case 'template':
      return getString('common.template.label')
    default:
      return ''
  }
}
interface DeleteConfirmDialogContentProps {
  gitDetails?: EntityGitDetails
  entityName: string
  commitMsg: string
  onCommitMsgChange: (commitMsg: string) => void
  entityType: string
  forceComments?: boolean
}

export function DeleteConfirmDialogContent({
  gitDetails = {},
  entityName = '',
  commitMsg,
  onCommitMsgChange,
  entityType = '',
  forceComments = false
}: DeleteConfirmDialogContentProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <div className={'pipelineDeleteDialog'}>
      <Text margin={{ bottom: 'medium' }} title={entityName}>{`${getString(
        'common.git.confirmDelete'
      )} ${useGetEntityText(entityType)} ${entityName}?`}</Text>
      {(gitDetails?.objectId || forceComments) && (
        <>
          <Text>{forceComments ? getString('common.comments') : getString('common.git.commitMessage')}</Text>
          <TextArea
            value={commitMsg}
            onInput={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
              onCommitMsgChange(event.target.value)
            }}
          />
        </>
      )}
    </div>
  )
}

interface DeleteMetaData {
  versions?: string[]
}

export default function useDeleteConfirmationDialog(
  entityData: PipelineDTO | InputSetLocal,
  entityType: string,
  onDelete?: (commitMsg: string, versions?: string[]) => Promise<void>,
  forceComments = false
): { confirmDelete: (deleteMetaData?: DeleteMetaData) => void } {
  const { getString } = useStrings()
  const [deleteCallMetaData, setDeleteCallMetaData] = useState<DeleteMetaData>()
  const [commitMsg, setCommitMsg] = React.useState<string>(`${getString('delete')} ${entityData.name}`)

  React.useEffect(() => {
    setCommitMsg(`${getString('delete')} ${entityData.name}`)
  }, [entityData])

  const { openDialog: openConfirmDeleteDialog } = useConfirmationDialog({
    contentText: (
      <DeleteConfirmDialogContent
        entityName={entityData?.name || ''}
        entityType={entityType}
        gitDetails={entityData.gitDetails}
        commitMsg={commitMsg}
        onCommitMsgChange={setCommitMsg}
        forceComments={forceComments}
      />
    ),
    titleText: `${getString('delete')} ${useGetEntityText(entityType)}`,
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */
      if (isConfirmed) {
        await onDelete?.(commitMsg, deleteCallMetaData?.versions)
      }
    }
  })

  const confirmDelete = (deleteMetaData?: DeleteMetaData): void => {
    setDeleteCallMetaData(deleteMetaData)
    openConfirmDeleteDialog()
  }
  return { confirmDelete }
}
