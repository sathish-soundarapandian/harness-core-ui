/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetDataError } from 'restful-react'
import type { Failure } from 'services/cd-ng'
import type {
  EntityGitDetails,
  EntityValidityDetails,
  Error as TemplateError,
  ErrorNodeSummary,
  NGTemplateInfoConfig
} from 'services/template-ng'
import type { TemplateViewData } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateReducer'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'

export enum TemplateActions {
  DBInitialize = 'DBInitialize',
  Initialize = 'Initialize',
  Fetching = 'Fetching',
  UpdateTemplateView = 'UpdateTemplateView',
  UpdateTemplate = 'UpdateTemplate',
  SetYamlHandler = 'SetYamlHandler',
  Success = 'Success',
  Error = 'Error',
  IntermittentLoading = 'IntermittentLoading'
}

export enum DrawerTypes {
  TemplateVariables = 'TemplateVariables',
  TemplateInputs = 'TemplateInputs'
}

export const DrawerSizes: Record<DrawerTypes, React.CSSProperties['width']> = {
  [DrawerTypes.TemplateVariables]: 876,
  [DrawerTypes.TemplateInputs]: 876
}

export interface ActionResponse {
  error?: string
  isUpdated?: boolean
  template?: NGTemplateInfoConfig
  yamlHandler?: YamlBuilderHandlerBinding
  originalTemplate?: NGTemplateInfoConfig
  isBETemplateUpdated?: boolean
  templateView?: TemplateViewData
  stableVersion?: string
  lastPublishedVersion?: string
  versions?: string[]
  isLoading?: boolean
  isIntermittentLoading?: boolean
  gitDetails?: EntityGitDetails
  storeMetadata?: StoreMetadata
  entityValidityDetails?: EntityValidityDetails
  templateYaml?: string
  templateError?: GetDataError<Failure | Error> | null
  templateInputsErrorNodeSummary?: ErrorNodeSummary
  templateYamlError?: TemplateError
}

export interface ActionReturnType {
  type: TemplateActions
  response?: ActionResponse
}

const dbInitialized = (): ActionReturnType => ({ type: TemplateActions.DBInitialize })
const initialized = (): ActionReturnType => ({ type: TemplateActions.Initialize })
const updateTemplateView = (response: ActionResponse): ActionReturnType => ({
  type: TemplateActions.UpdateTemplateView,
  response
})
const setYamlHandler = (response: ActionResponse): ActionReturnType => ({
  type: TemplateActions.SetYamlHandler,
  response
})
const updating = (): ActionReturnType => ({ type: TemplateActions.UpdateTemplate })
const fetching = (): ActionReturnType => ({ type: TemplateActions.Fetching })
const success = (response: ActionResponse): ActionReturnType => ({ type: TemplateActions.Success, response })
const error = (response: ActionResponse): ActionReturnType => ({ type: TemplateActions.Error, response })
const setIntermittentLoading = (response: ActionResponse): ActionReturnType => ({
  type: TemplateActions.IntermittentLoading,
  response
})

export const TemplateContextActions = {
  dbInitialized,
  initialized,
  updating,
  fetching,
  updateTemplateView,
  setYamlHandler,
  setIntermittentLoading,
  success,
  error
}
