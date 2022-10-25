/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, waitFor, findByTestId, fireEvent } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
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
import { PipelineContext } from '../../PipelineContext/PipelineContext'

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

function WrapperComponent(props: any): JSX.Element {
  const {
    context,
    initialValues,
    initialErrors,
    serviceDefinitionType = jest.fn().mockReturnValue('Ssh'),
    selectedStrategy = 'Rolling',
    selectedStage = {
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
  } = props || {}
  return (
    <TestWrapper>
      <PipelineContext.Provider value={context}>
        <Formik
          initialErrors={initialErrors}
          initialValues={initialValues}
          onSubmit={() => undefined}
          formName="TestWrapper"
        >
          {() => {
            return (
              <FormikForm>
                <Phases
                  serviceDefinitionType={serviceDefinitionType}
                  selectedStrategy={selectedStrategy}
                  selectedStage={selectedStage}
                />
              </FormikForm>
            )
          }}
        </Formik>
      </PipelineContext.Provider>
    </TestWrapper>
  )
}

describe('Phases test', () => {
  const pipelineContextMockValue = getDummyPipelineContextValue()

  test('Generate snippet and Update stage, Rolling', async () => {
    const { container } = render(<WrapperComponent context={pipelineContextMockValue} />)

    await act(async () => {
      clickSubmit(container)
    })
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toHaveBeenCalled())
    expect(pipelineContextMockValue.updateStage).toHaveBeenCalledWith(rollingUpdateSshStageFnArg)
  })
  test('Generate snippet and Update stage, Canary', async () => {
    const { container } = render(
      <WrapperComponent
        context={pipelineContextMockValue}
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
      />
    )

    await act(async () => {
      clickSubmit(container)
    })
    await waitFor(() => expect(pipelineContextMockValue.updateStage).toHaveBeenCalled())
    expect(pipelineContextMockValue.updateStage).toHaveBeenCalledWith(canaryUpdateSshStageFnArg)
  })
  test('render Canary', async () => {
    const { container } = render(
      <WrapperComponent
        context={pipelineContextMockValue}
        selectedStrategy={'Canary'}
        serviceDefinitionType={jest.fn().mockReturnValue('WinRm')}
      />
    )

    const removeBtn = await findByTestId(container, 'remove-phases-[0]')
    expect(removeBtn).toBeInTheDocument()
    const addBtn = await findByTestId(container, 'add-phase')
    expect(addBtn).toBeInTheDocument()
  })
  test('render Canary WinRm', async () => {
    const { container } = render(
      <WrapperComponent
        context={pipelineContextMockValue}
        selectedStrategy={'BlankCanvas'}
        serviceDefinitionType={jest.fn().mockReturnValue('WinRm')}
        initialValues={{}}
      />
    )

    expect(container).toBeDefined()
  })
  test('Generate snippet and Update phases,Canary', async () => {
    const { container } = render(
      <WrapperComponent
        context={pipelineContextMockValue}
        selectedStrategy={'Canary'}
        initialValues={{
          packageType: 'WAR',
          phases: [
            {
              type: InstanceTypes.Percentage,
              spec: {
                percentage: 101
              }
            }
          ]
        }}
      />
    )
    const addBtn = await findByTestId(container, `add-phase`)
    expect(addBtn).toBeInTheDocument()
    act(() => {
      fireEvent.click(addBtn)
    })
    const switchType = container.querySelector('.bp3-button-text') as HTMLElement
    expect(switchType).toBeInTheDocument()
    fireEvent.click(switchType)
    const percentageOption = document.body.querySelector('a[data-name="percentage"]') as HTMLElement
    expect(percentageOption).toBeInTheDocument()
    fireEvent.click(percentageOption)
    const inputs = container.querySelectorAll('.bp3-input')
    fireEvent.change(inputs[1], { target: { value: 90 } })
    fireEvent.change(inputs[2], { target: { value: 99 } })

    expect(container).toBeDefined()
    await act(async () => {
      clickSubmit(container)
    })

    await waitFor(() => expect(pipelineContextMockValue.updateStage).toHaveBeenCalled())
  })
})
