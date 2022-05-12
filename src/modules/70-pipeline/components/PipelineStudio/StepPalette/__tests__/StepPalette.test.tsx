/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react'
import type { IconName } from '@wings-software/uicore'
import { useMutateAsGet } from '@common/hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { StringsMap } from 'framework/strings/StringsContext'
import { getStepPaletteModuleInfosFromStage } from '@pipeline/utils/stepUtils'
import { StepPalette } from '../StepPalette'

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}

class StepOne extends Step<any> {
  protected type = StepType.KubernetesDirect
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
  protected stepDescription: keyof StringsMap = 'Awesome description about step s1' as keyof StringsMap
  validateInputSet(): any {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<any>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

const stepFactory = new StepFactory()
stepFactory.registerStep(new StepOne())

const getProps = () => ({
  onSelect: jest.fn(),
  onClose: jest.fn(),
  stepsFactory: stepFactory,
  selectedStage: {},
  stepPaletteModuleInfos: getStepPaletteModuleInfosFromStage(StageType.DEPLOY),
  stageType: StageType.DEPLOY
})

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn()
}))

const mockStepsData = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'Library',
      stepCategories: [
        {
          name: 'Continuous Deployment',
          stepCategories: [
            {
              name: 'K8',
              stepCategories: [],
              stepsData: [
                {
                  name: 's1',
                  type: StepType.KubernetesDirect
                },
                {
                  name: 's2',
                  type: 't2',
                  disabled: true
                }
              ]
            },
            {
              name: 'Serverless Lambda',
              stepCategories: [],
              stepsData: [
                {
                  name: 'Serverless AWS Lambda Deploy',
                  type: StepType.ServerlessAwsLambdaDeploy
                },
                {
                  name: 'Serverless AWS Lambda Rollback',
                  type: StepType.ServerlessAwsLambdaRollback
                }
              ]
            },
            {
              name: 'Utilities',
              stepCategories: [
                {
                  name: 'Scripted',
                  stepsData: [
                    {
                      name: 's3',
                      type: 't3'
                    },
                    {
                      name: 's4',
                      type: 't4'
                    }
                  ]
                }
              ],
              stepsData: []
            }
          ]
        }
      ]
    },
    metaData: null as unknown as undefined,
    correlationId: 'someId'
  }
}

describe('Step Palette tests', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockReturnValue(mockStepsData)
  })

  test('Show all steps count and filters correctly', async () => {
    const props = getProps()
    const { container, queryByText } = render(
      <TestWrapper>
        <StepPalette {...props} />
      </TestWrapper>
    )

    expect(queryByText('Show All Steps (6)')).toBeDefined()
    expect(container.getElementsByClassName('paletteCard')).toHaveLength(6)
    fireEvent.change(container.querySelector('input[type="search"]')!, { target: { value: 'tttt' } })
    await waitFor(() => expect(queryByText('stepPalette.noSearchResultsFound')).not.toBeNull())
  })

  test('clicking on category should display steps which are falling under that category', async () => {
    const props = getProps()
    const { container, queryByText, getByText } = render(
      <TestWrapper>
        <StepPalette {...props} />
      </TestWrapper>
    )

    expect(queryByText('Show All Steps (6)')).toBeDefined()
    expect(container.getElementsByClassName('paletteCard')).toHaveLength(6)
    // Click on K8 category
    const k8Category = queryByText('K8 (2)')
    act(() => {
      fireEvent.click(k8Category!)
    })
    expect(getByText('K8')).toBeDefined()
    expect(container.getElementsByClassName('paletteCard')).toHaveLength(2)
    expect(container).toMatchSnapshot('s2 should be disabled')
  })

  test('clicking on step category should display steps which are falling under that step category', async () => {
    const props = getProps()
    const { container, queryByText, getByText } = render(
      <TestWrapper>
        <StepPalette {...props} />
      </TestWrapper>
    )

    expect(queryByText('Show All Steps (6)')).toBeDefined()
    expect(container.getElementsByClassName('paletteCard')).toHaveLength(6)
    // Click on K8 category
    const scriptedStepCategory = queryByText('Scripted (2)')
    act(() => {
      fireEvent.click(scriptedStepCategory!)
    })
    expect(getByText('Utilities')).toBeDefined()
    expect(container.getElementsByClassName('paletteCard')).toHaveLength(2)
  })

  test('clicking on category Serverless Lambda should display steps which are falling under Serverless Lambda', async () => {
    const props = getProps()
    const { container, queryByText, getByText } = render(
      <TestWrapper>
        <StepPalette {...props} />
      </TestWrapper>
    )

    expect(queryByText('Show All Steps (6)')).toBeDefined()
    expect(container.getElementsByClassName('paletteCard')).toHaveLength(6)
    // Click on Serverless Lambda category
    const serverlessLambdaStepCategory = queryByText('Serverless Lambda (2)')
    act(() => {
      fireEvent.click(serverlessLambdaStepCategory!)
    })
    expect(getByText('Serverless Lambda')).toBeDefined()
    expect(container.getElementsByClassName('paletteCard')).toHaveLength(2)
  })

  test('Hover over step and select it', async () => {
    const props = getProps()
    const { getByText, queryByText, getByTestId } = render(
      <TestWrapper>
        <StepPalette {...props} />
      </TestWrapper>
    )
    expect(queryByText('Show All Steps (4)')).toBeDefined()

    const stepLibraryHeader = getByText('stepPalette.title')
    expect(stepLibraryHeader).toBeInTheDocument()

    // Hover over step card
    const stepCard = getByTestId('step-card-s1')
    act(() => {
      fireEvent.mouseEnter(stepCard!)
    })
    await waitFor(() => expect(getByText('Awesome description about step s1')).toBeInTheDocument())

    // Click on step card
    const stepSection = getByText('s1').closest('section')?.parentElement
    act(() => {
      fireEvent.click(stepSection!)
    })
    await waitFor(() => expect(props.onSelect).toBeCalled())
    expect(props.onSelect).toBeCalledWith({ icon: 'cross', name: 's1', type: 'KubernetesDirect' })
  })
})

describe('loading indicator', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockReturnValue({
      loading: true,
      error: null,
      data: {
        status: 'SUCCESS',
        data: {
          name: 'Library',
          stepCategories: [],
          stepsData: []
        },
        metaData: null as unknown as undefined,
        correlationId: 'someId'
      }
    })
  })
  test('Loading indicator', () => {
    const props = getProps()
    const { queryByText } = render(
      <TestWrapper>
        <StepPalette {...props} />
      </TestWrapper>
    )

    expect(queryByText('stepPalette.noSearchResultsFound')).toBeNull()
    expect(queryByText('Loading steps...')).toBeDefined()
    expect(queryByText('Show All Steps (0)')).toBeDefined()
  })
})

describe('no data indicator', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockReturnValue({
      loading: false,
      error: null,
      data: {
        status: 'SUCCESS',
        data: {
          name: 'Library',
          stepCategories: [],
          stepsData: []
        },
        metaData: null as unknown as undefined,
        correlationId: 'someId'
      }
    })
  })

  test('No data indicator', () => {
    const props = getProps()
    const { queryByText } = render(
      <TestWrapper>
        <StepPalette {...props} />
      </TestWrapper>
    )

    expect(queryByText('stepPalette.noSearchResultsFound')).toBeDefined()
    expect(queryByText('Show All Steps (0)')).toBeDefined()
  })
})
