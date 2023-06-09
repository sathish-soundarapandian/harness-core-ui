/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createRef } from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import type { StringsMap } from 'stringTypes'
import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { awsConnectorListResponse } from '@connectors/components/ConnectorReferenceField/__tests__/mocks'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { StepGroupElementConfig } from 'services/pipeline-ng'
import { StepGroupStep } from '../StepGroupStep'
import { StepGroupStepEditRef } from '../StepGroupStepEdit'
import { containerStepGroupInitialValues, containerStepGroupTemplate } from './helper'
import { awsRegions } from './mocks'
import type { K8sDirectInfraStepGroupElementConfig } from '../StepGroupUtil'

const fetchConnector = jest.fn().mockReturnValue({ data: awsConnectorListResponse.data?.content?.[1] })
jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(awsConnectorListResponse)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: awsConnectorListResponse.data?.content?.[1] }, refetch: fetchConnector, loading: false }
  })
}))

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: awsRegions, loading: false }
  })
}))

const getString = (str: keyof StringsMap, vars?: Record<string, any> | undefined) => {
  return vars?.stringToAppend ? `${str}_${vars.stringToAppend}` : str
}

describe('StepGroupStep tests', () => {
  const stepGroupStep = new StepGroupStep()
  beforeAll(() => {
    factory.registerStep(stepGroupStep)
  })
  afterAll(() => {
    factory.deregisterStep(stepGroupStep.getType())
  })

  test('renders as expected in edit view when stepGroupInfra is NOT present', async () => {
    render(
      <TestStepWidget
        type={StepType.StepGroup}
        initialValues={{
          name: 'Step Group 1',
          identifier: 'Step Group 1 step_group_1',
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
          ]
        }}
        isNewStep={false}
        stepViewType={StepViewType.Edit}
      />
    )

    expect(await screen.findByDisplayValue('Step Group 1')).toBeInTheDocument()
  })

  test('should validate name and call onUpdate with expected values when stepGroupInfra is NOT present', async () => {
    const onUpdate = jest.fn()
    const ref = createRef<StepFormikRef<StepGroupElementConfig>>()
    const { baseElement } = render(
      <TestWrapper>
        <StepGroupStepEditRef
          ref={ref}
          onUpdate={onUpdate}
          initialValues={{
            steps: [],
            identifier: '',
            name: ''
          }}
          stepViewType={StepViewType.Edit}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(baseElement.querySelector('[name="name"]')).toHaveValue(''))
    await act(async () => ref.current?.submitForm())
    expect(await screen.findByText('pipelineSteps.stepNameRequired')).toBeInTheDocument()

    userEvent.type(baseElement.querySelector('[name="name"]') as HTMLInputElement, 'stepgroup')

    expect(await screen.findByDisplayValue('stepgroup')).toBeInTheDocument()
    await act(async () => ref.current?.submitForm())
    await waitFor(() =>
      expect(onUpdate).toBeCalledWith({
        identifier: 'stepgroup',
        name: 'stepgroup',
        steps: []
      })
    )
  })

  test('renders as expected in EDIT view when stepGroupInfra IS present', async () => {
    const onUpdate = jest.fn()
    const ref = createRef<StepFormikRef<StepGroupElementConfig>>()

    const { container } = render(
      <TestStepWidget
        type={StepType.StepGroup}
        initialValues={containerStepGroupInitialValues}
        isNewStep={false}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
        testWrapperProps={{
          defaultFeatureFlagValues: {
            CDS_CONTAINER_STEP_GROUP: true
          }
        }}
      />
    )

    const queryByName = (nameValue: string): HTMLElement | null => queryByNameAttribute(nameValue, container)

    // Name
    const nameInput = queryByName('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('Container Step Group 1')

    // Enable container based execution switch should be ON
    const enableContainerBasedExecutionSwitch = await screen.findByText('pipeline.enableContainerBasedExecution')
    expect(enableContainerBasedExecutionSwitch).toBeInTheDocument()
    const enableContainerBasedExecutionSwitchCheckboxInput = within(enableContainerBasedExecutionSwitch).getByRole(
      'checkbox'
    )
    expect(enableContainerBasedExecutionSwitchCheckboxInput).toBeInTheDocument()
    await waitFor(() => expect(enableContainerBasedExecutionSwitchCheckboxInput).toBeChecked())

    // Kubernetes Cluster
    const connectorRefInput = screen.getByText('Aws Connector 2')
    expect(connectorRefInput).toBeInTheDocument()

    // Namespace
    const namespaceInput = queryByName('namespace') as HTMLInputElement
    expect(namespaceInput).toBeInTheDocument()
    expect(namespaceInput.value).toBe('default')

    // Open Optional Configurations
    const optionalConfigAccordionTitle = screen.getByText('common.optionalConfig')
    expect(optionalConfigAccordionTitle).toBeInTheDocument()

    await act(async () => ref.current?.submitForm())
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
  })

  test('renders as expected in RUNTIME view when stepGroupInfra IS present', async () => {
    const { container } = render(
      <TestStepWidget
        type={StepType.StepGroup}
        initialValues={containerStepGroupInitialValues}
        template={containerStepGroupTemplate}
        isNewStep={false}
        stepViewType={StepViewType.InputSet}
        testWrapperProps={{
          defaultFeatureFlagValues: {
            CDS_CONTAINER_STEP_GROUP: true
          }
        }}
      />
    )

    const queryByName = (nameValue: string): HTMLElement | null => queryByNameAttribute(nameValue, container)

    // Kubernetes Cluster & Override Image Connector
    const connectorRefInputs = screen.getAllByText('Aws Connector 2')
    expect(connectorRefInputs).toHaveLength(2)

    // Namespace
    const namespaceInput = queryByName('stepGroupInfra.spec.namespace') as HTMLInputElement
    expect(namespaceInput).toBeInTheDocument()
    expect(namespaceInput.value).toBe('default')
  })

  test('errors should be displayed for required container step group fields in runtime view', async () => {
    const initialValues: K8sDirectInfraStepGroupElementConfig = {
      name: 'Container Step Group 1',
      identifier: 'container_step_group_1',
      sharedPaths: ['sp1', 'sp2'] as any,
      stepGroupInfra: {
        type: 'KubernetesDirect',
        spec: {
          connectorRef: '',
          namespace: ''
        }
      }
    }

    const step = new StepGroupStep() as any
    step.renderStep({
      initialValues,
      inputSetData: {
        template: containerStepGroupTemplate
      }
    })
    const errors = await step.validateInputSet({
      data: initialValues,
      template: containerStepGroupTemplate,
      getString,
      viewType: StepViewType.DeploymentForm
    })

    expect(errors.stepGroupInfra.spec.connectorRef).toBe('common.validation.fieldIsRequired')
    expect(errors.stepGroupInfra.spec.namespace).toBe('common.validation.fieldIsRequired')
  })

  test('errors should be displayed for required container step group fields in trigger view', async () => {
    const initialValues: K8sDirectInfraStepGroupElementConfig = {
      name: 'Container Step Group 1',
      identifier: 'container_step_group_1',
      sharedPaths: ['sp1', 'sp2'] as any,
      stepGroupInfra: {
        type: 'KubernetesDirect',
        spec: {
          connectorRef: '',
          namespace: ''
        }
      }
    }

    const step = new StepGroupStep() as any
    step.renderStep({
      initialValues,
      inputSetData: {
        template: containerStepGroupTemplate
      }
    })
    const errors = await step.validateInputSet({
      data: initialValues,
      template: containerStepGroupTemplate,
      getString,
      viewType: StepViewType.TriggerForm
    })

    expect(errors.stepGroupInfra.spec.connectorRef).toBe('common.validation.fieldIsRequired')
    expect(errors.stepGroupInfra.spec.namespace).toBe('common.validation.fieldIsRequired')
  })

  test('should not display container step group related fields when Enable container based execution is turned OFF', async () => {
    const onUpdate = jest.fn()
    const ref = createRef<StepFormikRef<StepGroupElementConfig>>()

    const { container } = render(
      <TestStepWidget
        type={StepType.StepGroup}
        initialValues={containerStepGroupInitialValues}
        isNewStep={false}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
        testWrapperProps={{
          defaultFeatureFlagValues: {
            CDS_CONTAINER_STEP_GROUP: true
          }
        }}
      />
    )

    const queryByName = (nameValue: string): HTMLElement | null => queryByNameAttribute(nameValue, container)

    // Name
    const nameInput = queryByName('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('Container Step Group 1')

    // Enable container based execution switch should be ON
    const enableContainerBasedExecutionSwitch = await screen.findByText('pipeline.enableContainerBasedExecution')
    expect(enableContainerBasedExecutionSwitch).toBeInTheDocument()
    const enableContainerBasedExecutionSwitchCheckboxInput = within(enableContainerBasedExecutionSwitch).getByRole(
      'checkbox'
    )
    expect(enableContainerBasedExecutionSwitchCheckboxInput).toBeInTheDocument()
    await waitFor(() => expect(enableContainerBasedExecutionSwitchCheckboxInput).toBeChecked())

    // Kubernetes Cluster
    const connectorRefInput = screen.queryByText('Aws Connector 2')
    expect(connectorRefInput).toBeInTheDocument()

    // Namespace
    const namespaceInput = queryByName('namespace') as HTMLInputElement
    expect(namespaceInput).toBeInTheDocument()
    expect(namespaceInput.value).toBe('default')

    fireEvent.click(enableContainerBasedExecutionSwitch)

    await waitFor(() => expect(connectorRefInput).not.toBeInTheDocument())
    expect(namespaceInput).not.toBeInTheDocument()

    await act(async () => ref.current?.submitForm())
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'container_step_group_1',
        name: 'Container Step Group 1',
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
        ]
      })
    )
  })

  test('should make relevant fields as Runtime input while submitting container based step group fields are runtime inputs', async () => {
    const onUpdate = jest.fn()
    const ref = createRef<StepFormikRef<StepGroupElementConfig>>()

    const { container } = render(
      <TestStepWidget
        type={StepType.StepGroup}
        initialValues={containerStepGroupTemplate}
        isNewStep={false}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
        testWrapperProps={{
          defaultFeatureFlagValues: {
            CDS_CONTAINER_STEP_GROUP: true
          }
        }}
      />
    )

    const queryByName = (nameValue: string): HTMLElement | null => queryByNameAttribute(nameValue, container)

    // Name
    const nameInput = queryByName('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('Container Step Group 1')

    // Enable container based execution switch should be ON
    const enableContainerBasedExecutionSwitch = await screen.findByText('pipeline.enableContainerBasedExecution')
    expect(enableContainerBasedExecutionSwitch).toBeInTheDocument()
    const enableContainerBasedExecutionSwitchCheckboxInput = within(enableContainerBasedExecutionSwitch).getByRole(
      'checkbox'
    )
    expect(enableContainerBasedExecutionSwitchCheckboxInput).toBeInTheDocument()
    await waitFor(() => expect(enableContainerBasedExecutionSwitchCheckboxInput).toBeChecked())

    // Namespace
    const namespaceInput = queryByName('namespace') as HTMLInputElement
    expect(namespaceInput).toBeInTheDocument()
    expect(namespaceInput.value).toBe(RUNTIME_INPUT_VALUE)

    await act(async () => ref.current?.submitForm())
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
  })
})
