/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { isNil } from 'lodash-es'
import type { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { Event } from '@pipeline/utils/PipelineStudioUtils'

interface StageCanvasData {
  offsetX?: number
  offsetY?: number
  zoom?: number
}

export function useStageBuilderCanvasState(engine: DiagramEngine, resetDeps?: React.DependencyList | undefined) {
  const model = engine.getModel()

  const stageCanvasDataRef = React.useRef<StageCanvasData | undefined>()

  const resetDiagram = () => {
    model.setOffset(0, 0)
    model.setZoomLevel(100)
  }

  // reset
  useEffect(() => {
    resetDiagram()
  }, resetDeps)

  // update model
  useEffect(() => {
    const { offsetX, offsetY, zoom } = stageCanvasDataRef.current || {}
    if (!isNil(offsetX) && offsetX !== model.getOffsetX() && !isNil(offsetY) && offsetY !== model.getOffsetY()) {
      model.setOffset(offsetX, offsetY)
    }
    if (!isNil(zoom) && zoom !== model.getZoomLevel()) {
      model.setZoomLevel(zoom)
    }
  })

  // event handling
  React.useEffect(() => {
    const offsetUpdateHandler = function (event: any) {
      stageCanvasDataRef.current = {
        ...(stageCanvasDataRef.current || {}),
        offsetX: event.offsetX as number,
        offsetY: event.offsetY as number
      }
    }

    const zoomUpdateHandler = function (event: any) {
      stageCanvasDataRef.current = {
        ...(stageCanvasDataRef.current || {}),
        zoom: event.zoom as number
      }
    }

    const listenerHandle = model.registerListener({
      [Event.OffsetUpdated]: offsetUpdateHandler,
      [Event.ZoomUpdated]: zoomUpdateHandler
    })

    return () => {
      model.deregisterListener(listenerHandle)
    }
  }, [model])

  return {}
}
