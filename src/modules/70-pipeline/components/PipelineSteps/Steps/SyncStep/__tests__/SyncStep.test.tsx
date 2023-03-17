/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  act,
  fireEvent,
  queryByAttribute,
  waitFor,
  getByText as getElementByText
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TestStepWidget, factory } from '../../__tests__/StepTestUtil'

import {
  getSyncStepDeploymentModeProps,
  getSyncStepEditModeProps,
  getSyncStepEditModePropsEmptySpec,
  getSyncStepEditModePropsWithRuntimeValues,
  getSyncStepInputVariableModeProps,
  mockApplicationResponse
} from './SyncStepTestHelper'
import { SyncStep } from '../SyncStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/gitops', () => ({
  useApplicationServiceListApps: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => mockApplicationResponse),
    cancel: jest.fn()
  }))
}))

const doConfigureOptionsTesting = async (cogModal: HTMLElement, fieldElement: HTMLInputElement) => {
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
  await waitFor(() => expect(fieldElement.value).toBe('<+input>.regex(<+input>.includes(/test/))'))
}

describe('Sync step tests', () => {
  beforeAll(() => {
    // eslint-disable-next-line
    // @ts-ignore
    // useGetJiraProjects.mockImplementation(() => mockProjectsResponse)
  })
  beforeEach(() => {
    factory.registerStep(new SyncStep())
  })

  test('Basic snapshot - inputset mode', async () => {
    const props = getSyncStepDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.GitOpsSync}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Basic snapshot - deploymentform mode', async () => {
    const props = getSyncStepDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.GitOpsSync}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('deploymentform mode - readonly', async () => {
    const props = getSyncStepDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData?.template}
        initialValues={props.initialValues}
        type={StepType.GitOpsSync}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ ...props.inputSetData, path: props.inputSetData?.path || '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('Basic snapshot - inputset mode but no runtime values', async () => {
    const props = getSyncStepDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.GitOpsSync}
        template={props.inputSetData?.template}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Basic functions - edit stage view validations', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getSyncStepEditModeProps()
    const { container, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.GitOpsSync}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    expect(container).toMatchSnapshot()

    // Submit with empty form
    await act(() => ref.current?.submitForm()!)
    expect(queryByText('pipelineSteps.stepNameRequired')).toBeTruthy()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'Gitsync step' } })

    fireEvent.click(getByText('pipeline.advancedConfiguration'))
    act(() => {
      fireEvent.click(queryByNameAttribute('spec.applicationsList')!)
    })
    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
      fireEvent.change(queryByNameAttribute('spec.applicationsList')!, { target: { value: 'a' } })
    })
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })

    await act(() => ref.current?.submitForm()!)
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()
  })

  test('Basic functions - edit stage view validations and submit form', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getSyncStepEditModeProps()
    const { container, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.GitOpsSync}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    // Submit with empty form
    await act(() => ref.current?.submitForm()!)
    expect(queryByText('pipelineSteps.stepNameRequired')).toBeTruthy()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'gitsync step' } })

    fireEvent.click(getByText('pipeline.advancedConfiguration'))

    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '10s' } })

    await act(() => ref.current?.submitForm()!)
    expect(container).toMatchSnapshot()
  })

  test('Basic functions - edit stage view validations with empty spec', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getSyncStepEditModePropsEmptySpec()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.GitOpsSync}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('Basic functions - edit stage view validations with runtime values', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getSyncStepEditModePropsWithRuntimeValues()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.GitOpsSync}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )
    expect(container).toMatchSnapshot()
    fireEvent.click(getByText('pipeline.advancedConfiguration'))

    const applicationListInput = queryByAttribute('name', container, 'spec.applicationsList') as HTMLInputElement
    expect(applicationListInput).not.toBeNull()
    const pruneInput = queryByAttribute('name', container, 'spec.prune') as HTMLInputElement
    expect(pruneInput).not.toBeNull()
    const dryRunListInput = queryByAttribute('name', container, 'spec.dryRun') as HTMLInputElement
    expect(dryRunListInput).not.toBeNull()
    const applyOnlyListInput = queryByAttribute('name', container, 'spec.applyOnly') as HTMLInputElement
    expect(applyOnlyListInput).not.toBeNull()
    const forceApplyListInput = queryByAttribute('name', container, 'spec.forceApply') as HTMLInputElement
    expect(forceApplyListInput).not.toBeNull()
    const skipSchemaValidationInput = queryByAttribute(
      'name',
      container,
      'spec.syncOptions.skipSchemaValidation'
    ) as HTMLInputElement
    expect(skipSchemaValidationInput).not.toBeNull()
    const autoCreateNamespaceInput = queryByAttribute(
      'name',
      container,
      'spec.syncOptions.autoCreateNamespace'
    ) as HTMLInputElement
    expect(autoCreateNamespaceInput).not.toBeNull()
    const pruneResourcesAtLastInput = queryByAttribute(
      'name',
      container,
      'spec.syncOptions.pruneResourcesAtLast'
    ) as HTMLInputElement
    expect(pruneResourcesAtLastInput).not.toBeNull()
    const applyOutOfSyncOnlyInput = queryByAttribute(
      'name',
      container,
      'spec.syncOptions.applyOutOfSyncOnly'
    ) as HTMLInputElement
    expect(applyOutOfSyncOnlyInput).not.toBeNull()
    const replaceResourcesInput = queryByAttribute(
      'name',
      container,
      'spec.syncOptions.replaceResources'
    ) as HTMLInputElement
    expect(replaceResourcesInput).not.toBeNull()
    const limitInput = queryByAttribute('name', container, 'spec.retryStrategy.limit') as HTMLInputElement
    expect(limitInput).not.toBeNull()
    const baseBackoffDurationInput = queryByAttribute(
      'name',
      container,
      'spec.retryStrategy.baseBackoffDuration'
    ) as HTMLInputElement
    expect(baseBackoffDurationInput).not.toBeNull()
    const maxBackoffDurationInput = queryByAttribute(
      'name',
      container,
      'spec.retryStrategy.maxBackoffDuration'
    ) as HTMLInputElement
    expect(maxBackoffDurationInput).not.toBeNull()
    const increaseBackoffByFactorInput = queryByAttribute(
      'name',
      container,
      'spec.retryStrategy.increaseBackoffByFactor'
    ) as HTMLInputElement
    expect(increaseBackoffByFactorInput).not.toBeNull()

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const cogApplicationList = document.getElementById('configureOptions_spec.applicationsList')
    userEvent.click(cogApplicationList!)
    await waitFor(() => expect(modals.length).toBe(1))
    const applicationLisyCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(applicationLisyCOGModal, applicationListInput)

    const cogPruneList = document.getElementById('configureOptions_spec.prune')
    userEvent.click(cogPruneList!)
    await waitFor(() => expect(modals.length).toBe(1))
    const pruneCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(pruneCOGModal, pruneInput)

    const cogDryRunList = document.getElementById('configureOptions_spec.dryRun')
    userEvent.click(cogDryRunList!)
    await waitFor(() => expect(modals.length).toBe(1))
    const dryRunCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(dryRunCOGModal, dryRunListInput)

    const cogApplyOnlyList = document.getElementById('configureOptions_spec.applyOnly')
    userEvent.click(cogApplyOnlyList!)
    await waitFor(() => expect(modals.length).toBe(1))
    const applyOnlyCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(applyOnlyCOGModal, applyOnlyListInput)

    const cogForceApplyList = document.getElementById('configureOptions_spec.forceApply')
    userEvent.click(cogForceApplyList!)
    await waitFor(() => expect(modals.length).toBe(1))
    const forceApplyCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(forceApplyCOGModal, forceApplyListInput)

    const cogSkipSchemaValidation = document.getElementById('configureOptions_spec.syncOptions.skipSchemaValidation')
    userEvent.click(cogSkipSchemaValidation!)
    await waitFor(() => expect(modals.length).toBe(1))
    const skipSchemaValidationCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(skipSchemaValidationCOGModal, skipSchemaValidationInput)

    const cogAutoCreateNamespace = document.getElementById('configureOptions_spec.syncOptions.autoCreateNamespace')
    userEvent.click(cogAutoCreateNamespace!)
    await waitFor(() => expect(modals.length).toBe(1))
    const autoCreateNamespaceCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(autoCreateNamespaceCOGModal, autoCreateNamespaceInput)

    const cogPruneResourcesAtLast = document.getElementById('configureOptions_spec.syncOptions.pruneResourcesAtLast')
    userEvent.click(cogPruneResourcesAtLast!)
    await waitFor(() => expect(modals.length).toBe(1))
    const pruneResourcesAtLastCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(pruneResourcesAtLastCOGModal, pruneResourcesAtLastInput)

    const cogApplyOutOfSyncOnly = document.getElementById('configureOptions_spec.syncOptions.applyOutOfSyncOnly')
    userEvent.click(cogApplyOutOfSyncOnly!)
    await waitFor(() => expect(modals.length).toBe(1))
    const applyOutOfSyncOnlyCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(applyOutOfSyncOnlyCOGModal, applyOutOfSyncOnlyInput)

    const cogReplaceResources = document.getElementById('configureOptions_spec.syncOptions.replaceResources')
    userEvent.click(cogReplaceResources!)
    await waitFor(() => expect(modals.length).toBe(1))
    const replaceResourcesCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(replaceResourcesCOGModal, replaceResourcesInput)

    const cogLimit = document.getElementById('configureOptions_spec.retryStrategy.limit')
    userEvent.click(cogLimit!)
    await waitFor(() => expect(modals.length).toBe(1))
    const limitCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(limitCOGModal, limitInput)

    const cogBaseBackoffDuration = document.getElementById('configureOptions_spec.retryStrategy.baseBackoffDuration')
    userEvent.click(cogBaseBackoffDuration!)
    await waitFor(() => expect(modals.length).toBe(1))
    const baseBackoffDurationCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(baseBackoffDurationCOGModal, baseBackoffDurationInput)

    const cogMaxBackoffDuration = document.getElementById('configureOptions_spec.retryStrategy.maxBackoffDuration')
    userEvent.click(cogMaxBackoffDuration!)
    await waitFor(() => expect(modals.length).toBe(1))
    const maxBackoffDurationCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(maxBackoffDurationCOGModal, maxBackoffDurationInput)

    const cogIncreaseBackoffByFactor = document.getElementById(
      'configureOptions_spec.retryStrategy.increaseBackoffByFactor'
    )
    userEvent.click(cogIncreaseBackoffByFactor!)
    await waitFor(() => expect(modals.length).toBe(1))
    const increaseBackoffByFactorCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(increaseBackoffByFactorCOGModal, increaseBackoffByFactorInput)
  })

  test('Basic snapshot - input variable view', () => {
    const props = getSyncStepInputVariableModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.GitOpsSync}
        stepViewType={StepViewType.InputVariable}
        customStepProps={props.customStepProps}
      />
    )

    expect(container).toMatchSnapshot('jira-approval-input variable view')
  })
})
