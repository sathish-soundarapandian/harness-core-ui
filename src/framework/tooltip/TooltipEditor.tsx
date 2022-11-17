/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { tooltipDictionary, TooltipEditor } from '@harness/ng-tooltip'

interface NGTooltipEditorPortalInterface {
  onEditorClose: () => void
  showTooltipEditor: boolean
  setPreviewDatasetFromLocalStorage: () => void
}

export const NGTooltipEditorPortal = ({
  onEditorClose,
  showTooltipEditor,
  setPreviewDatasetFromLocalStorage
}: NGTooltipEditorPortalInterface) => {
  if (!showTooltipEditor) {
    return null
  }

  const ngTooltipEditorPortalRoot = document.getElementById('ngTooltipEditorRootParent')
  return ReactDOM.createPortal(
    <TooltipEditor
      onClose={onEditorClose}
      tooltipDictionary={tooltipDictionary}
      setPreviewDatasetFromLocalStorage={setPreviewDatasetFromLocalStorage}
    />,
    ngTooltipEditorPortalRoot!
  )
}
