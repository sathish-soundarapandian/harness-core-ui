/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ComponentPropsWithRef, createRef, useImperativeHandle } from 'react'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import { IconName, MultiTypeInputType } from '@harness/uicore'
import type { RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { FormikErrors } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { WaitStep } from '@pipeline/components/PipelineSteps/Steps/WaitStep/WaitStep'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import mockImport from 'framework/utils/mockImport'
import { StepGroupStep } from '@pipeline/components/PipelineSteps/Steps/StepGroupStep/StepGroupStep'
import type { SaveTemplateButtonProps } from '@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton'
import { StageType } from '@pipeline/utils/stageHelpers'
import { StepCommandsWithRef, StepFormikRef } from '../StepCommands'
import { StepCommandsViews } from '../StepCommandTypes'

mockImport('@pipeline/components/PipelineStudio/TemplateBar/TemplateBar', {
  TemplateBar: () => <div>template bar</div>
})
mockImport('@pipeline/components/PipelineStudio/SaveTemplateButton/SaveTemplateButton', {
  SaveTemplateButton: ({ type, data, buttonProps }: SaveTemplateButtonProps) => {
    return (
      <button
        type="button"
        onClick={async () =>
          (buttonProps?.onClick as any)({
            data: await Promise.resolve(typeof data === 'function' ? data() : data),
            type
          })
        }
      >
        save as template
      </button>
    )
  }
})

function TemplateRenderStepMock(props: StepProps<any>): JSX.Element {
  useImperativeHandle(props.formikRef, () => ({
    values: props.initialValues,
    submitForm: () => Promise.resolve(props.initialValues),
    errors: {}
  }))

  return <pre>{JSON.stringify(props.initialValues)}</pre>
}

class TemplateStep extends PipelineStep<TemplateStepNode> {
  protected type = StepType.Template
  protected stepName = 'Template step'
  protected stepIcon: IconName = 'template-library'
  protected defaultValues: TemplateStepNode = {
    identifier: '',
    name: '',
    template: {} as any
  }
  validateInputSet(): FormikErrors<TemplateStepNode> {
    return {}
  }
  processFormData(values: TemplateStepNode): TemplateStepNode {
    return values
  }
  renderStep(props: StepProps<any>): JSX.Element {
    return <TemplateRenderStepMock {...props} />
  }
}

const getDefaultProps = (): ComponentPropsWithRef<typeof StepCommandsWithRef> => {
  return {
    step: {
      type: 'Wait',
      name: 'Wait_1',
      identifier: 'Wait_1',
      spec: {
        duration: '10m'
      },
      when: {
        stageStatus: 'Success'
      }
    },
    isReadonly: false,
    isNewStep: false,
    stepsFactory: factory,
    hasStepGroupAncestor: false,
    viewType: StepCommandsViews.Pipeline,
    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
    isStepGroup: false,
    selectedStage: {
      stage: {
        name: 's1',
        identifier: 's1',
        description: '',
        type: 'Custom',
        spec: {
          execution: {
            steps: [
              {
                step: {
                  type: 'Wait',
                  name: 'Wait_1',
                  identifier: 'Wait_1',
                  spec: {
                    duration: '10m'
                  },
                  when: {
                    stageStatus: 'Success'
                  }
                }
              }
            ]
          }
        },
        tags: {}
      }
    },
    gitDetails: {},
    storeMetadata: {
      storeType: 'INLINE'
    },
    onUpdate: () => undefined,
    onChange: () => undefined
  }
}

const renderStepCommands = (props?: Partial<ComponentPropsWithRef<typeof StepCommandsWithRef>>): RenderResult => {
  return render(
    <TestWrapper>
      <StepCommandsWithRef {...getDefaultProps()} {...props} />
    </TestWrapper>
  )
}

describe('<StepCommands /> tests', () => {
  const waitStep = new WaitStep()
  const templateStep = new TemplateStep()
  const stepGroupStep = new StepGroupStep()

  beforeAll(() => {
    factory.registerStep(waitStep)
    factory.registerStep(templateStep)
    factory.registerStep(stepGroupStep)
  })
  afterAll(() => {
    factory.deregisterStep(waitStep.getType())
    factory.deregisterStep(templateStep.getType())
    factory.deregisterStep(stepGroupStep.getType())
  })

  test('should render and switch between step conf and advanced tabs', async () => {
    const { baseElement } = renderStepCommands()
    const stepTab = await screen.findByRole('tab', {
      name: 'stepConfiguration'
    })
    const stepTabPanel = baseElement.querySelector('#bp3-tab-panel_step-commands_StepConfiguration')
    const advancedTab = screen.getByRole('tab', {
      name: 'advancedTitle'
    })
    const advancedTabPanel = baseElement.querySelector('#bp3-tab-panel_step-commands_Advanced')

    await waitFor(() => expect(stepTabPanel).toHaveAttribute('aria-hidden', 'false'))
    expect(advancedTabPanel).toHaveAttribute('aria-hidden', 'true')

    userEvent.click(advancedTab)

    await waitFor(() => expect(stepTabPanel).toHaveAttribute('aria-hidden', 'true'))
    expect(advancedTabPanel).toHaveAttribute('aria-hidden', 'false')

    userEvent.click(stepTab)

    await waitFor(() => expect(stepTabPanel).toHaveAttribute('aria-hidden', 'false'))
    expect(advancedTabPanel).toHaveAttribute('aria-hidden', 'true')
  })

  test('should not switch to advanced tab if there is a duplicate step', async () => {
    renderStepCommands({ checkDuplicateStep: () => true })

    const advancedTab = screen.getByRole('tab', {
      name: 'advancedTitle'
    })

    userEvent.click(advancedTab)
    await waitFor(() => expect(advancedTab).toHaveAttribute('aria-selected', 'false'))
  })

  test('should not render tabs if withoutTabs is true', async () => {
    renderStepCommands({ withoutTabs: true })
    expect(
      screen.queryByRole('tab', {
        name: 'advancedTitle'
      })
    ).not.toBeInTheDocument()
  })

  test('should get values from both tabs', async () => {
    const ref = createRef<StepFormikRef>()
    renderStepCommands({ ref })

    const advancedTab = await screen.findByRole('tab', {
      name: 'advancedTitle'
    })
    userEvent.click(advancedTab)

    const conditionalExecutionSummary = await screen.findByTestId('conditionalExecution-summary')
    expect(conditionalExecutionSummary).toBeInTheDocument()
    conditionalExecutionSummary.click()

    const multiTypeButton = conditionalExecutionSummary.querySelector('button')
    expect(multiTypeButton).toBeInTheDocument()
    userEvent.click(multiTypeButton as HTMLButtonElement)

    const runtimeOption = await screen.findByText('Runtime input')
    userEvent.click(runtimeOption)

    const conditionalExecutionDetails = await screen.findByTestId('conditionalExecution-details')
    await within(conditionalExecutionDetails).findByDisplayValue('<+input>')

    expect(ref.current?.isDirty()).toBe(true)
    expect(ref.current?.getErrors()).toEqual({})
    expect(ref.current?.getValues()).toEqual({
      commandFlags: [],
      delegateSelectors: [],
      failureStrategies: [],
      identifier: 'Wait_1',
      name: 'Wait_1',
      policySets: [],
      spec: {
        duration: '10m'
      },
      type: 'Wait',
      when: '<+input>'
    })
  })

  test('should allow setting field errors through ref', async () => {
    const ref = createRef<StepFormikRef>()
    renderStepCommands({ ref })

    act(() => {
      ref.current?.setFieldError('identifier', 'identifier is not unique')
    })

    expect(await screen.findByText('identifier is not unique')).toBeInTheDocument()
  })

  test('should allow reset and submit through ref', async () => {
    const ref = createRef<StepFormikRef>()
    const onUpdate = jest.fn()
    renderStepCommands({ ref, onUpdate })

    const durationInput = await screen.findByDisplayValue('10m')
    expect(durationInput).toBeInTheDocument()
    userEvent.clear(durationInput)
    userEvent.type(durationInput, '3m')
    await waitFor(() => expect(durationInput).toHaveValue('3m'))

    act(() => {
      ref.current?.resetForm()
    })

    await waitFor(() => expect(durationInput).toHaveValue('10m'))

    act(() => {
      ref.current?.submitForm()
    })

    await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ spec: { duration: '10m' } })))
  })

  test('should render template steps and return expected values', async () => {
    const step = {
      name: 'wait template',
      identifier: 'wait_template',
      template: {
        templateRef: 'wait_template',
        versionLabel: 'v1',
        templateInputs: {
          type: 'Wait',
          spec: {
            duration: '<+input>'
          },
          when: '<+input>'
        }
      }
    }
    const ref = createRef<StepFormikRef>()

    renderStepCommands({
      ref,
      step,
      selectedStage: {
        stage: {
          name: 's1',
          identifier: 's1',
          description: '',
          type: 'Custom',
          spec: {
            execution: {
              steps: [
                {
                  step: step as any
                }
              ]
            }
          },
          tags: {}
        }
      }
    })
    expect(await screen.findByText(/wait template/)).toBeInTheDocument()
    expect(ref.current?.getValues()).toEqual({
      identifier: 'wait_template',
      name: 'wait template',
      template: {
        templateInputs: {
          spec: {
            duration: '<+input>'
          },
          type: 'Wait',
          when: '<+input>'
        },
        templateRef: 'wait_template',
        versionLabel: 'v1'
      }
    })
  })

  test('should render step groups and save them as templates', async () => {
    const stepGroup = {
      name: 'sg1',
      identifier: 'sg1',
      steps: [
        {
          step: {
            type: 'Wait',
            name: 'Wait_1',
            identifier: 'Wait_1',
            spec: {
              duration: '10m'
            }
          }
        }
      ],
      delegateSelectors: '<+input>'
    }
    const ref = createRef<StepFormikRef>()
    const onSaveAsTemplateClick = jest.fn()

    renderStepCommands({
      ref,
      isStepGroup: true,
      step: stepGroup as any,
      selectedStage: {
        stage: {
          name: 's1',
          identifier: 's1',
          description: '',
          type: 'Custom',
          spec: {
            execution: {
              steps: [
                {
                  stepGroup: stepGroup as any
                }
              ]
            }
          },
          tags: {}
        }
      },
      saveAsTemplateButtonProps: {
        buttonProps: {
          onClick: onSaveAsTemplateClick
        }
      },
      helpPanelVisible: true
    })

    expect(await screen.findByDisplayValue(stepGroup.name)).toBeInTheDocument()
    expect(ref.current?.getValues()).toEqual({
      commandFlags: [],
      delegateSelectors: '<+input>',
      failureStrategies: [],
      identifier: 'sg1',
      name: 'sg1',
      policySets: [],
      steps: [
        {
          step: {
            identifier: 'Wait_1',
            name: 'Wait_1',
            spec: {
              duration: '10m'
            },
            type: 'Wait'
          }
        }
      ],
      strategy: undefined,
      when: undefined
    })

    const saveAsTemplateButton = await screen.findByText('save as template')
    userEvent.click(saveAsTemplateButton)

    await waitFor(() =>
      expect(onSaveAsTemplateClick).toHaveBeenCalledWith({
        data: {
          delegateSelectors: '<+input>',
          identifier: 'sg1',
          name: 'sg1',
          steps: [
            {
              step: {
                identifier: 'Wait_1',
                name: 'Wait_1',
                spec: {
                  duration: '10m'
                },
                type: 'Wait'
              }
            }
          ],
          stageType: StageType.CUSTOM
        },
        type: StepType.StepGroup
      })
    )
  })
})
