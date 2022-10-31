/* eslint-disable jest/no-disabled-tests */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitForElementToBeRemoved, screen } from '@testing-library/react'
import userEvent, { TargetElement } from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { getOrganizationAggregateDTOListMockData } from '@projects-orgs/pages/organizations/__tests__/OrganizationsMockData'
import serviceData from '@common/modals/HarnessServiceModal/__tests__/serviceMock'
import FreezeWindowStudioPage from '../../pages/FreezeWindowStudioPage'

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

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Freeze Window Studio Config Section', () => {
  test('it should render Config section in create mode - PROJECT LEVEL', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeWindowStudioPage />
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
    expect(await screen.findByText('Add rule')).toBeInTheDocument()
    expect(document.getElementById('bp3-tab-panel_freezeWindowStudio_FREEZE_CONFIG')).toMatchSnapshot(
      'freeze config initial section rendering'
    )

    // Click on Add rule
    const addRule = getByText('Add rule')
    userEvent.click(addRule)
    expect(await screen.findByText('envType')).toBeInTheDocument()

    expect(document.getElementsByClassName('configFormContainer')[0]).toMatchSnapshot('Add Rule form snapshot')

    const inputEl = document.querySelector('input[name="entity[0].name"]')

    // Fields should be renderer
    expect(inputEl).toBeDefined()
    expect(getByText('services')).toBeDefined()
    expect(getByText('envType')).toBeDefined()

    userEvent.type(inputEl as TargetElement, 'Rule Number 1')

    const tickButton = container.querySelector('.tickButton')
    userEvent.click(tickButton as TargetElement)

    expect(await screen.findByText('Rule Number 1')).toBeInTheDocument()

    expect(document.getElementsByClassName('configFormContainer')[0]).toMatchSnapshot('View Rule - 1')

    // Add another Rule
    userEvent.click(getByText('Add rule'))
    expect(await screen.findByText('envType')).toBeInTheDocument()

    const inputEl2 = document.querySelector('input[name="entity[1].name"]')
    userEvent.type(inputEl2 as TargetElement, 'Rule Number 2')

    const tickButton2 = container.querySelector('.tickButton')
    userEvent.click(tickButton2 as TargetElement)

    expect(await screen.findByText('Rule Number 2')).toBeInTheDocument()
    expect(document.getElementsByClassName('configFormContainer')[1]).toBeInTheDocument()
  })

  test('it should render Config section in create mode - ACCOUNT LEVEL', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper
        path="/account/:accountId/settings/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ accountId, windowIdentifier: '-1' }}
      >
        <FreezeWindowStudioPage />
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
    expect(await screen.findByText('Add rule')).toBeInTheDocument()

    // Click on Add rule
    const addRule = getByText('Add rule')
    userEvent.click(addRule)
    expect(await screen.findByText('envType')).toBeInTheDocument()

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
    userEvent.click(tickButton as TargetElement)

    expect(await screen.findByText('Rule Number 1')).toBeInTheDocument()

    expect(getByText('freezeWindows.freezeStudio.allOrganizations')).toBeDefined()
    expect(getByText('rbac.scopeItems.allProjects')).toBeDefined()
    expect(getByText('common.allServices')).toBeDefined()
    expect(getByText('envType: common.allEnvironments')).toBeDefined()

    // Add another Rule
    userEvent.click(getByText('Add rule'))
    expect(await screen.findByText('envType')).toBeInTheDocument()

    const inputEl2 = document.querySelector('input[name="entity[1].name"]')
    await userEvent.type(inputEl2 as TargetElement, 'Rule Number 2')

    const tickButton2 = container.querySelector('.tickButton')
    userEvent.click(tickButton2 as TargetElement)

    expect(await screen.findByText('Rule Number 2')).toBeInTheDocument()

    const secondRule = getByTestId('config-view-mode_1')
    const deleteButton = secondRule.querySelector('[data-icon="main-trash"]')
    expect(deleteButton).toBeInTheDocument()
    userEvent.click(deleteButton as TargetElement)
  })

  test('it should render Config section Tabs onNext and onBack', async () => {
    const { container, getByRole } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeWindowStudioPage />
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
    const continueBtn = createNewForm.querySelector('button')
    userEvent.click(continueBtn as TargetElement)
    await waitForElementToBeRemoved(createNewForm)
    expect(createNewForm).not.toBeInTheDocument()
    const continueButton = getByRole('button', { name: 'continue' })
    expect(continueButton).toBeDefined()

    // Move to config Tab
    userEvent.click(continueButton)

    expect(await screen.findByText('freezeWindows.freezeStudio.freezeConfiguration')).toBeInTheDocument()
  })
})
