/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { clickSubmit } from '@common/utils/JestFormHelper'
import type { StageElementWrapperConfig } from 'services/pipeline-ng'
import * as cdngServices from 'services/cd-ng'
import { InstanceTypes } from '@common/components/InstanceDropdownField/InstanceDropdownField'

import Phases from '../Phases'

import {
  rollingYaml,
  canaryYaml,
  getDummyPipelineContextValue,
  rollingUpdateSshStageFnArg,
  canaryUpdateSshStageFnArg
} from './mocks/mock'
import { PipelineContext, PipelineContextInterface } from '../../PipelineContext/PipelineContext'

jest
  .spyOn(cdngServices, 'usePostExecutionStrategyYaml')
  .mockImplementation((props: cdngServices.UsePostExecutionStrategyYamlProps): any => {
    switch (props.queryParams?.strategyType) {
      case 'Rolling':
        return {
          mutate: () =>
            Promise.resolve({
              status: 'SUCCESS',
              data: rollingYaml.data
            }),
          loading: false
        }
      case 'Canary':
        return {
          mutate: () =>
            Promise.resolve({
              status: 'SUCCESS',
              data: canaryYaml.data
            }),
          loading: false
        }
      default:
        break
    }
  })

describe('Phases test', () => {
  let pipelineContextMockValue: PipelineContextInterface

  test('Generate snippet and Update stage, Rolling', async () => {
    pipelineContextMockValue = getDummyPipelineContextValue()

    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <Phases
            isVerifyEnabled={false}
            serviceDefinitionType={jest.fn().mockReturnValue('Ssh')}
            selectedStrategy={'Rolling'}
            selectedStage={
              {
                stage: {
                  identifier: 'stage_1',
                  name: 'stage 1',
                  spec: {
                    serviceConfig: { serviceDefinition: { type: 'Ssh' }, serviceRef: 'service_3' },
                    execution: {
                      steps: [
                        {
                          step: {
                            identifier: 'rolloutDeployment',
                            name: 'Rollout Deployment',
                            spec: { skipDryRun: false },
                            type: 'SshRollingDeploy'
                          }
                        }
                      ],
                      rollbackSteps: []
                    }
                  },
                  type: 'Deployment'
                }
              } as StageElementWrapperConfig
            }
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await act(async () => {
      clickSubmit(container)
    })
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toHaveBeenCalled())
    expect(pipelineContextMockValue.updateStage).toHaveBeenCalledWith(rollingUpdateSshStageFnArg)
  })
  test('Generate snippet and Update stage, Canary', async () => {
    pipelineContextMockValue = getDummyPipelineContextValue()

    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <Phases
            isVerifyEnabled={false}
            serviceDefinitionType={jest.fn().mockReturnValue('Ssh')}
            selectedStrategy={'Canary'}
            initialValues={{
              packageType: 'WAR',
              phases: [
                {
                  type: InstanceTypes.Instances,
                  spec: {
                    count: 1
                  }
                }
              ]
            }}
            selectedStage={
              {
                stage: {
                  identifier: 'stage_1',
                  name: 'stage 1',
                  spec: {
                    serviceConfig: { serviceDefinition: { type: 'Ssh' }, serviceRef: 'service_3' },
                    execution: {
                      steps: [
                        {
                          step: {
                            identifier: 'rolloutDeployment',
                            name: 'Rollout Deployment',
                            spec: { skipDryRun: false },
                            type: 'SshRollingDeploy'
                          }
                        }
                      ],
                      rollbackSteps: []
                    }
                  },
                  type: 'Deployment'
                }
              } as StageElementWrapperConfig
            }
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await act(async () => {
      clickSubmit(container)
    })
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toHaveBeenCalled())
    expect(pipelineContextMockValue.updateStage).toHaveBeenCalledWith(canaryUpdateSshStageFnArg)
  })
})
