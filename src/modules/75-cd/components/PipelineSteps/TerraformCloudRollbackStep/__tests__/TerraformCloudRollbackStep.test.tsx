/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { doConfigureOptionsTesting, queryByNameAttribute } from '@common/utils/testUtils'
import { TerraformCloudRollback } from '../TerraformCloudRollback'

factory.registerStep(new TerraformCloudRollback())

const onUpdate = jest.fn()
const onChange = jest.fn()

const ref = React.createRef<StepFormikRef<unknown>>()

const emptyInitialValues = {
  name: 'TerraformCloudRollback_step1',
  identifier: 'TerraformCloudRollback_step1',
  timeout: '',
  spec: {
    runMessage: '',
    provisionerIdentifier: '',
    discardPendingRuns: false,
    overridePolicies: false
  }
}

const initialValues = {
  name: 'TerraformCloudRollback_step1',
  identifier: 'TerraformCloudRollback_step1',
  timeout: '10m',
  spec: {
    runMessage: 'test message',
    provisionerIdentifier: 'povId',
    discardPendingRuns: false,
    overridePolicies: false
  }
}

const runtimeValues = {
  name: 'TerraformCloudRollback_step1',
  identifier: 'TerraformCloudRollback_step1',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    runMessage: RUNTIME_INPUT_VALUE,
    provisionerIdentifier: RUNTIME_INPUT_VALUE,
    discardPendingRuns: RUNTIME_INPUT_VALUE,
    overridePolicies: RUNTIME_INPUT_VALUE
  }
}

describe('Test Terraform Cloud Rollback Step', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })

  test('Render edit view as edit step', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={emptyInitialValues}
        type={StepType.TerraformCloudRollback}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    await act(async () => {
      fireEvent.change(queryByNameAttribute('name', container)!, { target: { value: 'Step1' } })
      fireEvent.change(queryByNameAttribute('timeout', container)!, { target: { value: '20m' } })
      await userEvent.type(queryByNameAttribute('spec.runMessage', container)!, 'test message')
      fireEvent.change(queryByNameAttribute('spec.provisionerIdentifier', container)!, {
        target: { value: 'pId2' }
      })
    })

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step1',
      name: 'Step1',
      type: StepType.TerraformCloudRollback,
      timeout: '20m',
      spec: {
        runMessage: 'test message',
        provisionerIdentifier: 'pId2',
        discardPendingRuns: false,
        overridePolicies: false
      }
    })
  })

  test('edit view validation test', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={emptyInitialValues}
        type={StepType.TerraformCloudRollback}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm()!)

    await waitFor(() => {
      expect(container.querySelectorAll('.FormError--error').length).toEqual(2)
      expect(getByText('validation.timeout10SecMinimum')).toBeTruthy()
      expect(getByText('common.validation.provisionerIdentifierIsRequired')).toBeTruthy()
    })

    // validate invalid value error for provisioner identifier
    const provIdInput = queryByNameAttribute('spec.provisionerIdentifier', container)!
    fireEvent.input(provIdInput!, {
      target: { value: '$abc' }
    })

    await act(() => ref.current?.submitForm()!)
    await waitFor(() => {
      expect(getByText('common.validation.provisionerIdentifierPatternIsNotValid')).toBeTruthy()
    })
  })

  test('configure values should work fine when all values are runtime inputs', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={runtimeValues}
        type={StepType.TerraformCloudRollback}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )
    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    //run Message
    const messageInput = queryByNameAttribute('spec.runMessage', container) as HTMLInputElement
    const cogMessage = document.getElementById('configureOptions_spec.runMessage')
    await userEvent.click(cogMessage!)
    await waitFor(() => expect(modals.length).toBe(1))
    const terraformCOGMessage = modals[0] as HTMLElement
    await doConfigureOptionsTesting(terraformCOGMessage, messageInput)

    //provisionerIdentifier
    const provisionerInput = queryByNameAttribute('spec.provisionerIdentifier', container) as HTMLInputElement
    const cogProvisioner = document.getElementById('configureOptions_spec.provisionerIdentifier')
    await userEvent.click(cogProvisioner!)
    await waitFor(() => expect(modals.length).toBe(1))
    const terraformCOGProvisioner = modals[0] as HTMLElement
    await doConfigureOptionsTesting(terraformCOGProvisioner, provisionerInput)

    // submit form and verify
    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        name: 'TerraformCloudRollback_step1',
        identifier: 'TerraformCloudRollback_step1',
        timeout: '<+input>',
        type: StepType.TerraformCloudRollback,
        spec: {
          runMessage: '<+input>.regex(<+input>.includes(/test/))',
          provisionerIdentifier: '<+input>.regex(<+input>.includes(/test/))',
          discardPendingRuns: '<+input>',
          overridePolicies: '<+input>'
        }
      })
    )
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={emptyInitialValues}
        template={runtimeValues}
        type={StepType.TerraformCloudRollback}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        inputSetData={{ path: '', readonly: true }}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    await userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    await userEvent.type(timeoutInput!, '20m')

    await userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      name: 'TerraformCloudRollback_step1',
      identifier: 'TerraformCloudRollback_step1',
      timeout: '20m',
      spec: {
        runMessage: '',
        provisionerIdentifier: '',
        discardPendingRuns: false,
        overridePolicies: false
      }
    })
  })

  test('Variables view renders fine', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.TerraformCloudRollback}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: initialValues,
          metadataMap: {
            'step TerraformCloudRun': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.name',
                localName: 'execution.steps.TerraformCloudRun_1.name'
              }
            },
            'step timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.timeout',
                localName: 'execution.steps.TerraformCloudRun_1.timeout'
              }
            },
            'step runMessage': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.spec.runMessage',
                localName: 'execution.steps.TerraformCloudRun_1.spec.runMessage'
              }
            },
            'step provId': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.spec.provisionerIdentifier',
                localName: 'execution.steps.TerraformCloudRun_1.spec.provisionerIdentifier'
              }
            },
            'step discardPendingRuns': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformCloudRun_1.spec.discardPendingRuns',
                localName: 'execution.steps.TerraformCloudRun_1.spec.discardPendingRuns'
              }
            }
          }
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
