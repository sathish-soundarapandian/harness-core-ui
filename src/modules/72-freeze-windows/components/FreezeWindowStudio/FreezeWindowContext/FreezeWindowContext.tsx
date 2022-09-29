/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import noop from 'lodash-es/noop'
import { VisualYamlSelectedView as SelectedView } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useLocalStorage } from '@common/hooks'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FreezeWindowContextActions } from './FreezeWidowActions'
import { initialState, FreezeWindowReducerState, FreezeReducer } from './FreezeWindowReducer'

export enum FreezeWindowLevels {
  ACCOUNT = 'ACCOUNT',
  ORG = 'ORG',
  PROJECT = 'PROJECT'
}

export interface FreezeWindowContextInterface {
  state: FreezeWindowReducerState
  view: string
  isReadonly?: boolean
  setView: (view: SelectedView) => void
  setYamlHandler: (yamlHandler: YamlBuilderHandlerBinding) => void
  updateYamlView: (isYamlEditable: boolean) => void
  updateFreeze: (response: any) => void
  freezeWindowLevel: FreezeWindowLevels
}

export const FreezeWindowContext = React.createContext<FreezeWindowContextInterface>({
  state: initialState,
  isReadonly: false,
  view: SelectedView.VISUAL,
  setView: noop,
  setYamlHandler: noop,
  updateYamlView: noop,
  updateFreeze: noop,
  freezeWindowLevel: FreezeWindowLevels.ORG
})

const getFreezeWindowLevel = ({ projectIdentifier, orgIdentifier }: ProjectPathProps) => {
  if (projectIdentifier) return FreezeWindowLevels.PROJECT
  if (orgIdentifier) return FreezeWindowLevels.ORG
  return FreezeWindowLevels.ACCOUNT
}

export const FreezeWindowProvider: React.FC = ({ children }) => {
  const isInvalidYAML = false // state.entityValidityDetails.valid === false
  const [view, setView] = useLocalStorage<SelectedView>(
    'freeze_studio_view',
    isInvalidYAML ? SelectedView.YAML : SelectedView.VISUAL
  )
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [freezeWindowLevel, setFreezeWindowLevel] = React.useState<FreezeWindowLevels>(FreezeWindowLevels.ORG)

  React.useEffect(() => {
    setFreezeWindowLevel(getFreezeWindowLevel({ accountId, projectIdentifier, orgIdentifier }))
  }, [accountId, projectIdentifier, orgIdentifier])

  const [state, dispatch] = React.useReducer(FreezeReducer, initialState)
  const updateYamlView = React.useCallback((isYamlEditable: boolean) => {
    dispatch(FreezeWindowContextActions.updateYamlView({ isYamlEditable }))
  }, [])

  const updateFreeze = React.useCallback(response => {
    dispatch(FreezeWindowContextActions.updateFreeze(response))
  }, [])

  const setYamlHandler = React.useCallback((yamlHandler: YamlBuilderHandlerBinding) => {
    dispatch(FreezeWindowContextActions.setYamlHandler({ yamlHandler }))
  }, [])

  return (
    <FreezeWindowContext.Provider
      value={{ state, view, setView, updateYamlView, updateFreeze, setYamlHandler, freezeWindowLevel }}
    >
      {children}
    </FreezeWindowContext.Provider>
  )
}
