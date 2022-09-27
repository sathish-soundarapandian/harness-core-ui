/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { clone, isUndefined } from 'lodash-es'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { ActionReturnType, FreezeWindowActions } from './FreezeWidowActions'

export const DefaultFreezeId = '-1'

export const DefaultFreeze = {
  name: '',
  identifier: DefaultFreezeId,
  entityConfigs: [
    { entity: { rule: 'Rule 1 - Weekend Freeze' } },
    { entity: { rule: 'Rule 2 - Diwali Freeze' } },
    { entity: { rule: 'Rule 3 - Black Friday' } }
  ]
}

export interface FreezeWindowReducerState {
  isYamlEditable: boolean
  freezeObj: Record<string, unknown>
  isUpdated: boolean | undefined
  yamlHandler?: YamlBuilderHandlerBinding
}
export const initialState: FreezeWindowReducerState = {
  isYamlEditable: false,
  freezeObj: { ...DefaultFreeze },
  isUpdated: false
}

export const FreezeReducer = (state: FreezeWindowReducerState, data: ActionReturnType): FreezeWindowReducerState => {
  const { type, response } = data
  switch (type) {
    case FreezeWindowActions.SetYAMLViewEditable: {
      return {
        ...state,
        isYamlEditable: response?.isYamlEditable as boolean
      }
    }
    case FreezeWindowActions.UpdateFreeze: {
      return {
        ...state,
        isUpdated: isUndefined(response?.isUpdated) ? true : (response?.isUpdated as boolean),
        freezeObj: (response ? clone({ ...state.freezeObj, ...response }) : state.freezeObj) as Record<string, unknown>
      }
    }
    case FreezeWindowActions.Success: {
      return { ...state, ...response } as FreezeWindowReducerState
    }
    case FreezeWindowActions.SetYamlHandler: {
      return {
        ...state,
        yamlHandler: data.response?.yamlHandler
      }
    }
    default:
      return state
  }
}
