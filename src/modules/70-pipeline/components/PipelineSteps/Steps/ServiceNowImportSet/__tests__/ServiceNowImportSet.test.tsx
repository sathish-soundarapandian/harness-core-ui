/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import mockImport from 'framework/utils/mockImport'
import { ServiceNowImportSet } from '../ServiceNowImportSet'
import {
  getServiceNowImportSetDeploymentModeProps,
  getServiceNowImportSetDeploymentModeWithCustomFieldsProps,
  getServiceNowImportSetEditModeProps,
  getServiceNowImportSetEditModePropsWithRuntimeValues,
  getServiceNowImportSetEditModePropsWithValues,
  getServiceNowImportSetInputVariableModeProps,
  mockConnectorResponse,
  mockStagingTableLoadingReponse,
  mockStagingTableReponse
} from './testUtils'

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  get: jest.fn()
}))

jest.mock('services/cd-ng', () => ({
  useGetConnector: () => mockConnectorResponse,
  useGetServiceNowStagingTables: () => mockStagingTableReponse
}))

const queryByNameAttribute = (container: HTMLElement, name: string): HTMLElement | null =>
  queryByAttribute('name', container, name)

describe('ServiceNowImportSet Step Test', () => {
  beforeEach(() => {
    factory.registerStep(new ServiceNowImportSet())
  })
  test('Basic Snapshot -> Inputset Mode', async () => {
    const props = getServiceNowImportSetDeploymentModeProps()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.ServiceNowImportSet}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    userEvent.click(getByText('Submit'))
    await waitFor(() => queryByText('Errors'))
    expect(container).toMatchSnapshot('input set with errors')
  })

  test('Basic Snapshot -> Deploymentform Mode', async () => {
    const props = getServiceNowImportSetDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.ServiceNowImportSet}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
      />
    )

    expect(container).toMatchSnapshot('serviceNow-importSet-deploymentform')
  })

  test('DeploymentForm -> StagingTable Loading True', async () => {
    mockImport('services/cd-ng', {
      useGetServiceNowStagingTables: () => mockStagingTableLoadingReponse
    })
    const props = getServiceNowImportSetDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.ServiceNowImportSet}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ ...props.inputSetData, path: props.inputSetData?.path || '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot('serviceNow-importSet-deploymentform-loading-true')
  })

  test('DeploymentForm Readonly Mode', async () => {
    mockImport('services/cd-ng', {
      useGetServiceNowStagingTables: () => mockStagingTableReponse
    })
    const props = getServiceNowImportSetDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.ServiceNowImportSet}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ ...props.inputSetData, path: props.inputSetData?.path || '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot('serviceNow-importSet-deploymentform-readonly')
  })

  test('Basic snapshot -> Inputset Mode but no Runtime values', async () => {
    const props = getServiceNowImportSetDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.ServiceNowImportSet}
        template={{ spec: {} }}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    expect(container).toMatchSnapshot('serviceNow-importSet-inputset-noruntime')
  })

  test('Basic Snapshot -> Input Variable view', () => {
    const props = getServiceNowImportSetInputVariableModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.ServiceNowImportSet}
        template={{ spec: {} }}
        stepViewType={StepViewType.InputVariable}
        customStepProps={props.customStepProps}
      />
    )

    expect(container).toMatchSnapshot('serviceNow-importSet-input variable view')
  })

  test('Edit Stage -> StagingTable Loading True', async () => {
    mockImport('services/cd-ng', {
      useGetServiceNowStagingTables: () => mockStagingTableLoadingReponse
    })
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getServiceNowImportSetEditModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.ServiceNowImportSet}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )
    expect(container).toMatchSnapshot('edit-stage-readonly')
  })

  test('Edit Stage -> Readonly view', async () => {
    mockImport('services/cd-ng', {
      useGetServiceNowStagingTables: () => mockStagingTableReponse
    })
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getServiceNowImportSetEditModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.ServiceNowImportSet}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )
    expect(container).toMatchSnapshot('edit-stage-readonly')
  })

  test('Edit Stage -> Runtime Check', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getServiceNowImportSetEditModePropsWithRuntimeValues()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.ServiceNowImportSet}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )
    expect(container).toMatchSnapshot('edit-stage-runtimeValue')
  })

  test('Basic Functions -> Edit Stage View Validations', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getServiceNowImportSetEditModeProps()
    const { container, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.ServiceNowImportSet}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    // Empty form submission ->
    act(() => ref.current?.submitForm()!)
    await waitFor(() => expect(queryByText('pipelineSteps.stepNameRequired')).toBeDefined())

    fireEvent.change(queryByNameAttribute(container, 'name')!, { target: { value: 'serviceNow import step' } })

    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
    })
    fireEvent.change(queryByNameAttribute(container, 'timeout')!, { target: { value: '' } })

    act(() => ref.current?.submitForm()!)
    await waitFor(() => expect(queryByText('validation.timeout10SecMinimum')).toBeDefined())
    await waitFor(() => {
      expect(queryByText('pipeline.serviceNowImportSetStep.validations.stagingTableRequired')).toBeDefined()
    })

    await waitFor(() => expect(queryByText('pipeline.serviceNowImportSetStep.validations.jsonRequired')).toBeDefined())
    const jsonBody = container.querySelector('textarea[name="spec.importData.spec.jsonBody"]') as HTMLTextAreaElement
    fireEvent.change(jsonBody, { target: { value: '{val1: "321"; "val2": 654}' } })
    await waitFor(() => expect(queryByText('pipeline.serviceNowImportSetStep.validations.invalidJson')).toBeDefined())
  })

  test('Open a saved step -> Edit Stage view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = { ...getServiceNowImportSetEditModePropsWithValues() }
    const { container, queryByDisplayValue } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.ServiceNowImportSet}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    // Check if fields are populated
    expect(queryByDisplayValue('1d')).toBeDefined()
    expect(queryByDisplayValue('cid1')).toBeDefined()
    expect(queryByDisplayValue('test1')).toBeDefined()
    expect(queryByDisplayValue('{"val1": "123", "val2": 456}')).toBeDefined()

    fireEvent.change(queryByNameAttribute(container, 'name')!, { target: { value: 'serviceNow import step' } })
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: '{"val1": "321", "val2": 654}' } })

    await act(() => ref.current?.submitForm()!)
  })

  test('Minimum time cannot be less than 10s', () => {
    const response = new ServiceNowImportSet().validateInputSet({
      data: {
        name: 'Test1',
        identifier: 'Test1',
        timeout: '3s',
        type: 'ServiceNowImportSet',
        spec: {
          connectorRef: '',
          stagingTableName: '',
          importData: {
            type: 'Json',
            spec: {
              jsonBody: ''
            }
          }
        }
      },
      viewType: StepViewType.TriggerForm,
      template: {
        name: '',
        identifier: '',
        type: 'ServiceNowImportSet',
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          stagingTableName: RUNTIME_INPUT_VALUE,
          importData: {
            type: 'Json',
            spec: {
              jsonBody: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
  })

  test('Deploymentform with custom fields as runtime', async () => {
    const props = getServiceNowImportSetDeploymentModeWithCustomFieldsProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.ServiceNowImportSet}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ ...props.inputSetData, path: props.inputSetData?.path || '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot('serviceNow-importSet-deploymentform-customfields')
  })
})
