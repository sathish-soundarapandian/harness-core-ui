/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { tooltipDictionary } from '@harness/ng-tooltip'
import { TooltipContextProvider } from '@harness/uicore'
import { NGTooltipEditorPortal } from 'framework/tooltip/TooltipEditor'

export const TooltipContext = React.createContext<Record<string, any>>({})
const Harness = (window.Harness = window.Harness || {})

const PREVIEW_TOOLTIP_DATASET_KEY = 'previewTooltipDataset'

export function ToolTipProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const [tooltipDictionaryContext, setTooltipDictionaryContext] = React.useState(tooltipDictionary)
  const [showTooltipEditor, setShowTooltipEditor] = React.useState(false)

  Harness.openNgTooltipEditor = () => setShowTooltipEditor(true)
  Harness.openTooltipEditor = () => setShowTooltipEditor(true)

  const onPreviewDatasetFromLocalStorage = React.useCallback(() => {
    if (showTooltipEditor) {
      const fromLocalStorage = localStorage.getItem(PREVIEW_TOOLTIP_DATASET_KEY)
      if (typeof fromLocalStorage === 'string') {
        try {
          const parsed = JSON.parse(fromLocalStorage)
          if (Date.now() < parsed?.expiry) {
            setTooltipDictionaryContext(parsed.value)
          } else {
            setTooltipDictionaryContext(tooltipDictionary)
            localStorage.removeItem(PREVIEW_TOOLTIP_DATASET_KEY)
          }
        } catch (e) {
          setTooltipDictionaryContext(tooltipDictionary)
          window.alert(`Error while parsing preview dataset - ${e}`)
        }
      }
    }
  }, [showTooltipEditor])

  const onEditorClose = React.useCallback(() => {
    setShowTooltipEditor(false)
    setTooltipDictionaryContext(tooltipDictionary)
  }, [])

  return (
    <TooltipContext.Provider value={tooltipDictionaryContext}>
      <NGTooltipEditorPortal
        showTooltipEditor={showTooltipEditor}
        onEditorClose={onEditorClose}
        setPreviewDatasetFromLocalStorage={onPreviewDatasetFromLocalStorage}
      />
      <TooltipContextProvider initialTooltipDictionary={tooltipDictionaryContext}>
        {props.children}
      </TooltipContextProvider>
    </TooltipContext.Provider>
  )
}
