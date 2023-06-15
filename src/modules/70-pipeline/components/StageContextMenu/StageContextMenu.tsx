import React, { useState } from 'react'
import { IMenuProps, Menu, Position } from '@blueprintjs/core'
import { Button, Popover, PopoverProps } from '@harness/uicore'
import css from './StageContextMenu.module.scss'

export interface StageContextMenuProps extends IMenuProps {
  popoverProps?: PopoverProps
}

export default function StageContextMenu({ popoverProps = {}, ...rest }: StageContextMenuProps): React.ReactElement {
  const [contextOpen, setContexOpen] = useState(false)

  return (
    <Popover
      isOpen={contextOpen}
      onInteraction={nextOpenState => {
        setContexOpen(nextOpenState)
      }}
      position={Position.RIGHT_TOP}
      isDark={true}
      {...popoverProps}
    >
      <Button
        icon="Options"
        className={css.moreOptions}
        onClick={e => {
          e.stopPropagation()
          setContexOpen(true)
        }}
      />
      <Menu {...rest} />
    </Popover>
  )
}
