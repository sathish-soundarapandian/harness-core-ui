/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  fireEvent,
  getAllByText as getAllByTextGlobal,
  render,
  RenderResult,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { clickSubmit } from '@common/utils/JestFormHelper'
import NotificationTable, { NotificationTableProps } from '../NotificationTable'
import { NotificationTypeSelectOptions } from '../NotificationTypeOptions'
import NotificationMethods, { NotificationMethodsProps } from '../Steps/NotificationMethods'

const notificationMethodProps: NotificationMethodsProps = {
  typeOptions: NotificationTypeSelectOptions,
  nextStep: jest.fn(),
  previousStep: jest.fn()
}

const args: NotificationTableProps = {
  data: [
    {
      index: 0,
      notificationRules: {
        name: 'name1',
        enabled: true,
        pipelineEvents: [{ type: 'AllEvents' }, { type: 'PipelineFailed' }],
        notificationMethod: {
          type: 'Slack',
          spec: { userGroups: ['pl-cd-ng'], webhookUrls: 'webhookURL' }
        }
      }
    },
    {
      index: 1,
      notificationRules: {
        name: 'name2',
        enabled: true,
        pipelineEvents: [{ type: 'AllEvents' }],
        notificationMethod: {
          type: 'Email',
          spec: { userGroups: ['pl-cd-ng'], recipients: ['abc@harness.io'] }
        }
      }
    },
    {
      index: 2,
      notificationRules: {
        name: 'name3',
        enabled: true,
        pipelineEvents: [{ type: 'AllEvents' }],
        notificationMethod: {
          type: 'PagerDuty',
          spec: { userGroups: ['pl-cd-ng'], integrationKeys: '12345' }
        }
      }
    }
  ],
  gotoPage: jest.fn(),
  onUpdate: jest.fn(),
  totalPages: 1,
  totalItems: 3,
  pageItemCount: 3,
  pageSize: 5,
  pageIndex: 0,
  onFilterType: _type => undefined,
  filterType: ''
}
describe('Notification Table test', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']
  let getAllByText: RenderResult['getAllByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <NotificationTable {...args} />
      </TestWrapper>
    )
    container = renderObj.container
    getByText = renderObj.getByText
    getAllByText = renderObj.getAllByText
  })
  test('render', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Edit Notfication', async () => {
      const menu = container.querySelector(`[data-icon="Options"]`)
      fireEvent.click(menu!)
      const editMenu = getAllByText('edit')
      expect(editMenu).toBeDefined()
      act(() => {
        fireEvent.click(editMenu[0])
      })
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      await act(async () => {
        //Step 1
        if (form) clickSubmit(form)
        await waitFor(() => getAllByTextGlobal(document.body, 'notifications.selectPipelineEvents')[0])
      })
      form = findDialogContainer()
      await act(async () => {
        //Step 2
        if (form) clickSubmit(form)
        await waitFor(() => getAllByTextGlobal(document.body, 'notifications.notificationMethod')[1])
      })
      form = findDialogContainer()
      await act(async () => {
        //Step 3
        if (form) clickSubmit(form)
      })
    }),
    test('Delete Notfication', async () => {
      const menu = container.querySelector(`[data-icon="Options"]`)
      fireEvent.click(menu!)
      const deleteMenu = getByText('delete')
      expect(deleteMenu).toBeDefined()
      await act(async () => {
        fireEvent.click(deleteMenu!)
      })
    }),
    test('New Notfication', async () => {
      const addNotification = getByText('notifications.name')
      await act(async () => {
        fireEvent.click(addNotification!)
      })
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      fireEvent.click(form?.querySelector('[icon="cross"]')!)
      form = findDialogContainer()
      expect(form).not.toBeTruthy()
    })
})

describe('testing notification method', () => {
  test('selecting slack as notification method from dropdown', async () => {
    const { container, getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <NotificationMethods />
      </TestWrapper>
    )
    const notificationMethodDropDown = getByPlaceholderText('- Select -')
    userEvent.click(notificationMethodDropDown)
    await waitFor(() => getByText('Slack'))
    fireEvent.click(getByText('Slack'))
    expect(container).toMatchSnapshot()
  })

  test('selecting MsTeams as notification method from dropdown, type a valid url and click on finish', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <NotificationMethods {...notificationMethodProps} />
      </TestWrapper>
    )
    const notificationMethodDropDown = getByPlaceholderText('- Select -')
    userEvent.click(notificationMethodDropDown)
    await waitFor(() => getByText('Microsoft Teams'))
    userEvent.click(getByText('Microsoft Teams'))
    await waitFor(() => expect(getByText('notifications.helpMSTeams')).toBeTruthy())
    const urlInput = document.querySelector('input[name="msTeamKeys.0"]')
    act(() => {
      fireEvent.change(urlInput!, { target: { value: 'https://docs.microsoft.com/outlook/actionable-messages' } })
    })
    expect(urlInput).toBeTruthy()
    await waitFor(() => getByText('finish'))
    userEvent.click(getByText('finish'))
    await waitFor(() =>
      expect(notificationMethodProps.nextStep).toHaveBeenCalledWith({
        notificationMethod: {
          spec: {
            msTeamKeys: ['https://docs.microsoft.com/outlook/actionable-messages'],
            userGroups: []
          },
          type: 'MsTeams'
        }
      })
    )
  })

  test('selecting MsTeams as notification method from dropdown and go back', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <NotificationMethods {...notificationMethodProps} />
      </TestWrapper>
    )
    const notificationMethodDropDown = getByPlaceholderText('- Select -')
    userEvent.click(notificationMethodDropDown)
    await waitFor(() => getByText('Microsoft Teams'))
    userEvent.click(getByText('Microsoft Teams'))
    await waitFor(() => expect(getByText('notifications.helpMSTeams')).toBeTruthy())
    await waitFor(() => getByText('back'))
    userEvent.click(getByText('back'))
    await waitFor(() =>
      expect(notificationMethodProps.previousStep).toHaveBeenCalledWith({
        notificationMethod: {
          spec: {
            msTeamKeys: [''],
            userGroups: []
          },
          type: 'MsTeams'
        }
      })
    )
  })

  test('selecting Email as notification method from dropdown, type a valid email and click on finish', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <NotificationMethods {...notificationMethodProps} />
      </TestWrapper>
    )
    const notificationMethodDropDown = getByPlaceholderText('- Select -')
    userEvent.click(notificationMethodDropDown)
    await waitFor(() => getByText('Email'))
    userEvent.click(getByText('Email'))
    const urlInput = document.querySelector('textarea[name="emailIds"]')
    act(() => {
      fireEvent.change(urlInput!, { target: { value: 'xyz@xyz.com' } })
    })
    expect(urlInput).toBeTruthy()
    await waitFor(() => getByText('finish'))
    userEvent.click(getByText('finish'))
    await waitFor(() =>
      expect(notificationMethodProps.nextStep).toHaveBeenCalledWith({
        notificationMethod: {
          spec: {
            recipients: ['xyz@xyz.com'],
            userGroups: []
          },
          type: 'Email'
        }
      })
    )
  })

  test('selecting Email as notification method from dropdown and go back', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <NotificationMethods {...notificationMethodProps} />
      </TestWrapper>
    )
    const notificationMethodDropDown = getByPlaceholderText('- Select -')
    userEvent.click(notificationMethodDropDown)
    await waitFor(() => getByText('Email'))
    userEvent.click(getByText('Email'))
    await waitFor(() => getByText('back'))
    userEvent.click(getByText('back'))
    await waitFor(() =>
      expect(notificationMethodProps.previousStep).toHaveBeenCalledWith({
        notificationMethod: {
          spec: {
            recipients: [],
            userGroups: []
          },
          type: 'Email'
        }
      })
    )
  })
})
