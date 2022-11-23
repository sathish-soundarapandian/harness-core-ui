/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Dispatch, SetStateAction, useCallback, useEffect, useRef } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { rafThrottle } from '@common/utils/rafThrottle'
import type { Position } from '../types'

export type UseCanvasDrag = (props: {
  isDragging: boolean
  setDragging: Dispatch<SetStateAction<boolean>>
  position: Position
  setPosition: Dispatch<SetStateAction<Position>>
}) => {
  setCanvasRef: (canvas: HTMLElement | null) => void
  setElementRef: (element: HTMLElement | null) => void
}

// custom hook for positioning an element by dragging the canvas
export const useCanvasDrag: UseCanvasDrag = ({ isDragging, setDragging, position, setPosition }) => {
  const canvasRef = useRef<HTMLElement | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  const onMouseDown = useCallback(
    (event: MouseEvent) => {
      if (event.button !== 0 || event.target !== event.currentTarget) return
      event.preventDefault()
      setDragging(true)
    },
    [setDragging]
  )

  const setCanvasRef = useCallback(
    (canvas: HTMLElement | null) => {
      canvasRef.current?.removeEventListener('mousedown', onMouseDown)
      canvasRef.current = canvas
      canvasRef.current?.addEventListener('mousedown', onMouseDown)
    },
    [onMouseDown]
  )

  const setElementRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element
  }, [])

  useEffect(() => {
    if (!isDragging) return

    let lastPosition = position
    const applyTransform = (): void => {
      if (!elementRef.current) {
        return
      }
      const { x, y } = lastPosition
      elementRef.current.style.transform = `translate(${x}px, ${y}px)`
    }
    const onMouseMove = rafThrottle((event: MouseEvent) => {
      event.preventDefault()
      const { movementX, movementY } = event
      const { x, y } = lastPosition
      lastPosition = { x: x + movementX, y: y + movementY }
      applyTransform()
    })
    const onMouseUp = (e: MouseEvent): void => {
      onMouseMove(e)
      unstable_batchedUpdates(() => {
        setDragging(false)
        setPosition(lastPosition)
      })
    }
    const onBlur = (): void => {
      lastPosition = position
      applyTransform()
      setDragging(false)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    window.addEventListener('blur', onBlur)
    return () => {
      onMouseMove.cancel()
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [position, isDragging, setDragging, setPosition])

  return {
    setCanvasRef,
    setElementRef
  }
}
