import { useRef, useState } from 'react'
import { cloneDeep } from 'lodash-es'
import { useConfirmationDialog, useToaster } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { StageActions } from '@common/constants/TrackingConstants'
import { useStrings } from 'framework/strings'
import type { PipelineContextInterface } from '../PipelineStudio/PipelineContext/PipelineContext'
import { getPropagatingStagesFromStage, removeNodeFromPipeline } from '../PipelineStudio/StageBuilder/StageBuilderUtil'

interface deleteStageOptionsArg {
  before?: (stageId: string) => void
  after?: (stageId: string) => void
}

export interface useDeleteStageReturnType {
  deleteStage: (stageId: string, options?: deleteStageOptionsArg) => void
}

export function useDeleteStage(
  pipeline: PipelineContextInterface['state']['pipeline'],
  getStageFromPipeline: PipelineContextInterface['getStageFromPipeline'],
  updatePipeline: PipelineContextInterface['updatePipeline']
): useDeleteStageReturnType {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { showSuccess, showError } = useToaster()
  const optionsRef = useRef<deleteStageOptionsArg>()
  const [stageIdInternal, setStageIdInternal] = useState('')
  const [confirmationMessage, setConfirmationMessage] = useState('')

  const { openDialog } = useConfirmationDialog({
    contentText: confirmationMessage,
    titleText: getString('deletePipelineStage'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (stageIdInternal && isConfirmed) {
        deleteStageInternal(stageIdInternal)
      }
    }
  })

  const deleteStageInternal = (stageId: string): void => {
    optionsRef.current?.before?.(stageId)
    const cloned = cloneDeep(pipeline)
    const stageToDelete = getStageFromPipeline(stageId, cloned)
    const isRemove = removeNodeFromPipeline(stageToDelete, cloned)
    optionsRef.current?.after?.(stageId)
    if (isRemove) {
      updatePipeline(cloned)
      showSuccess(getString('deleteStageSuccess'))
      // call telemetry
      trackEvent(StageActions.DeleteStage, { stageType: stageToDelete?.stage?.stage?.type || '' })
    } else {
      showError(getString('deleteStageFailure'), undefined, 'pipeline.delete.stage.error')
    }
  }

  const getConfirmationMessage = (stageId: string): string => {
    const propagatingStages = getPropagatingStagesFromStage(stageId, pipeline)
      ?.map(stage => stage?.stage?.name)
      .join(', ')

    return propagatingStages
      ? getString('pipeline.parentStageDeleteWarning', {
          propagatingStages
        })
      : getString('stageConfirmationText', {
          name: getStageFromPipeline(stageId || '').stage?.stage?.name || stageId,
          id: stageId
        })
  }

  const deleteStage = (stageId: string, options?: deleteStageOptionsArg): void => {
    optionsRef.current = options
    setConfirmationMessage(getConfirmationMessage(stageId))
    setStageIdInternal(stageId)
    openDialog()
  }

  return { deleteStage }
}
