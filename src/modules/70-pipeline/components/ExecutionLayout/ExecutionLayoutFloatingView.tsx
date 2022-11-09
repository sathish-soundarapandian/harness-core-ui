/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import Draggable, { DraggableData } from 'react-draggable'
import { usePopper } from 'react-popper'
import { Button, ButtonVariation } from '@wings-software/uicore'

import { String } from 'framework/strings'
import { useLocalStorage } from '@common/hooks'

import { ExecutionLayoutState, useExecutionLayoutContext } from './ExecutionLayoutContext'
import css from './ExecutionLayoutFloatingView.module.scss'

/**
 * This component will only be rendered when layout === 'FLOATING'
 */
export default function ExecutionLayoutFloatingView(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { layout, restoreDialog } = useExecutionLayoutContext()
  const [position, setPosition] = useLocalStorage('execution_layout_float_position', { x: -40, y: -30 })
  const [isOpen, setIsOpen] = React.useState(true)
  const [referenceElement, setReferenceElement] = React.useState<HTMLElement | null>(null)
  const [popperElement, setPopperElement] = React.useState<HTMLElement | null>(null)
  const { styles, attributes, forceUpdate } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-end',
    modifiers: [
      {
        name: 'offset',
        options: { offset: [0, 12] }
      }
    ]
  })

  function toggleDialog(): void {
    if (layout === ExecutionLayoutState.FLOATING) {
      setIsOpen(status => !status)
    }

    if (layout === ExecutionLayoutState.MINIMIZE) {
      restoreDialog()
    }
  }

  function handlePosition(data: DraggableData): void {
    setPosition({ x: data.x, y: data.y })
    forceUpdate?.()
  }

  React.useEffect(() => {
    setIsOpen(layout !== ExecutionLayoutState.MINIMIZE)
  }, [layout])

  return (
    <div className={css.floatingView} data-state={layout.toLowerCase()}>
      {
        <Draggable
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          offsetParent={document.getElementById('pipeline-execution-container')!}
          position={position}
          onStop={(_e, data) => handlePosition(data)}
          handle="#pipeline-step-details-drag"
        >
          <div className={css.stepDetails} ref={setReferenceElement}>
            <Button minimal icon="drag-handle-vertical" id="pipeline-step-details-drag">
              <Button
                onClick={toggleDialog}
                className={css.toggleButton}
                rightIcon={isOpen ? 'minus' : 'plus'}
                variation={ButtonVariation.LINK}
                data-testid="restore"
              >
                <String stringID="pipeline.stepDetails" />
              </Button>
            </Button>
          </div>
        </Draggable>
      }
      {isOpen ? (
        <div className="floating-wrapper" ref={setPopperElement} {...attributes.popper} style={styles.popper}>
          {props.children}
        </div>
      ) : null}
    </div>
  )
}
