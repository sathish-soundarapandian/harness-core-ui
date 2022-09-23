/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { Scope } from '@common/interfaces/SecretsInterface'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import {
  PipelineContextInterface,
  PipelineContextType
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelinePathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import type { PipelineCanvasProps } from '@pipeline/components/PipelineStudio/PipelineCanvas/PipelineCanvas'

export const getPipelineContext = (): PipelineContextInterface => ({
  state: {
    pipeline: { name: '', identifier: '', stages: [] },
    originalPipeline: { name: '', identifier: '', stages: [] },
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: false,
      isYamlEditable: false,
      drawerData: { type: DrawerTypes.AddStep },
      splitViewData: {}
    },
    schemaErrors: false,
    gitDetails: {},
    entityValidityDetails: {},
    selectionState: {},
    pipelineIdentifier: '',
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isInitialized: true,
    isLoading: false,
    isUpdated: false,
    templateTypes: {},
    templateServiceData: {}
  },
  contextType: PipelineContextType.Pipeline,
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  setSchemaErrorView: jest.fn(),
  updatePipelineStoreMetadata: jest.fn(),
  updateGitDetails: jest.fn(),
  updateEntityValidityDetails: jest.fn(),
  stagesMap: {},
  isReadonly: false,
  scope: Scope.PROJECT,
  renderPipelineStage: jest.fn(),
  fetchPipeline: jest.fn(),
  setYamlHandler: jest.fn(),
  updatePipeline: jest.fn(),
  updatePipelineView: jest.fn(),
  updateStage: jest.fn(),
  getStageFromPipeline: jest.fn(() => ({ stage: undefined, parent: undefined })),
  deletePipelineCache: jest.fn(),
  runPipeline: jest.fn(),
  pipelineSaved: jest.fn(),
  view: 'ui',
  setView: jest.fn(),
  stepsFactory: factory,
  setSelectedStageId: jest.fn(),
  setSelectedStepId: jest.fn(),
  setSelectedSectionId: jest.fn(),
  setSelection: jest.fn(),
  getStagePathFromPipeline: jest.fn(),
  setTemplateTypes: jest.fn(),
  setTemplateServiceData: jest.fn()
})

export const getEditPipelineContext = (): PipelineContextInterface => ({
  state: {
    pipeline: { name: '', identifier: '', stages: [] },
    originalPipeline: { name: '', identifier: '', stages: [] },
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: false,
      isYamlEditable: false,
      drawerData: { type: DrawerTypes.AddStep },
      splitViewData: {}
    },
    schemaErrors: false,
    gitDetails: {},
    entityValidityDetails: {},
    selectionState: {},
    pipelineIdentifier: '',
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isInitialized: true,
    isLoading: false,
    isUpdated: true,
    templateTypes: {},
    templateServiceData: {}
  },
  contextType: PipelineContextType.Pipeline,
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  setSchemaErrorView: jest.fn(),
  updatePipelineStoreMetadata: jest.fn(),
  updateGitDetails: jest.fn(),
  updateEntityValidityDetails: jest.fn(),
  stagesMap: {},
  isReadonly: false,
  scope: Scope.PROJECT,
  renderPipelineStage: jest.fn(),
  fetchPipeline: jest.fn(),
  setYamlHandler: jest.fn(),
  updatePipeline: jest.fn(),
  updatePipelineView: jest.fn(),
  updateStage: jest.fn(),
  getStageFromPipeline: jest.fn(() => ({ stage: undefined, parent: undefined })),
  deletePipelineCache: jest.fn(),
  runPipeline: jest.fn(),
  pipelineSaved: jest.fn(),
  view: 'ui',
  setView: jest.fn(),
  stepsFactory: factory,
  setSelectedStageId: jest.fn(),
  setSelectedStepId: jest.fn(),
  setSelectedSectionId: jest.fn(),
  setSelection: jest.fn(),
  getStagePathFromPipeline: jest.fn(),
  setTemplateTypes: jest.fn(),
  setTemplateServiceData: jest.fn()
})

export const showError = jest.fn()
export const showSuccess = jest.fn()
export const toasterClear = jest.fn()

export const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})

export const getProps = (): PipelineCanvasProps => ({
  toPipelineStudio: jest.fn(),
  toPipelineDetail: jest.fn(),
  toPipelineList: jest.fn(),
  toPipelineProject: jest.fn()
})

export const TEST_PATH = routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })
export const pipelineProps = getProps()
