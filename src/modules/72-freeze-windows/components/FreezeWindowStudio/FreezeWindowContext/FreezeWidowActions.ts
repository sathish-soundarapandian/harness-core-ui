/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'

export enum FreezeWindowActions {
  SetYAMLViewEditable = 'SetYAMLViewEditable',
  Success = 'Success',
  UpdateFreeze = 'UpdateFreeze',
  SetYamlHandler = 'SetYamlHandler'
}

export enum DrawerTypes {
  ActivityLog = 'ActivityLog',
  Notification = 'Notification'
}

export interface ActionResponse {
  isYamlEditable?: boolean
  isUpdated?: boolean
  freezeObj?: Record<string, unknown>
  oldFreezeObj?: Record<string, unknown>
  yamlHandler?: YamlBuilderHandlerBinding
}

export interface ActionReturnType {
  type: FreezeWindowActions
  response?: ActionResponse
}

const updateYamlView = (response: ActionResponse): ActionReturnType => ({
  type: FreezeWindowActions.SetYAMLViewEditable,
  response
})

const success = (response: ActionResponse): ActionReturnType => ({ type: FreezeWindowActions.Success, response })
const updateFreeze = (response: ActionResponse): ActionReturnType => ({
  type: FreezeWindowActions.UpdateFreeze,
  response
})

const setYamlHandler = (response: ActionResponse): ActionReturnType => ({
  type: FreezeWindowActions.SetYamlHandler,
  response
})

export const FreezeWindowContextActions = {
  updateYamlView,
  success,
  updateFreeze,
  setYamlHandler
}
