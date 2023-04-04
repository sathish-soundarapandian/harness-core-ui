/* eslint-disable jest/no-disabled-tests */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitForElementToBeRemoved, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent, { TargetElement } from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { getOrganizationAggregateDTOListMockData } from '@projects-orgs/pages/organizations/__tests__/OrganizationsMockData'
import serviceData from '@common/modals/HarnessServiceModal/__tests__/serviceMock'
import { FreezeWindowContext } from '@freeze-windows/context/FreezeWindowContext'
import FreezeWindowStudioPage from '../../pages/FreezeWindowStudioPage'
import { FreezeWindowScheduleSection } from '../FreezeWindowScheduleSection/FreezeWindowScheduleSection'
import { defaultContext } from './helper'

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
  useGetProjectList: jest.fn().mockImplementation(() => ({ loading: false, data: [], refetch: jest.fn() })),
  useGetServiceList: jest.fn().mockImplementation(() => ({ loading: false, data: serviceData, refetch: jest.fn() })),
  useGetEnvironmentListV2: jest.fn().mockImplementation(() => ({ loading: false, data: [], refetch: jest.fn() }))
}))

describe('Freeze Window Studio Config Section', () => {
  test('it should render Config section in create mode - PROJECT LEVEL', async () => {
    const { container, getByText, getAllByText } = render(
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

    const configTab = getByText('common.coverage')
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
    expect(getAllByText('services')).toBeDefined()
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
    const { container, getByText, getByTestId, getAllByText } = render(
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

    const configTab = getByText('common.coverage')
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
    expect(getAllByText('services')).toBeDefined()
    expect(getByText('envType')).toBeDefined()

    userEvent.type(inputEl as TargetElement, 'Rule Number 1')

    userEvent.click(document.querySelector('input[name="entity[0].ExcludeOrgCheckbox"]') as HTMLElement)
    const excludeOrgs = document.querySelector('input[name="entity[0].ExcludeOrg"]') as HTMLElement
    await waitFor(() => expect(excludeOrgs).toBeTruthy())
    userEvent.type(excludeOrgs, 'v2')
    expect(excludeOrgs).toHaveValue('v2')

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

    expect(await screen.findByText('common.coverage')).toBeInTheDocument()
  })

  test('test ScheduleSection invalid duration - error toaster ', async () => {
    jest.spyOn(global.Date, 'now').mockReturnValue(1603645966706)
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', windowIdentifier: '-1' }}
      >
        <FreezeWindowContext.Provider
          value={{
            ...defaultContext,
            state: {
              ...defaultContext.state,
              isUpdated: true
            },
            freezeFormError: {
              duration: 'Value must be greater than or equal to "30m"'
            }
          }}
        >
          <FreezeWindowScheduleSection isReadOnly={false} onBack={jest.fn()} />
        </FreezeWindowContext.Provider>
      </TestWrapper>
    )

    //insert invalid value
    fireEvent.change(container.querySelector('input[name="duration"]')!, { target: { value: '29m' } })
    expect(container.querySelector('input[name="duration"]')).toHaveValue('29m')

    const submitBtn = container.querySelector('button[type="submit"]')
    expect(submitBtn).toBeDefined()
    fireEvent.click(submitBtn!)

    //error toaster
    expect(document.getElementsByClassName('bp3-toast-message')).toBeDefined()
    expect(getByText('Duration: Value must be greater than or equal to "30m"')).toBeInTheDocument()
  })

  test('it should verify search query for fields at ORG LEVEL', async () => {
    const { container, getByText, getAllByText } = render(
      <TestWrapper
        path="/account/:accountId/settings/organizations/:orgIdentifier/setup/freeze-window-studio/window/:windowIdentifier/"
        pathParams={{ accountId, orgIdentifier, windowIdentifier: '-1' }}
      >
        <FreezeWindowStudioPage />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'org level freeze'
      }
    ])

    const configTab = getByText('common.coverage')
    expect(configTab).toBeDefined()
    userEvent.click(configTab)
    expect(await screen.findByText('Add rule')).toBeInTheDocument()

    // Click on Add rule
    const addRule = getByText('Add rule')
    userEvent.click(addRule)
    expect(await screen.findByText('envType')).toBeInTheDocument()
    const inputEl = document.querySelector('input[name="entity[0].name"]')

    // Fields should be renderer
    expect(inputEl).toBeDefined()
    expect(getByText('projectsText')).toBeInTheDocument()
    expect(getByText('freezeWindows.freezeStudio.excludeProjects')).toBeInTheDocument()
    expect(getAllByText('services')).toBeTruthy()
    expect(getByText('envType')).toBeInTheDocument()

    userEvent.type(inputEl as TargetElement, 'Rule Number 1')

    userEvent.click(document.querySelector('input[name="entity[0].ExcludeProjCheckbox"]') as HTMLElement)
    const excludeProject = document.querySelector('input[name="entity[0].ExcludeProj"]') as HTMLElement
    await waitFor(() => expect(excludeProject).toBeTruthy())
    userEvent.type(excludeProject, 'v2')
    expect(excludeProject).toHaveValue('v2')

    userEvent.click(document.querySelector('input[name="entity[0].EnvType"]') as HTMLElement)
    const envTypeDropdownOptions = document.querySelector('.bp3-popover-content') as HTMLElement
    const prodType = await within(envTypeDropdownOptions).findByText('production')
    userEvent.click(prodType)

    userEvent.click(document.querySelector('input[name="entity[0].EnvType"]') as HTMLElement)
    userEvent.click(await within(envTypeDropdownOptions).findByText('common.allEnvironments'))

    //save
    const tickButton = container.querySelector('.tickButton')
    userEvent.click(tickButton as TargetElement)

    expect(await screen.findByText('Rule Number 1')).toBeInTheDocument()
    expect(getByText('envType: common.allEnvironments')).toBeInTheDocument()
  })
})
