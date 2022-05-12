/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/**
 * !IMPORTANT
 * Point to Note: Go to the previous versions to see how the functions are actually implemented.
 * Add them back only if they are being unit tested, else leave them out.
 * This is because it unecessarily branches out coverage and we cannot test those that are implemented if they aren't used
 */
import React from 'react'
import { Route } from 'react-router-dom'

import { pick } from 'lodash-es'

import { GitSyncTestWrapper, GitSyncTestWrapperProps } from '@common/utils/gitSyncTestUtils'

import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import pipelineContextProviderProps from './__tests__/mockJson/pipelineContextProvider.json'

export interface PipelineContextWrapperProps extends GitSyncTestWrapperProps {
  pipelineContextValues?: Partial<PipelineContextInterface>
}

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn
}))

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn(),
  useGetConnectorList: jest.fn(),
  useGetConnector: jest.fn(),
  useGetTestConnectionResult: jest.fn(),
  useGetTestGitRepoConnectionResult: jest.fn(),
  useGetSteps: jest.fn(),
  useGetExecutionStrategyList: jest.fn(),
  useGetExecutionStrategyYaml: jest.fn(),
  useGetServiceList: jest.fn(),
  useGetEnvironmentListForProject: jest.fn(),
  useListGitSync: jest.fn(),
  useGetStepsV2: jest.fn()
}))

jest.mock('services/pipeline-ng', () => ({
  useGetYamlSchema: jest.fn(),
  getPipelinePromise: jest.fn(),
  useGetSteps: jest.fn(),
  useCreateVariablesV2: jest.fn()
}))

export function PipelineContextTestWrapper(
  props: React.PropsWithChildren<PipelineContextWrapperProps>
): React.ReactElement {
  const { defaultAppStoreValues, pipelineContextValues } = props
  return (
    <GitSyncTestWrapper
      {...pick(props, ['path', 'pathParams', 'queryParams'])}
      defaultAppStoreValues={{
        featureFlags: {},
        selectedProject: {
          identifier: 'dummy',
          name: 'dummy',
          modules: ['CD']
        },
        isGitSyncEnabled: true,
        connectivityMode: 'DELEGATE',
        ...defaultAppStoreValues
      }}
    >
      <PipelineContext.Provider
        value={
          {
            fetchPipeline: jest.fn,
            getStageFromPipeline: jest.fn,
            getStagePathFromPipeline: jest.fn,
            setSelection: jest.fn,
            setTemplateTypes: jest.fn,
            updatePipeline: jest.fn,
            updatePipelineView: jest.fn,
            addNewNodeToMap: jest.fn,
            setStepsGraphCanvasState: jest.fn,
            setSelectedStepId: jest.fn,
            setSelectedStageId: jest.fn,
            renderPipelineStage: jest.fn,
            ...pipelineContextProviderProps,
            ...pipelineContextValues,
            state: {
              ...pipelineContextProviderProps.state,
              ...pipelineContextValues?.state
            }
          } as PipelineContextInterface
        }
      >
        <Route exact path={props.path}>
          {props.children}
        </Route>
      </PipelineContext.Provider>
    </GitSyncTestWrapper>
  )
}
