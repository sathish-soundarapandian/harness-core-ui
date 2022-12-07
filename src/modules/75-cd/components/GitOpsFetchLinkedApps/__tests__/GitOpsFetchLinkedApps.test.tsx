/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { GitOpsFetchLinkedApps } from '../GitOpsFetchLinkedApps'

describe('Gitops Fetch Linked App Step', () => {
  beforeAll(() => {
    factory.registerStep(new GitOpsFetchLinkedApps())
  })

  test('it should render as new step - stepViewType Edit', () => {
    const { getByText, container } = render(
      <TestStepWidget initialValues={{}} type={StepType.GitOpsFetchLinkedApps} stepViewType={StepViewType.Edit} />
    )

    expect(getByText('name')).toBeDefined()
    expect(getByText('pipelineSteps.timeoutLabel')).toBeDefined()
    expect(container).toMatchSnapshot('Create Case')
  })

  test('render Runtime input', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()

    const initialValues = {
      identifier: 'My_Gitops_Fetch_Linked_Apps_Step',
      name: 'My Gitops Fetch Linked Apps Step',
      timeout: RUNTIME_INPUT_VALUE
    }

    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.GitOpsFetchLinkedApps}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )

    expect(container).toMatchSnapshot('Edit Case - with runtime inputs')
    await act(() => ref.current?.submitForm()!)

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'My_Gitops_Fetch_Linked_Apps_Step',
      name: 'My Gitops Fetch Linked Apps Step',
      timeout: '<+input>',
      type: 'GitOpsFetchLinkedApps'
    })
  })

  test('Edit mode works - No runtime', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const initialValues = {
      identifier: 'My_Gitops_Fetch_Linked_Apps_Step',
      name: 'My Gitops Fetch Linked Apps Step',
      timeout: '1d'
    }

    render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.GitOpsFetchLinkedApps}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'My_Gitops_Fetch_Linked_Apps_Step',
      name: 'My Gitops Fetch Linked Apps Step',
      timeout: '1d',
      type: 'GitOpsFetchLinkedApps'
    })
  })

  test('form produces correct data for fixed inputs', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.GitOpsFetchLinkedApps}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'Gitops Fetch Linked Apps Step' } })

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Gitops_Fetch_Linked_Apps_Step',
      name: 'Gitops Fetch Linked Apps Step',
      timeout: '10m',
      type: 'GitOpsFetchLinkedApps'
    })

    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })
    await act(() => ref.current?.submitForm()!)
    expect(getByText('validation.timeout10SecMinimum')).toBeTruthy()
  })
})

describe('Gitops Fetch Linked App Step - Input Set', () => {
  beforeAll(() => {
    factory.registerStep(new GitOpsFetchLinkedApps())
  })

  test('it should render input set', () => {
    const onUpdate = jest.fn()
    const initialValues = {
      identifier: 'Gitops_Fetch_Linked_Apps',
      name: 'Gitops Fetch Linked Apps',
      timeout: RUNTIME_INPUT_VALUE
    }
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={initialValues}
        type={StepType.GitOpsFetchLinkedApps}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        path="/abc"
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    expect(queryByNameAttribute('/abc.timeout')).not.toBeNull()
    expect(container).toMatchSnapshot('Input Set - view')
  })

  test('it should render empty input sets', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.GitOpsFetchLinkedApps}
        stepViewType={StepViewType.InputSet}
        template={{}}
        path=""
      />
    )

    expect(container).toMatchSnapshot('empty input sets')
  })
})

describe('Gitops Fetch Linked App Step - Input Set', () => {
  beforeAll(() => {
    factory.registerStep(new GitOpsFetchLinkedApps())
  })

  test('should render variable view', () => {
    const onUpdate = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.GitOpsFetchLinkedApps}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        customStepProps={{ metadataMap: {}, variablesData: { spec: {} } }}
      />
    )

    expect(container).toMatchSnapshot('variable view')
  })
})
