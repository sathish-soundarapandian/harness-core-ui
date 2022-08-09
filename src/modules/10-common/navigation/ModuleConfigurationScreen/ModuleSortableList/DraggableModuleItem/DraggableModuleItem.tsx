/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Container, Checkbox, Text } from '@harness/uicore'
import { Icon } from '@harness/icons'
import { Color } from '@harness/design-system'
import { Draggable } from 'react-beautiful-dnd'
import cx from 'classnames'
import type { ModuleName } from 'framework/types/ModuleName'
import { getModuleInfo } from '../../util'
import css from './DraggableModuleItem.module.scss'

interface DraggableModuleItemProps {
  index: number
  module: ModuleName
  isActive?: boolean
  onClick?: (module: ModuleName) => void
  onCheckboxChange?: (checked: boolean) => void
  checked?: boolean
}

const DraggableModuleItem: React.FC<DraggableModuleItemProps> = ({
  onClick,
  module,
  isActive,
  index,
  onCheckboxChange,
  checked = false
}) => {
  const moduleInfo = getModuleInfo(module)

  if (!moduleInfo) {
    // This condition is not required.
    return null
  }

  const { label, icon: moduleIcon } = moduleInfo

  const background = isActive ? '#1b2e49' : Color.PRIMARY_9
  const containerClass = cx(css.moduleCard, isActive ? css.borderLight : undefined)

  return (
    <Container className={css.container}>
      <Draggable key={module} draggableId={module} index={index}>
        {providedDrag => (
          <div {...providedDrag.draggableProps} {...providedDrag.dragHandleProps} ref={providedDrag.innerRef}>
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Icon
                name="drag-handle-vertical"
                className={css.dragIcon}
                size={20}
                color={Color.WHITE}
                margin={{ right: 'xsmall' }}
              />
              <Container
                className={containerClass}
                flex={{ justifyContent: 'space-between' }}
                padding={{ top: 'small', bottom: 'small', left: 'large', right: 'large' }}
                background={background}
                border={{ color: isActive ? Color.PRIMARY_5 : Color.PRIMARY_9 }}
                onClick={() => {
                  if (!isActive) {
                    onClick?.(module)
                  }
                }}
              >
                <Layout.Horizontal flex={{ alignItems: 'center' }}>
                  <Icon name={moduleIcon} size={24} margin={{ right: 'xsmall' }} />
                  <Text color={Color.WHITE}>{label}</Text>
                </Layout.Horizontal>

                <Checkbox onChange={e => onCheckboxChange?.((e.target as any).checked)} checked={checked} />
              </Container>
            </Layout.Horizontal>
          </div>
        )}
      </Draggable>
    </Container>
  )
}

export default DraggableModuleItem
