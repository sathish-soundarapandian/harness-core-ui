/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText, act, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { NewEditEnvironmentModal } from '../DeployEnvStep'
import { DeployEnvironment } from '../DeployEnvStep.stories'
import environments from './mock.json'
import inputSetEnvironments from './envMock'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentList: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: environments, refetch: jest.fn() })),
  useGetEnvironmentAccessList: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: inputSetEnvironments, refetch: jest.fn() })),
  useGetYamlSchema: jest.fn(() => ({ data: null })),
  useCreateEnvironmentV2: jest.fn().mockImplementation(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(obj => {
      environments.data.content.push({
        environment: {
          accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
          orgIdentifier: 'default',
          projectIdentifier: 'asdasd',
          identifier: obj.identifier,
          name: obj.name,
          description: null,
          color: '#0063F7',
          type: obj.type,
          deleted: false,
          tags: {},
          version: 1
        },
        createdAt: null,
        lastModifiedAt: null
      })
      return {
        status: 'SUCCESS'
      }
    })
  })),
  useUpsertEnvironmentV2: jest.fn().mockImplementation(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS'
      }
    })
  }))
}))

const onSave = jest.fn()
const onClose = jest.fn()
const props = {
  data: { name: '', identifier: '', description: '', tags: {} },
  onCreateOrUpdate: onSave,
  closeModal: onClose
}

describe('Test DeployEnvironment Step', () => {
  test('should render environment view and save', async () => {
    const { container, getByLabelText } = render(
      <DeployEnvironment type={StepType.DeployEnvironment} initialValues={{}} stepViewType={StepViewType.Edit} />
    )
    fireEvent.click(getByText(container, 'cd.pipelineSteps.environmentTab.plusNewEnvironment'))
    const dialog = findDialogContainer()
    expect(dialog).toMatchSnapshot()
    fillAtForm([
      {
        container: dialog!,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'New Project'
      }
    ])
    fireEvent.click(getByLabelText('production'))
    await act(async () => {
      fireEvent.click(getByText(dialog!, 'save'))
    })
    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "environmentRef: New_Project
      "
    `)
  })
  test('should render edit Environment view (environment ref), then update and then save', async () => {
    const { container, getByLabelText } = render(
      <DeployEnvironment
        type={StepType.DeployEnvironment}
        initialValues={{ environmentRef: 'gjhjghjhg' }}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText(container, 'editEnvironment'))
    const dialog = findDialogContainer()
    fillAtForm([
      {
        container: dialog!,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'New Environment'
      }
    ])
    fireEvent.click(getByText(dialog!, 'Change'))
    fireEvent.click(getByLabelText('cd.preProduction'))
    await act(async () => {
      fireEvent.click(getByText(dialog!, 'save'))
    })
    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "environmentRef: gjhjghjhg
      "
    `)
  })
  test('should render edit Environment view (environment), then update and then save', async () => {
    const { container, getByLabelText } = render(
      <DeployEnvironment
        type={StepType.DeployEnvironment}
        initialValues={{
          environment: {
            identifier: 'New_Project',
            name: 'New Project',
            description: 'test',
            type: 'PreProduction',
            tags: {
              tag1: '',
              tag2: 'asd'
            }
          }
        }}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText(container, 'editEnvironment'))
    const dialog = findDialogContainer()
    expect(dialog).toMatchSnapshot()
    fireEvent.click(getByText(dialog!, 'Change'))
    fireEvent.click(getByLabelText('production'))
    fillAtForm([
      {
        container: dialog!,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'Edit Environment'
      }
    ])
    await act(async () => {
      fireEvent.click(getByText(dialog!, 'save'))
    })
    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "environmentRef: New_Project
      "
    `)
  })

  test('should render edit Environment view (environment ref), then select other', async () => {
    const { container } = render(
      <DeployEnvironment
        type={StepType.DeployEnvironment}
        initialValues={{ environmentRef: 'New_Project' }}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(
      document.body
        .querySelector(`[name="environmentRef"] + [class*="bp3-input-action"]`)
        ?.querySelector('[data-icon="chevron-down"]')!
    )
    fireEvent.click(getByText(document.body, 'qa'))

    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "environmentRef: qa
      "
    `)
  })
  test('should render edit Environment view (environment), then select new', async () => {
    const { container } = render(
      <DeployEnvironment
        type={StepType.DeployEnvironment}
        initialValues={{
          environment: {
            identifier: 'pass_environment',
            name: 'Pass Environment',
            description: 'test',
            type: 'Production',
            tags: {
              tag1: '',
              tag2: 'asd'
            }
          }
        }}
        stepViewType={StepViewType.Edit}
      />
    )
    // Clear first
    await act(() => {
      fireEvent.click(
        document.body.querySelector(`[name="environmentRef"] + [class*="bp3-input-action"]`)?.childNodes?.[0]!
      )
    })

    fireEvent.click(
      document.body
        .querySelector(`[name="environmentRef"] + [class*="bp3-input-action"]`)
        ?.querySelector('[data-icon="chevron-down"]')!
    )
    fireEvent.click(getByText(document.body, 'qa'))

    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "environmentRef: qa
      "
    `)
  })

  test('should render inputSet View', async () => {
    const { container } = render(
      <DeployEnvironment
        type={StepType.DeployEnvironment}
        initialValues={{}}
        stepViewType={StepViewType.InputSet}
        path=""
        template={{
          environmentRef: RUNTIME_INPUT_VALUE
        }}
        allValues={{
          environmentRef: RUNTIME_INPUT_VALUE
        }}
      />
    )
    fireEvent.click(
      document.body
        .querySelector(`[name="environmentRef"] + [class*="bp3-input-action"]`)
        ?.querySelector('[data-icon="chevron-down"]')!
    )
    fireEvent.click(getByText(document.body, 'qa'))

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })
    expect(container.querySelector('.bp3-card > pre')?.innerHTML).toMatchInlineSnapshot(`
      "environmentRef: qa
      "
    `)
  })
})

describe('render modal ', () => {
  test('NewEditEnvironmentModal', () => {
    const { container } = render(
      <TestWrapper>
        <NewEditEnvironmentModal isEdit={false} isEnvironment={true} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    fireEvent.click(getByText(container, 'save'))
    fireEvent.click(getByText(container, 'YAML'))
    fireEvent.click(getByText(container, 'save'))
    expect(container).toMatchSnapshot()
  })

  test('should validate edit mode snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <NewEditEnvironmentModal
          {...props}
          isEdit={true}
          isEnvironment={false}
          data={{
            name: 'Environment 101',
            identifier: 'Environment_101',
            description: '',
            tags: { tag1: '', tag2: '' },
            type: 'Production'
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('input[value="Environment 101"]')).toBeTruthy())

    fillAtForm([
      {
        container,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'Environment 102'
      }
    ])

    await act(async () => {
      fireEvent.click(getByText(container, 'save'))
    })

    expect(container).toMatchSnapshot()
  })
})
