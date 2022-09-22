/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { VisualYamlSelectedView as SelectedView } from '@wings-software/uicore'
import { useLocalStorage } from '@common/hooks'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'

export interface FreezeWindowContextInterface {
  view: string
  isReadonly?: boolean
  setView: (view: SelectedView) => void
  setYamlHandler?: (yamlHandler: YamlBuilderHandlerBinding) => void
}

export const FreezeWindowContext = React.createContext<FreezeWindowContextInterface>({
  isReadonly: false,
  view: SelectedView.VISUAL,
  setView: /* istanbul ignore next */ () => void 0,
  setYamlHandler: () => undefined
})

export const FreezeWindowProvider: React.FC = ({ children }) => {
  const isInvalidYAML = false // state.entityValidityDetails.valid === false
  const [view, setView] = useLocalStorage<SelectedView>(
    'freeze_studio_view',
    isInvalidYAML ? SelectedView.YAML : SelectedView.VISUAL
  )

  return <FreezeWindowContext.Provider value={{ view, setView }}>{children}</FreezeWindowContext.Provider>
}
