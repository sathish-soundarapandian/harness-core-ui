/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByAttribute, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { UserGroupConfigureOptions } from '../UserGroupConfigureOptions'
import { userGroupsMockResponse } from './UserGroupsMockResponse'

jest.mock('services/cd-ng', () => ({
  getUserGroupAggregateListPromise: jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      resolve({ data: userGroupsMockResponse.data, refetch: jest.fn(), error: null, loading: false })
    })
  })
}))

const userGroupConfigureOptionsProps = {
  value: '<+input>',
  type: 'String',
  variableName: 'spec.approvers.userGroups',
  showRequiredField: false,
  showDefaultField: false,
  showAdvanced: true,
  isReadonly: false,
  userGroupsInputProps: {
    disabled: false
  }
}

const openConfigureOptionsModal = async (): Promise<void> => {
  const configureOptionsButton = queryByAttribute('id', document.body, 'configureOptions_spec.approvers.userGroups')
  expect(configureOptionsButton).toBeInTheDocument()
  userEvent.click(configureOptionsButton!)
  expect(await screen.findByText('common.configureOptions.configureOptions')).toBeInTheDocument()
}

const selectAllowedValuesRadio = (): void => {
  const allowedValuesRadio = screen.getByDisplayValue('AllowedValues')
  userEvent.click(allowedValuesRadio)
}

describe('test <UserGroupConfigureOptions />', () => {
  test('can select user group(s) as allowed values', async () => {
    const onChange = jest.fn()
    render(
      <TestWrapper>
        <UserGroupConfigureOptions {...userGroupConfigureOptionsProps} onChange={onChange} />
      </TestWrapper>
    )
    await openConfigureOptionsModal()
    selectAllowedValuesRadio()

    const userGroupPlaceholder = await screen.findByText('common.selectUserGroups')
    userEvent.click(userGroupPlaceholder)
    const accountTab = await screen.findByText(/account/i)
    userEvent.click(accountTab)

    const userGroupCheckbox = await screen.findByTestId('Checkbox-user_group_1')
    userEvent.click(userGroupCheckbox)
    await waitFor(() => expect(screen.getByTestId('Checkbox-user_group_1')).toBeChecked())

    const applyButton = screen.getByText('entityReference.apply')
    userEvent.click(applyButton)

    await waitFor(() => expect(accountTab).not.toBeInTheDocument())

    const submitButton = screen.getByText(/submit/i)
    userEvent.click(submitButton)

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith('<+input>.allowedValues(account.user_group_1)', undefined, undefined)
    )
  })

  test('should display an error if submit is clicked without selecting any user group', async () => {
    render(
      <TestWrapper>
        <UserGroupConfigureOptions {...userGroupConfigureOptionsProps} />
      </TestWrapper>
    )
    await openConfigureOptionsModal()
    selectAllowedValuesRadio()

    const userGroupPlaceholder = await screen.findByText('common.selectUserGroups')
    expect(userGroupPlaceholder).toBeInTheDocument()

    const submitButton = screen.getByText(/submit/i)
    userEvent.click(submitButton)

    expect(await screen.findByText('common.configureOptions.validationErrors.minOneAllowedValue')).toBeInTheDocument()
  })
})
