/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { debounce } from 'lodash-es'
import { useState, useEffect, useRef, useContext } from 'react'
import GraphConfigStore from '../PipelineGraph/GraphConfigStore'
import { getComputedPosition } from '../PipelineGraph/PipelineGraphUtils'
import type { NodeCollapsibleProps } from '../types'

export interface ResizeObserverResult {
  shouldCollapse: boolean
  shouldExpand: boolean
}
export const useNodeResizeObserver = (
  elementToCompare: Element | null,
  options: NodeCollapsibleProps = {} as NodeCollapsibleProps,
  parentSelector = '',
  isDragging = false
): ResizeObserverResult => {
  const { graphScale } = useContext(GraphConfigStore)
  const { percentageNodeVisible = 0.8, bottomMarginInPixels = 120 } = options
  const [element, setElement] = useState<Element | null>(null)
  const [refElement, setRefElement] = useState<Element | null>(null)
  const [state, setState] = useState<ResizeObserverResult>({ shouldCollapse: false, shouldExpand: false })
  const observer = useRef<null | ResizeObserver>(null)
  const cleanup = (): void => {
    if (observer.current) {
      observer.current.disconnect()
    }
  }

  useEffect(() => {
    setRefElement(elementToCompare)
  }, [elementToCompare])

  useEffect(() => {
    setElement(document.querySelector(parentSelector!) as HTMLElement)
  }, [parentSelector])

  const onResize = debounce(([entry]) => {
    const finalData = isIntersectingBottomWhenResize(
      entry,
      refElement as Element,
      bottomMarginInPixels,
      percentageNodeVisible
    )
    setState(finalData)
  }, 100)

  useEffect(() => {
    if (!parentSelector || !element || !refElement) {
      return
    }
    cleanup()
    observer.current = new ResizeObserver(onResize)
    const ob = observer.current
    ob.observe(element as Element)

    return () => {
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, refElement, graphScale, isDragging])

  return state
}

const isIntersectingBottomWhenResize = (
  entry: ResizeObserverEntry,
  el: Element,
  bottomPadding: number,
  percentageNodeVisible: number
): ResizeObserverResult => {
  const elementPos = getComputedPosition(el.id, entry.target as HTMLDivElement) as DOMRect
  const percentageVisibleHeight = elementPos.height * percentageNodeVisible
  const intersectingBottom = elementPos.top + (elementPos.height - percentageVisibleHeight) >= entry.contentRect.bottom
  const notIntersectingBottom = elementPos.bottom + bottomPadding < entry.contentRect.bottom

  return { shouldCollapse: intersectingBottom, shouldExpand: notIntersectingBottom }
}
