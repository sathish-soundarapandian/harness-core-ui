/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { clone } from 'lodash-es'
import type { IDrawerProps } from '@blueprintjs/core'
import type { GetDataError } from 'restful-react'
import type { YamlSnippetMetaData } from 'services/cd-ng'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import type {
  EntityGitDetails,
  EntityValidityDetails,
  ErrorNodeSummary,
  Failure,
  YamlSchemaErrorWrapperDTO,
  PipelineInfoConfig,
  CacheResponseMetadata
} from 'services/pipeline-ng'
import type { DependencyElement } from 'services/ci'
import type { TemplateServiceDataType } from '@pipeline/utils/templateUtils'
import type { TemplateIcons } from '@pipeline/utils/types'
import type { StepState } from '../ExecutionGraph/ExecutionGraphUtil'
import type { AdvancedPanels, StepOrStepGroupOrTemplateStepData } from '../StepCommands/StepCommandTypes'

export enum PipelineActions {
  DBInitialize = 'DBInitialize',
  DBInitializationFail = 'DBInitializationFail',
  UpdateSelection = 'UpdateSelection',
  Initialize = 'Initialize',
  Fetching = 'Fetching',
  Loading = 'Loading',
  IntermittentLoading = 'IntermittentLoading',
  UpdatePipelineView = 'UpdatePipelineView',
  UpdateTemplateView = 'UpdateTemplateView',
  UpdatePipeline = 'UpdatePipeline',
  SetYamlHandler = 'SetYamlHandler',
  SetTemplateTypes = 'SetTemplateTypes',
  SetTemplateServiceData = 'SetTemplateServiceData',
  SetTemplateIcons = 'SetTemplateIcons',
  SetResolvedCustomDeploymentDetailsByRef = 'SetResolvedCustomDeploymentDetailsByRef',
  PipelineSaved = 'PipelineSaved',
  UpdateSchemaErrorsFlag = 'UpdateSchemaErrorsFlag',
  Success = 'Success',
  Error = 'Error',
  SetValidationUuid = 'SetValidationUuid'
}
export const DefaultNewPipelineId = '-1'

export enum DrawerTypes {
  StepConfig = 'StepConfig',
  AddStep = 'AddCommand',
  PipelineVariables = 'PipelineVariables',
  Templates = 'Templates',
  ExecutionStrategy = 'ExecutionStrategy',
  AddService = 'AddService',
  ConfigureService = 'ConfigureService',
  PipelineNotifications = 'PipelineNotifications',
  FlowControl = 'FlowControl',
  AdvancedOptions = 'AdvancedOptions',
  PolicySets = 'PolicySets',
  ProvisionerStepConfig = 'ProvisionerStepConfig',
  AddProvisionerStep = 'AddProvisionerStep',
  TemplateInputs = 'TemplateInputs',
  ViewTemplateDetails = 'ViewTemplateDetails'
}

export const DrawerSizes: Record<DrawerTypes, React.CSSProperties['width']> = {
  [DrawerTypes.StepConfig]: 600,
  [DrawerTypes.AddStep]: 700,
  [DrawerTypes.ProvisionerStepConfig]: 600,
  [DrawerTypes.AddProvisionerStep]: 700,
  [DrawerTypes.PipelineVariables]: 1147,
  [DrawerTypes.Templates]: 450,
  [DrawerTypes.ExecutionStrategy]: 1136,
  [DrawerTypes.AddService]: 485,
  [DrawerTypes.ConfigureService]: 600,
  [DrawerTypes.PipelineNotifications]: 'calc(100% - 270px - 60px)', // has 60px more offset from right
  [DrawerTypes.FlowControl]: 600,
  [DrawerTypes.AdvancedOptions]: 840,
  [DrawerTypes.PolicySets]: 1000,
  [DrawerTypes.TemplateInputs]: 876,
  [DrawerTypes.ViewTemplateDetails]: 600
}

export enum SplitViewTypes {
  Notifications = 'Notifications',
  StageView = 'StageView'
}
export interface DrawerData extends Omit<IDrawerProps, 'isOpen'> {
  type: DrawerTypes
  data?: {
    paletteData?: {
      isRollback: boolean
      isParallelNodeClicked: boolean
      onUpdate?: (stepOrGroup: StepOrStepGroupOrTemplateStepData | DependencyElement) => void
      entity: any
      stepsMap: Map<string, StepState>
      hiddenAdvancedPanels?: AdvancedPanels[]
    }
    stepConfig?: {
      node: StepOrStepGroupOrTemplateStepData | DependencyElement
      addOrEdit: 'add' | 'edit'
      isStepGroup: boolean
      stepsMap: Map<string, StepState>
      onUpdate?: (stepOrGroup: StepOrStepGroupOrTemplateStepData | DependencyElement) => void
      isUnderStepGroup?: boolean
      hiddenAdvancedPanels?: AdvancedPanels[]
    }
  }
}

export interface PipelineViewData {
  isSplitViewOpen: boolean
  isYamlEditable: boolean
  splitViewData: {
    type?: SplitViewTypes
  }
  isDrawerOpened: boolean
  drawerData: DrawerData
  isRollbackToggled?: boolean
}

export interface SelectionState {
  selectedStageId?: string
  selectedStepId?: string
  selectedSectionId?: string
}

export interface PipelineReducerState {
  pipeline: PipelineInfoConfig
  yamlHandler?: YamlBuilderHandlerBinding
  originalPipeline: PipelineInfoConfig
  pipelineView: PipelineViewData
  pipelineIdentifier: string
  error?: string
  schemaErrors: boolean
  templateTypes: { [key: string]: string }
  templateServiceData: TemplateServiceDataType
  templateIcons?: TemplateIcons
  resolvedCustomDeploymentDetailsByRef: { [key: string]: Record<string, string | string[]> }
  storeMetadata?: StoreMetadata
  gitDetails: EntityGitDetails
  entityValidityDetails: EntityValidityDetails
  isDBInitialized: boolean
  isDBInitializationFailed: boolean
  isLoading: boolean
  isIntermittentLoading: boolean
  isInitialized: boolean
  isBEPipelineUpdated: boolean
  isUpdated: boolean
  modules: string[]
  snippets?: YamlSnippetMetaData[]
  selectionState: SelectionState
  templateError?: GetDataError<Failure | Error> | null
  remoteFetchError?: GetDataError<Failure | Error> | null
  yamlSchemaErrorWrapper?: YamlSchemaErrorWrapperDTO
  cacheResponse?: CacheResponseMetadata
  validationUuid?: string
}

export const DefaultPipeline: PipelineInfoConfig = {
  name: '',
  identifier: DefaultNewPipelineId
}

export interface ActionResponse {
  error?: string
  schemaErrors?: boolean
  isUpdated?: boolean
  isLoading?: boolean
  isDBInitializationFailed?: boolean
  modules?: string[]
  storeMetadata?: StoreMetadata
  gitDetails?: EntityGitDetails
  entityValidityDetails?: EntityValidityDetails
  cacheResponse?: CacheResponseMetadata
  pipeline?: PipelineInfoConfig
  pipelineIdentifier?: string
  yamlHandler?: YamlBuilderHandlerBinding
  templateTypes?: { [key: string]: string }
  templateServiceData?: TemplateServiceDataType
  templateIcons?: TemplateIcons
  resolvedCustomDeploymentDetailsByRef?: { [key: string]: Record<string, string | string[]> }
  originalPipeline?: PipelineInfoConfig
  isIntermittentLoading?: boolean
  isBEPipelineUpdated?: boolean
  pipelineView?: PipelineViewData
  selectionState?: SelectionState
  templateError?: GetDataError<Failure | Error> | null
  remoteFetchError?: GetDataError<Failure | Error> | null
  templateInputsErrorNodeSummary?: ErrorNodeSummary
  yamlSchemaErrorWrapper?: YamlSchemaErrorWrapperDTO
  validationUuid?: string
}

export interface ActionReturnType {
  type: PipelineActions
  response?: ActionResponse
}

const dbInitialized = (): ActionReturnType => ({ type: PipelineActions.DBInitialize })
const setDBInitializationFailed = (
  isDBInitializationFailed: PipelineReducerState['isDBInitializationFailed']
): ActionReturnType => ({
  type: PipelineActions.DBInitializationFail,
  response: { isDBInitializationFailed }
})
const initialized = (): ActionReturnType => ({ type: PipelineActions.Initialize })
const updatePipelineView = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.UpdatePipelineView,
  response
})
const updateTemplateView = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.UpdateTemplateView,
  response
})
const setYamlHandler = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.SetYamlHandler,
  response
})
const setTemplateTypes = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.SetTemplateTypes,
  response
})
const setTemplateServiceData = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.SetTemplateServiceData,
  response
})
const setTemplateIcons = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.SetTemplateIcons,
  response
})
const setResolvedCustomDeploymentDetailsByRef = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.SetResolvedCustomDeploymentDetailsByRef,
  response
})
const setLoading = (isLoading: PipelineReducerState['isLoading']): ActionReturnType => ({
  type: PipelineActions.Loading,
  response: { isLoading }
})
const fetching = (): ActionReturnType => ({ type: PipelineActions.Fetching })
const setIntermittentLoading = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.IntermittentLoading,
  response
})
const setValidationUuid = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.SetValidationUuid,
  response
})
const pipelineSavedAction = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.PipelineSaved,
  response
})
const success = (response: ActionResponse): ActionReturnType => ({ type: PipelineActions.Success, response })
const error = (response: ActionResponse): ActionReturnType => ({ type: PipelineActions.Error, response })
const updateSchemaErrorsFlag = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.UpdateSchemaErrorsFlag,
  response
})
const updateSelectionState = (response: ActionResponse): ActionReturnType => ({
  type: PipelineActions.UpdateSelection,
  response
})

export const PipelineContextActions = {
  dbInitialized,
  setDBInitializationFailed,
  initialized,
  setLoading,
  fetching,
  pipelineSavedAction,
  updatePipelineView,
  updateTemplateView,
  setYamlHandler,
  setTemplateTypes,
  setTemplateServiceData,
  setTemplateIcons,
  setResolvedCustomDeploymentDetailsByRef,
  success,
  error,
  updateSchemaErrorsFlag,
  updateSelectionState,
  setIntermittentLoading,
  setValidationUuid
}

export const initialState: PipelineReducerState = {
  pipeline: { ...DefaultPipeline },
  originalPipeline: { ...DefaultPipeline },
  pipelineIdentifier: DefaultNewPipelineId,
  pipelineView: {
    isSplitViewOpen: false,
    isDrawerOpened: false,
    isYamlEditable: false,
    splitViewData: {},
    drawerData: {
      type: DrawerTypes.AddStep
    }
  },
  schemaErrors: false,
  storeMetadata: {},
  gitDetails: {},
  entityValidityDetails: {},
  cacheResponse: {} as CacheResponseMetadata,
  templateTypes: {},
  templateIcons: {},
  templateServiceData: {},
  resolvedCustomDeploymentDetailsByRef: {},
  isLoading: false,
  isIntermittentLoading: false,
  isBEPipelineUpdated: false,
  isDBInitialized: false,
  isDBInitializationFailed: false,
  isUpdated: false,
  modules: [],
  isInitialized: false,
  selectionState: {
    selectedStageId: undefined,
    selectedStepId: undefined,
    selectedSectionId: undefined
  }
}

export const PipelineReducer = (state = initialState, data: ActionReturnType): PipelineReducerState => {
  const { type, response } = data
  switch (type) {
    case PipelineActions.Initialize:
      return {
        ...state,
        isInitialized: true
      }
    case PipelineActions.DBInitialize:
      return {
        ...state,
        isDBInitialized: true
      }
    case PipelineActions.DBInitializationFail:
      return {
        ...state,
        isDBInitializationFailed: response?.isDBInitializationFailed ?? true
      }
    case PipelineActions.UpdateSchemaErrorsFlag:
      return {
        ...state,
        schemaErrors: response?.schemaErrors ?? state.schemaErrors
      }
    case PipelineActions.SetYamlHandler:
      return {
        ...state,
        yamlHandler: data.response?.yamlHandler
      }
    case PipelineActions.SetTemplateTypes:
      return {
        ...state,
        templateTypes: data.response?.templateTypes || {}
      }
    case PipelineActions.SetTemplateServiceData:
      return {
        ...state,
        templateServiceData: data.response?.templateServiceData || {}
      }
    case PipelineActions.SetTemplateIcons:
      return {
        ...state,
        templateIcons: data.response?.templateIcons || {}
      }
    case PipelineActions.SetResolvedCustomDeploymentDetailsByRef:
      return {
        ...state,
        resolvedCustomDeploymentDetailsByRef: data.response?.resolvedCustomDeploymentDetailsByRef || {}
      }
    case PipelineActions.UpdatePipelineView:
      return {
        ...state,
        pipelineView: response?.pipelineView
          ? clone({ ...state.pipelineView, ...response?.pipelineView })
          : state.pipelineView
      }
    case PipelineActions.UpdatePipeline:
      return {
        ...state,
        isUpdated: response?.isUpdated ?? true,
        pipeline: response?.pipeline ? clone(response?.pipeline) : state.pipeline
      }
    case PipelineActions.PipelineSaved:
      return {
        ...state,
        ...response,
        isLoading: false,
        isUpdated: false
      }
    case PipelineActions.Fetching:
      return {
        ...state,
        isLoading: true,
        isBEPipelineUpdated: false,
        isUpdated: false
      }
    case PipelineActions.Loading:
      return {
        ...state,
        isLoading: response?.isLoading ?? true
      }
    case PipelineActions.Success:
    case PipelineActions.Error:
      return { ...state, isLoading: false, ...response }
    case PipelineActions.UpdateSelection:
      return {
        ...state,
        selectionState: response?.selectionState || state.selectionState
      }
    case PipelineActions.IntermittentLoading:
      return {
        ...state,
        isIntermittentLoading: !!response?.isIntermittentLoading
      }
    case PipelineActions.SetValidationUuid:
      return {
        ...state,
        validationUuid: response?.validationUuid
      }
    default:
      return state
  }
}
