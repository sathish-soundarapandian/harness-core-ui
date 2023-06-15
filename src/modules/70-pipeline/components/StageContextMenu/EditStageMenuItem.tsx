import React from 'react'
import { IMenuItemProps, MenuItem } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '../PipelineStudio/PipelineContext/PipelineContext'

export interface EditStageMenuItemProps extends Omit<IMenuItemProps, 'text'> {
  stageId: string
}

export default function EditStageMenuItem({ stageId, ...rest }: EditStageMenuItemProps): React.ReactElement {
  const { getString } = useStrings()
  const { setSelection } = usePipelineContext()

  return (
    <MenuItem
      icon={'edit'}
      onClick={() => {
        setSelection({ stageId, sectionId: 'OVERVIEW' })
      }}
      text={getString('edit')}
      {...rest}
    />
  )
}
