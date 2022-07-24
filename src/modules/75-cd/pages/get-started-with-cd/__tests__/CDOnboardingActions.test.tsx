/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { PipelineInfoConfig } from 'services/pipeline-ng'
import {
  CDOnboardingActions,
  CDOnboardingContextActions,
  CDOnboardingReducer,
  initialState
} from '../CDOnboardingActions'

describe('CDOnboardingactions test', () => {
  test('CDOnboardingActions Initialize', () => {
    const newState = CDOnboardingReducer(initialState, {
      ...CDOnboardingContextActions.initialized(),
      response: undefined
    })
    expect(newState).toEqual({ ...initialState, isInitialized: true })
  })

  test('CDOnboardingActions UpdatePipeline', () => {
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
    const newState = CDOnboardingReducer(initialState, {
      type: CDOnboardingActions.UpdatePipeline,
      response: { pipeline: pipelineData, isUpdated: false }
    })
    expect(newState).toEqual({ ...initialState, pipeline: pipelineData, isUpdated: false })
  })

  test('CDOnboardingActions UpdateService', () => {
    const serviceData: any = {
      accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
      identifier: 'sample_service_1658515110913',
      orgIdentifier: 'default',
      projectIdentifier: 'asdsaff',
      name: 'sample_service',
      description: '',
      deleted: false,
      tags: {},
      version: 0
    }
    const newState = CDOnboardingReducer(initialState, {
      type: CDOnboardingActions.UpdateService,
      response: { service: serviceData, isUpdated: false }
    })
    expect(newState).toEqual({ ...initialState, service: serviceData, isUpdated: false })
  })

  test('CDOnboardingActions UpdateEnvironment', () => {
    const envData: any = {
      identifier: 'sample_environment_1652678826712',
      name: 'sample_environment',
      orgIdentifier: 'default',
      projectIdentifier: 'asdsaff',
      type: 'PreProduction'
    }
    const newState = CDOnboardingReducer(initialState, {
      type: CDOnboardingActions.UpdateEnvironment,
      response: { environment: envData, isUpdated: false }
    })
    expect(newState).toEqual({ ...initialState, environment: envData, isUpdated: false })
  })

  test('CDOnboardingActions UpdateInfrastructure', () => {
    const infraData: any = {
      description: '',
      environmentRef: 'sample_environment_1652678826712',
      identifier: 'sample_infrastructre',
      name: 'sample_infrastructre',
      orgIdentifier: 'default',
      projectIdentifier: 'asdsaff',
      tags: {},
      type: 'KubernetesDirect'
    }
    const newState = CDOnboardingReducer(initialState, {
      type: CDOnboardingActions.UpdateInfrastructure,
      response: { infrastructure: infraData, isUpdated: false }
    })
    expect(newState).toEqual({ ...initialState, infrastructure: infraData, isUpdated: false })
  })

  test('CDOnboardingActions Fetching', () => {
    const newState = CDOnboardingReducer(initialState, {
      ...CDOnboardingContextActions.fetching(),
      response: { schemaErrors: true }
    })
    expect(newState).toEqual({ ...initialState, isLoading: true, isUpdated: false })
  })

  test('CDOnboardingActions Success', () => {
    const resp = { pipeline: { identifier: 'abc', name: 'ABC', stages: [] } }
    const newState = CDOnboardingReducer(initialState, { ...CDOnboardingContextActions.success(resp) })
    expect(newState).toEqual({ ...initialState, isLoading: false, ...resp })
  })

  test('CDOnboardingActions Error', () => {
    const resp = { pipeline: { identifier: 'abc', name: 'ABC', stages: [] } }
    const newState = CDOnboardingReducer(initialState, { ...CDOnboardingContextActions.error(resp) })
    expect(newState).toEqual({ ...initialState, isLoading: false, ...resp })
  })
})
