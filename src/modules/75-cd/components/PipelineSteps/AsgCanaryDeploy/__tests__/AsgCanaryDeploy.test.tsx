/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  render,
  waitFor,
  getByText as getElementByText,
  queryByAttribute,
  fireEvent
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { queryByNameAttribute } from '@common/utils/testUtils'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { InstanceTypes } from '@common/constants/InstanceTypes'
import { AsgCanaryDeployStep } from '../AsgCanaryDeployStep'

factory.registerStep(new AsgCanaryDeployStep())

const doConfigureOptionsTesting = async (cogModal: HTMLElement, fieldElement: HTMLElement) => {
  // Type regex and submit
  // check if field has desired value
  await waitFor(() => expect(getElementByText(cogModal, 'common.configureOptions.regex')).toBeInTheDocument())
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  userEvent.click(regexRadio)
  const regexTextArea = queryByAttribute('name', cogModal, 'regExValues')
  act(() => {
    fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
  })
  const cogSubmit = getElementByText(cogModal, 'submit')
  userEvent.click(cogSubmit)
  await waitFor(() => expect(fieldElement).toHaveDisplayValue('<+input>.regex(<+input>.includes(/test/))'))
}

const existingInitialValues = {
  identifier: 'Step_AsgCanaryDeploy',
  name: 'Step AsgCanaryDeploy',
  timeout: '10m',
  type: StepType.AsgCanaryDeploy
}
const onUpdate = jest.fn()
const onChange = jest.fn()

describe('Asg Canary Delete Step tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText, getByPlaceholderText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.AsgCanaryDeploy}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    userEvent.type(nameInput!, 'Step 1')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Step 1'))
    expect(getByText('Step_1')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '20m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('20m'))

    let instanceInput = getByPlaceholderText('instanceFieldOptions.instanceHolder') as HTMLInputElement
    userEvent.clear(instanceInput!)
    userEvent.type(instanceInput!, '20')
    await waitFor(() => expect(instanceInput).toHaveDisplayValue('20'))

    const fixedInputIcons = container.querySelectorAll('span[data-icon="fixed-input"]')
    expect(fixedInputIcons.length).toBe(2)

    let runtimeInputIcons = container.querySelectorAll('span[data-icon="runtime-input"]')
    expect(runtimeInputIcons.length).toBe(0)

    const instanceFixedInputBtn = fixedInputIcons[1]
    userEvent.click(instanceFixedInputBtn)
    await waitFor(() => expect(getByText('Runtime input')).toBeInTheDocument())

    userEvent.click(getByText('Runtime input')!)
    runtimeInputIcons = container.querySelectorAll('span[data-icon="runtime-input"]')
    await waitFor(() => expect(runtimeInputIcons.length).toBe(1))
    instanceInput = getByPlaceholderText(RUNTIME_INPUT_VALUE) as HTMLInputElement
    await waitFor(() => expect(instanceInput.value).toBe(RUNTIME_INPUT_VALUE))

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const cogInstanceSelection = document.getElementById('configureOptions_instanceFieldOptions.instances')
    userEvent.click(cogInstanceSelection!)
    await waitFor(() => expect(modals.length).toBe(1))
    const instanceSelectionOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(instanceSelectionOGModal, instanceInput)

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '20m',
        type: StepType.AsgCanaryDeploy,
        spec: {
          instanceSelection: {
            type: InstanceTypes.Instances,
            spec: {
              count: '<+input>.regex(<+input>.includes(/test/))'
            }
          }
        }
      })
    )
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText, getByPlaceholderText, queryByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Step_AsgCanaryDeploy',
          name: 'Step Asg Canary Delete',
          timeout: '',
          type: StepType.AsgCanaryDeploy
        }}
        template={{
          identifier: 'Step_AsgCanaryDeploy',
          name: 'Step Asg Canary Delete',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.AsgCanaryDeploy,
          spec: {
            instanceSelection: {
              type: 'Count',
              spec: {
                count: RUNTIME_INPUT_VALUE
              }
            }
          }
        }}
        type={StepType.AsgCanaryDeploy}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(onUpdate).not.toHaveBeenCalled()
    userEvent.type(timeoutInput!, '20m')

    const instanceInput = getByPlaceholderText('instanceFieldOptions.instanceHolder')
    userEvent.clear(instanceInput!)
    userEvent.type(instanceInput!, '-1')
    userEvent.click(submitBtn)

    await waitFor(() => expect(getByText('common.instanceValidation.minimumCountInstance')).toBeInTheDocument())

    userEvent.clear(instanceInput!)
    userEvent.type(instanceInput!, '20')

    await waitFor(() => expect(queryByText('common.instanceValidation.minimumCountInstance')).toBeFalsy())

    await waitFor(() => expect(instanceInput).toHaveDisplayValue('20'))

    userEvent.click(submitBtn)

    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_AsgCanaryDeploy',
      name: 'Step Asg Canary Delete',
      timeout: '20m',
      type: StepType.AsgCanaryDeploy,
      spec: {
        instanceSelection: {
          type: InstanceTypes.Instances,
          spec: {
            count: 20
          }
        }
      }
    })
  })

  test('Variables view renders fine', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.AsgCanaryDeploy}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'Step AsgCanaryDeploy': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.AsgCanaryDeploy.name',
                localName: 'step.AsgCanaryDeploy.name'
              }
            },
            '10m': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.AsgCanaryDeploy.timeout',
                localName: 'step.AsgCanaryDeploy.timeout'
              }
            }
          }
        }}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
