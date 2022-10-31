/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, act, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent, { TargetElement } from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { getOrganizationAggregateDTOListMockData } from '@projects-orgs/pages/organizations/__tests__/OrganizationsMockData'
import serviceData from '@common/modals/HarnessServiceModal/__tests__/serviceMock'
import { FreezeStudioWrapper } from '@freeze-windows/components/FreezeStudioWrapper'

export const accountId = 'accountId'
export const projectIdentifier = 'project1'
export const orgIdentifier = 'default'

jest.mock('services/cd-ng', () => ({
  useGetOrganizationAggregateDTOList: jest.fn().mockImplementation(() => {
    return { ...getOrganizationAggregateDTOListMockData, refetch: jest.fn(), error: null }
  }),
  useGetFreeze: jest.fn().mockImplementation(() => ({})),
  useCreateFreeze: jest.fn().mockImplementation(() => ({})),
  useUpdateFreeze: jest.fn().mockImplementation(() => ({})),
  useGetProjectList: jest.fn().mockImplementation(() => ({})),
  useGetServiceList: jest.fn().mockImplementation(() => ({ loading: false, data: serviceData, refetch: jest.fn() }))
}))

describe('Freeze Window Studio Config Section', () => {
  test('it should render Config section in create mode - PROJECT LEVEL', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeStudioWrapper />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummyname'
      }
    ])

    const configTab = getByText('freezeWindows.freezeStudio.freezeConfiguration')
    expect(configTab).toBeDefined()
    userEvent.click(configTab)
    await waitFor(() => {
      expect(getByText('Add rule')).toBeInTheDocument()
    })
    expect(document.getElementById('bp3-tab-panel_freezeWindowStudio_FREEZE_CONFIG')).toMatchSnapshot(
      'freeze config initial section rendering'
    )

    // Click on Add rule
    const addRule = getByText('Add rule')
    userEvent.click(addRule)
    await waitFor(() => {
      expect(getByText('envType')).toBeInTheDocument()
    })
    expect(document.getElementsByClassName('configFormContainer')[0]).toMatchSnapshot('Add Rule form snapshot')

    const inputEl = document.querySelector('input[name="entity[0].name"]')

    // Fields should be renderer
    expect(inputEl).toBeDefined()
    expect(getByText('services')).toBeDefined()
    expect(getByText('envType')).toBeDefined()

    userEvent.type(inputEl as TargetElement, 'Rule Number 1')

    const tickButton = container.querySelector('.tickButton')
    act(async () => {
      await userEvent.click(tickButton as TargetElement)
    })

    await waitFor(() => {
      expect(getByText('Rule Number 1')).toBeInTheDocument()
    })

    expect(document.getElementsByClassName('configFormContainer')[0]).toMatchSnapshot('View Rule - 1')

    // Add another Rule
    userEvent.click(getByText('Add rule'))
    await waitFor(() => {
      expect(getByText('envType')).toBeInTheDocument()
    })

    const inputEl2 = document.querySelector('input[name="entity[1].name"]')
    userEvent.type(inputEl2 as TargetElement, 'Rule Number 2')

    const tickButton2 = container.querySelector('.tickButton')
    act(async () => {
      await userEvent.click(tickButton2 as TargetElement)
    })

    await waitFor(() => {
      expect(getByText('Rule Number 2')).toBeInTheDocument()
    })

    expect(document.getElementsByClassName('configFormContainer')[1]).toBeInTheDocument()
  })

  test('it should render Config section in create mode - ACCOUNT LEVEL', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper
        path="/account/:accountId/settings/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ accountId, windowIdentifier: '-1' }}
      >
        <FreezeStudioWrapper />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'account level freeze'
      }
    ])

    const configTab = getByText('freezeWindows.freezeStudio.freezeConfiguration')
    expect(configTab).toBeDefined()
    userEvent.click(configTab)
    await waitFor(() => {
      expect(getByText('Add rule')).toBeInTheDocument()
    })

    // Click on Add rule
    const addRule = getByText('Add rule')
    userEvent.click(addRule)
    await waitFor(() => {
      expect(getByText('envType')).toBeInTheDocument()
    })

    expect(document.getElementsByClassName('configFormContainer')[0]).toMatchSnapshot(
      'Add Rule form snapshot - Account Level'
    )

    const inputEl = document.querySelector('input[name="entity[0].name"]')

    // Fields should be renderer
    expect(inputEl).toBeDefined()
    expect(getByText('orgLabel')).toBeDefined()
    expect(getByText('freezeWindows.freezeStudio.excludeOrgs')).toBeDefined()
    expect(getByText('projectsText')).toBeDefined()
    expect(getByText('freezeWindows.freezeStudio.excludeProjects')).toBeDefined()
    expect(getByText('services')).toBeDefined()
    expect(getByText('envType')).toBeDefined()

    userEvent.type(inputEl as TargetElement, 'Rule Number 1')

    const tickButton = container.querySelector('.tickButton')

    act(async () => {
      await userEvent.click(tickButton as TargetElement)
    })

    await waitFor(() => {
      expect(getByText('Rule Number 1')).toBeInTheDocument()
    })

    expect(getByText('freezeWindows.freezeStudio.allOrganizations')).toBeDefined()
    expect(getByText('rbac.scopeItems.allProjects')).toBeDefined()
    expect(getByText('common.allServices')).toBeDefined()
    expect(getByText('envType: common.allEnvironments')).toBeDefined()

    // Add another Rule
    userEvent.click(getByText('Add rule'))
    await waitFor(() => {
      expect(getByText('envType')).toBeInTheDocument()
    })

    const inputEl2 = document.querySelector('input[name="entity[1].name"]')
    await userEvent.type(inputEl2 as TargetElement, 'Rule Number 2')

    const tickButton2 = container.querySelector('.tickButton')
    act(async () => {
      await userEvent.click(tickButton2 as TargetElement)
    })

    await waitFor(() => {
      expect(getByText('Rule Number 2')).toBeInTheDocument()
    })

    const secondRule = getByTestId('config-view-mode_1')
    const deleteButton = secondRule.getElementsByClassName('bp3-icon-trash')[0]
    act(async () => {
      await userEvent.click(deleteButton as TargetElement)
    })
  })

  test('it should render Config section Tabs onNext and onBack', async () => {
    const { container, getByText, getByRole } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeStudioWrapper />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'dummyname'
      }
    ])

    const createNewForm = document.getElementsByClassName('createNewFreezeForm')[0]
    await waitFor(async () => {
      const continueBtn = createNewForm.querySelector('button')
      await userEvent.click(continueBtn as TargetElement)
      await waitForElementToBeRemoved(createNewForm).then(() => {
        expect(createNewForm).not.toBeInTheDocument()
      })
    })

    const continueButton = getByRole('button', { name: 'continue' })
    expect(continueButton).toBeDefined()

    // Move to config Tab
    userEvent.click(continueButton)
    await waitFor(() => {
      expect(getByText('freezeWindows.freezeStudio.freezeConfiguration')).toBeInTheDocument()
    })
  })
})
