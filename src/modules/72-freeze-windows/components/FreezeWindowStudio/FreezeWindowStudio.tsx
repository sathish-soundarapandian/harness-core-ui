/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useToaster, VisualYamlSelectedView as SelectedView } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { FreezeWindowContext } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowContext/FreezeWindowContext'
import { isValidYaml } from '@freeze-windows/components/FreezeWindowStudio/FreezeWindowStudioUtil'
import { FreezeWindowStudioHeader } from './FreezeWindowStudioHeader'
import { FreezeWindowStudioSubHeader } from './FreezeWindowStudioSubHeader'
import { FreezeWindowStudioBody } from './FreezeWindowStudioBody'

export const FreezeWindowStudio = () => {
  const {
    view,
    setView,
    updateYamlView,
    updateFreeze,
    state: { isYamlEditable, yamlHandler }
  } = React.useContext(FreezeWindowContext)

  // isYamlError
  const [, setYamlError] = React.useState(false)
  const { showError } = useToaster()
  const { getString } = useStrings()
  const showInvalidYamlError = React.useCallback(
    (error: string) => {
      setYamlError(true)
      showError(error)
    },
    [setYamlError, showError]
  )

  const onViewChange = (newView: SelectedView): boolean => {
    if (newView === view) {
      return false
    }

    if (
      newView === SelectedView.VISUAL &&
      isYamlEditable &&
      !isValidYaml(yamlHandler, showInvalidYamlError, getString, updateFreeze)
    ) {
      return false
    }
    setView(newView)
    updateYamlView(false)
    return true
  }

  return (
    <div>
      <FreezeWindowStudioHeader />
      <FreezeWindowStudioSubHeader onViewChange={onViewChange} />
      <FreezeWindowStudioBody />
    </div>
  )
}
