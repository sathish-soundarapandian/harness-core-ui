/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, act, screen } from '@testing-library/react'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import * as services from 'services/cd-ng'
import { HarnessEnvironmentModal } from '../HarnessEnvironmentModal'
import environments from './mock.json'
import inputSetEnvironments from './envMock'

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentList: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: environments, refetch: jest.fn() })),
  useGetEnvironmentAccessList: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: inputSetEnvironments, refetch: jest.fn() })),
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
  isEdit: false,
  data: { name: '', identifier: '', description: '', tags: {} },
  isEnvironment: true,
  onCreateOrUpdate: onSave,
  closeModal: onClose
}

describe('test', () => {
  test('validation are present if submited with empty value ', async () => {
    const { container, getByText, getAllByText, getByLabelText } = render(
      <TestWrapper>
        <HarnessEnvironmentModal {...props} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(getByText('save'))
    })

    await waitFor(() => expect(getAllByText('fieldRequired').length).toEqual(2))

    fillAtForm([
      {
        container,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'Environment 102'
      }
    ])

    await waitFor(() => expect(getAllByText('fieldRequired').length).toEqual(1))

    await act(async () => {
      fireEvent.click(getByLabelText('production'))
    })

    expect(container).toMatchSnapshot()
  })

  test('should validate edit mode snapshot', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <HarnessEnvironmentModal
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
      fireEvent.click(getByText('save'))
    })

    // verify on updating service has same identifier and updated name
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        identifier: 'Environment_101',
        name: 'Environment 102',
        description: '',
        tags: { tag1: '', tag2: '' },
        type: 'Production'
      })
    )

    expect(container).toMatchSnapshot()
  })

  test('should validate save', async () => {
    const { container, getByText, getByLabelText } = render(
      <TestWrapper>
        <HarnessEnvironmentModal {...props} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'New Environment'
      }
    ])

    await waitFor(() => expect(getByText('save')).toBeTruthy())

    await act(async () => {
      fireEvent.click(getByLabelText('production'))
    })

    await waitFor(() => expect(getByLabelText('production')).toBeTruthy())

    await act(async () => {
      fireEvent.click(getByText('save'))
    })

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        identifier: 'New_Environment',
        name: 'New Environment',
        description: '',
        tags: {},
        type: 'Production'
      })
    )

    await waitFor(() => expect(getByText('cancel')).toBeTruthy())

    await act(async () => {
      fireEvent.click(getByText('cancel'))
    })

    await waitFor(() => expect(onClose).toHaveBeenCalled())

    expect(container).toMatchSnapshot()
  })

  test('should show spinner UI when useCreateEnvironmentV2 call is loading', () => {
    jest.spyOn(services, 'useCreateEnvironmentV2').mockReturnValue({
      cancel: jest.fn(),
      loading: true,
      error: null,
      mutate: jest.fn()
    })
    render(
      <TestWrapper>
        <HarnessEnvironmentModal {...props} />
      </TestWrapper>
    )

    expect(screen.getByTestId(/page-spinner/)).toBeInTheDocument()
  })

  test('should show spinner UI when useUpsertEnvironmentV2 call is loading', () => {
    jest.spyOn(services, 'useUpsertEnvironmentV2').mockReturnValue({
      cancel: jest.fn(),
      loading: true,
      error: null,
      mutate: jest.fn()
    })
    render(
      <TestWrapper>
        <HarnessEnvironmentModal {...props} />
      </TestWrapper>
    )

    expect(screen.getByTestId(/page-spinner/)).toBeInTheDocument()
  })
})
