/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, findByText as findByTextGlobal, queryByAttribute } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import DeployServiceEntityWidget from '../DeployServiceEntityWidget'
import services from './services.json'
import metadata from './servicesMetadata.json'

const allowableTypes: AllowedTypesWithRunTime[] = [
  MultiTypeInputType.FIXED,
  MultiTypeInputType.EXPRESSION,
  MultiTypeInputType.RUNTIME
]

jest.mock('services/cd-ng', () => ({
  useGetServiceAccessList: jest.fn(() => ({
    data: { data: services },
    loading: false
  })),
  useGetServicesYamlAndRuntimeInputs: jest.fn().mockReturnValue({ mutate: jest.fn(() => ({ data: metadata })) }),
  useCreateServiceV2: jest.fn().mockReturnValue({
    mutate: jest
      .fn()
      .mockResolvedValue({ status: 'SUCCESS', data: { service: { identifier: 'svc_4', name: 'Service 4' } } })
  }),
  useUpdateServiceV2: jest.fn().mockReturnValue({ mutate: jest.fn().mockResolvedValue({ status: 'SUCCESS' }) }),
  useGetEntityYamlSchema: jest.fn().mockReturnValue({ data: { data: {} } })
}))

describe('DeployServiceEntityWidget - single service tests', () => {
  test('user can select a service', async () => {
    const onUpdate = jest.fn()
    const { container } = render(
      <TestWrapper>
        <DeployServiceEntityWidget
          initialValues={{}}
          allowableTypes={allowableTypes}
          readonly={false}
          stageIdentifier=""
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())

    expect(container).toMatchSnapshot()

    userEvent.click(container.querySelector('[data-icon="chevron-down"]')!)

    await waitFor(() => expect(document.body.querySelector('.bp3-menu')).toBeInTheDocument())

    const menu = document.body.querySelector<HTMLDivElement>('.bp3-menu')!

    await act(async () => {
      const svc1 = await findByTextGlobal(menu, 'Service 1')
      userEvent.click(svc1)
    })

    expect(onUpdate).toHaveBeenLastCalledWith({
      service: {
        serviceInputs: {
          serviceDefinition: {
            spec: {
              artifacts: {
                primary: {
                  spec: { connectorRef: '<+input>', imagePath: '<+input>', tag: '<+input>' },
                  type: 'DockerRegistry'
                }
              }
            },
            type: 'Kubernetes'
          }
        },
        serviceRef: 'svc_1'
      }
    })
    expect(container).toMatchSnapshot()
  })

  test('user can edit selected service', async () => {
    const onUpdate = jest.fn()
    const { container, findByTestId } = render(
      <TestWrapper defaultFeatureFlagValues={{ NG_SVC_ENV_REDESIGN: true }}>
        <DeployServiceEntityWidget
          initialValues={{ service: { serviceRef: 'svc_1' } }}
          allowableTypes={allowableTypes}
          readonly={false}
          stageIdentifier=""
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())

    const edit = await findByTestId('edit-service-svc_1')

    expect(container).toMatchSnapshot()

    act(() => {
      userEvent.click(edit)
    })

    const editModalTitle = await findByTextGlobal(document.body, 'editService')
    const dialog = editModalTitle.parentElement!.parentElement!

    expect(dialog).toMatchSnapshot()

    const name = queryByAttribute('name', dialog, 'name')!

    userEvent.type(name, 'Service 4')

    const save = await findByTextGlobal(dialog, 'save')

    await waitFor(() => expect(save.parentElement!.classList).not.toContain('bp3-disabled'))

    userEvent.click(save)

    await waitFor(() => expect(dialog).not.toBeInTheDocument())
  })

  test('user can delete selected service', async () => {
    const onUpdate = jest.fn()
    const { container, findByTestId } = render(
      <TestWrapper defaultFeatureFlagValues={{ NG_SVC_ENV_REDESIGN: true }}>
        <DeployServiceEntityWidget
          initialValues={{ service: { serviceRef: 'svc_1' } }}
          allowableTypes={allowableTypes}
          readonly={false}
          stageIdentifier=""
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())

    const delBtn = await findByTestId('delete-service-svc_1')

    expect(container).toMatchSnapshot()

    act(() => {
      userEvent.click(delBtn)
    })

    const confirmationModal1 = await findByTextGlobal(
      document.body,
      'cd.pipelineSteps.serviceTab.deleteServiceFromListTitleText'
    )

    const cancel = await findByTextGlobal(confirmationModal1.parentElement!.parentElement!, 'cancel')

    act(() => {
      userEvent.click(cancel)
    })

    act(() => {
      userEvent.click(delBtn)
    })

    const confirmationModal2 = await findByTextGlobal(
      document.body,
      'cd.pipelineSteps.serviceTab.deleteServiceFromListTitleText'
    )

    const apply = await findByTextGlobal(confirmationModal2.parentElement!.parentElement!, 'applyChanges')

    act(() => {
      userEvent.click(apply)
    })

    expect(onUpdate).toHaveBeenLastCalledWith({ service: { serviceInputs: undefined, serviceRef: '' } })

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())
  })

  test('newly created service is selected by default', async () => {
    const onUpdate = jest.fn()
    const { container, findByTestId } = render(
      <TestWrapper defaultFeatureFlagValues={{ NG_SVC_ENV_REDESIGN: true }}>
        <DeployServiceEntityWidget
          initialValues={{ service: { serviceRef: 'svc_1' } }}
          allowableTypes={allowableTypes}
          readonly={false}
          stageIdentifier=""
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())

    const add = await findByTestId('add-new-service')

    act(() => {
      userEvent.click(add)
    })

    const addDialogTitle = await findByTextGlobal(document.body, 'newService')

    const dialog = addDialogTitle.parentElement!.parentElement!

    const name = queryByAttribute('name', dialog, 'name')!

    userEvent.type(name, 'Service 4')

    const save = await findByTextGlobal(dialog, 'save')

    await waitFor(() => expect(save.parentElement!.classList).not.toContain('bp3-disabled'))

    userEvent.click(save)

    await waitFor(() => expect(dialog).not.toBeInTheDocument())

    expect(onUpdate).toHaveBeenLastCalledWith({ service: { serviceInputs: undefined, serviceRef: 'svc_4' } })
  })

  test('user can make service as runtime input', async () => {
    const onUpdate = jest.fn()
    const { container } = render(
      <TestWrapper defaultFeatureFlagValues={{ NG_SVC_ENV_REDESIGN: true }}>
        <DeployServiceEntityWidget
          initialValues={{}}
          allowableTypes={allowableTypes}
          readonly={false}
          stageIdentifier=""
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())

    const fixedIcon = container.querySelector('.MultiTypeInput--btn')!

    act(() => {
      userEvent.click(fixedIcon)
    })

    const runtimeMenu = await findByTextGlobal(document.body, 'Runtime input')

    act(() => {
      userEvent.click(runtimeMenu)
    })

    await waitFor(() => {
      expect(onUpdate).toHaveBeenLastCalledWith({ service: { serviceInputs: '<+input>', serviceRef: '<+input>' } })
    })
  })

  test('user can make service as expression', async () => {
    const onUpdate = jest.fn()
    const { container } = render(
      <TestWrapper defaultFeatureFlagValues={{ NG_SVC_ENV_REDESIGN: true }}>
        <DeployServiceEntityWidget
          initialValues={{}}
          allowableTypes={allowableTypes}
          readonly={false}
          stageIdentifier=""
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('.bp3-spinner')).not.toBeInTheDocument())

    const fixedIcon = container.querySelector('.MultiTypeInput--btn')!

    act(() => {
      userEvent.click(fixedIcon)
    })

    const expression = await findByTextGlobal(document.body, 'Expression')

    act(() => {
      userEvent.click(expression)
    })

    await waitFor(() => {
      expect(onUpdate).toHaveBeenLastCalledWith({ service: { serviceRef: '' } })
    })
  })
})
