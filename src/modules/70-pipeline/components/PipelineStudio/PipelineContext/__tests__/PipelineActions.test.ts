/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { getStageFromPipeline, getStagePathFromPipeline } from '../helpers'
import {
  ActionResponse,
  DrawerTypes,
  initialState,
  PipelineActions,
  PipelineContextActions,
  PipelineReducer,
  PipelineViewData
} from '../PipelineActions'

describe('PipelineActions test', () => {
  test('PipelineActions Initializ', () => {
    const newState = PipelineReducer(initialState, { ...PipelineContextActions.initialized(), response: undefined })
    expect(newState).toEqual({ ...initialState, isInitialized: true })
  })

  test('PipelineActions DBInitialize', () => {
    const newState = PipelineReducer(initialState, { ...PipelineContextActions.dbInitialized(), response: undefined })
    expect(newState).toEqual({ ...initialState, isDBInitialized: true })
  })

  test('PipelineActions UpdateSchemaErrorsFlag', () => {
    const newStateWithSchemaErrors = PipelineReducer(initialState, {
      ...PipelineContextActions.updateSchemaErrorsFlag({ schemaErrors: true })
    })
    expect(newStateWithSchemaErrors).toEqual({ ...initialState, schemaErrors: true })
    const newStateWithoutSchemaErrors = PipelineReducer(initialState, {
      ...PipelineContextActions.updateSchemaErrorsFlag({})
    })
    expect(newStateWithoutSchemaErrors).toEqual({ ...initialState, schemaErrors: false })
  })

  test('PipelineActions SetYamlHandler', () => {
    const resp = {
      yamlHandler: {
        getLatestYaml: jest.fn(),
        getYAMLValidationErrorMap: jest.fn()
      } as YamlBuilderHandlerBinding
    }
    const newState = PipelineReducer(initialState, { ...PipelineContextActions.setYamlHandler(resp) })
    expect(newState).toEqual({ ...initialState, yamlHandler: resp.yamlHandler })
  })

  test('PipelineActions UpdatePipelineView', () => {
    const pipelineViewData: PipelineViewData = {
      isDrawerOpened: false,
      isYamlEditable: true,
      isSplitViewOpen: false,
      drawerData: {
        type: DrawerTypes.AddService
      },
      splitViewData: {}
    }
    const newState = PipelineReducer(initialState, {
      ...PipelineContextActions.updatePipelineView({ pipelineView: pipelineViewData })
    })
    expect(newState).toEqual({ ...initialState, pipelineView: pipelineViewData })
  })

  test('PipelineActions UpdatePipeline', () => {
    const pipelineData: PipelineInfoConfig = {
      identifier: 'abc',
      name: 'ABC',
      description: 'Desc',
      stages: [
        {
          stage: {
            identifier: 'stage_1',
            name: 'Stage 1',
            type: 'Deployment'
          }
        }
      ]
    }
    const newState = PipelineReducer(initialState, {
      type: PipelineActions.UpdatePipeline,
      response: { pipeline: pipelineData, isUpdated: false }
    })
    expect(newState).toEqual({ ...initialState, pipeline: pipelineData, isUpdated: false })
  })

  test('PipelineActions PipelineSaved', () => {
    const resp = { pipeline: { identifier: 'abc', name: 'ABC', stages: [] } }
    const newState = PipelineReducer(initialState, { ...PipelineContextActions.pipelineSavedAction(resp) })
    expect(newState).toEqual({ ...initialState, ...resp, isLoading: false, isUpdated: false })
  })

  test('PipelineActions Fetching', () => {
    const newState = PipelineReducer(initialState, {
      ...PipelineContextActions.fetching(),
      response: { schemaErrors: true }
    })
    expect(newState).toEqual({ ...initialState, isLoading: true, isBEPipelineUpdated: false, isUpdated: false })
  })

  test('PipelineActions Success', () => {
    const resp = { pipeline: { identifier: 'abc', name: 'ABC', stages: [] } }
    const newState = PipelineReducer(initialState, { ...PipelineContextActions.success(resp) })
    expect(newState).toEqual({ ...initialState, isLoading: false, ...resp })
  })

  test('PipelineActions Error', () => {
    const resp = { pipeline: { identifier: 'abc', name: 'ABC', stages: [] } }
    const newState = PipelineReducer(initialState, { ...PipelineContextActions.error(resp) })
    expect(newState).toEqual({ ...initialState, isLoading: false, ...resp })
  })

  test('PipelineActions UpdateSelection', () => {
    const resp: ActionResponse = {
      pipeline: { identifier: 'abc', name: 'ABC', stages: [] },
      selectionState: { selectedStageId: 'stage_1', selectedStepId: 'Shell_Script', selectedSectionId: 'section_1' }
    }
    const newState = PipelineReducer(initialState, { ...PipelineContextActions.updateSelectionState(resp) })
    expect(newState).toEqual({ ...initialState, selectionState: resp.selectionState })
  })

  test('PipelineActions Updating', () => {
    const newState = PipelineReducer(initialState, {
      ...PipelineContextActions.updating(),
      response: { schemaErrors: true }
    })
    expect(newState).toEqual({ ...initialState, isLoading: false, isBEPipelineUpdated: false, isUpdated: true })
  })
})

const localPipeline: PipelineInfoConfig = {
  identifier: 'demo',
  name: 'demo',
  orgIdentifier: 'org',
  projectIdentifier: 'project',
  stages: [
    {
      stage: {
        type: 'Deploy',
        identifier: 'testCdStage1',
        name: 'testCdStage1',
        spec: {}
      }
    },
    {
      parallel: [
        {
          stage: {
            type: 'Deploy',
            identifier: 'parallelStage1',
            name: 'parallelStage1'
          }
        }
      ]
    },
    {}
  ]
}
describe('Helpers test', () => {
  test('getStageFromPipeline ', () => {
    let returned = getStageFromPipeline('testCdStage1', localPipeline)
    expect(returned).toStrictEqual({
      parent: undefined,
      stage: { stage: { identifier: 'testCdStage1', name: 'testCdStage1', spec: {}, type: 'Deploy' } }
    })
    returned = getStageFromPipeline('parallelStage1', localPipeline)
    expect(returned).toStrictEqual({
      parent: { parallel: [{ stage: { identifier: 'parallelStage1', name: 'parallelStage1', type: 'Deploy' } }] },
      stage: { stage: { identifier: 'parallelStage1', name: 'parallelStage1', type: 'Deploy' } }
    })
  })
  test('getStagePathFromPipeline ', () => {
    let returned = getStagePathFromPipeline('testCdStage1', 'pipeline', localPipeline)
    expect(returned).toStrictEqual('pipeline.0')

    returned = getStagePathFromPipeline('parallelStage1', 'pipeline', localPipeline)
    expect(returned).toStrictEqual('pipeline.1.parallel.0')

    localPipeline.stages = []
    returned = getStagePathFromPipeline('parallelStage1', 'pipeline', localPipeline)
    expect(returned).toStrictEqual('pipeline')
  })
})
