import React from 'react'
import { IMenuItemProps, MenuItem } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '../PipelineStudio/PipelineContext/PipelineContext'

export interface DeleteStageMenuItemProps extends Omit<IMenuItemProps, 'text'> {
  stageId: string
}

export default function DeleteStageMenuItem({ stageId, ...rest }: DeleteStageMenuItemProps): React.ReactElement {
  const { getString } = useStrings()
  const { deleteStage } = usePipelineContext()

  return (
    <MenuItem
      icon={'trash'}
      onClick={() => {
        deleteStage(stageId)
      }}
      text={getString('delete')}
      {...rest}
    />
  )
}
