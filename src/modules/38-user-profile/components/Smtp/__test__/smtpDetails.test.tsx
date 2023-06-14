/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, act, fireEvent, getByText, waitFor } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import SmtpDetails from '../SmtpDetails'
let validateNameCalled = false
let validateConnecitivityCalled = false

const mockResponse = {
  status: 'SUCCESS',
  data: true,
  metaData: {},
  correlationId: ''
}
let useupdateSmtpConfigMock = {
  loading: false,
  mutate: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      status: 'SUCCESS',
      data: {
        uuid: 'fdfdsfd'
      }
    })
  }),
  refetch: jest.fn()
}
jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesUpTheHierarchy: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegateFromId: jest.fn().mockImplementation(() => {
    return { ...mockResponse, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cd-ng', () => ({
  useGetSmtpConfig: jest.fn().mockImplementation(() => ({
    loading: false,
    data: {
      status: 'SUCCESS',
      data: {
        uuid: 'fdfdsfd',
        accountId: 'dummy',
        name: 'check1',
        value: {
          delegateSelector: [],
          host: '192.168.0.102',
          port: 465,
          fromAddress: null,
          useSSL: true,
          startTLS: false,
          username: 'apikey',
          password: '*******'
        }
      },
      metaData: null,
      correlationId: 'dummy'
    },
    refetch: jest.fn()
  })),
  useValidateName: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      validateNameCalled = true
      return Promise.resolve({
        status: 'SUCCESS',
        data: {}
      })
    }),
    refetch: jest.fn()
  })),
  useUpdateSmtp: jest.fn().mockImplementation(() => useupdateSmtpConfigMock),
  useCreateSmtpConfig: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      validateNameCalled = true
      return Promise.resolve({
        data: {
          status: 'SUCCESS'
        }
      })
    }),
    refetch: jest.fn()
  })),
  useValidateConnectivity: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      validateConnecitivityCalled = true
      return Promise.resolve({
        status: 'SUCCESS',
        data: {}
      })
    }),
    refetch: jest.fn()
  })),
  useDeleteSmtpConfig: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      validateConnecitivityCalled = true
      return Promise.resolve({
        status: 'SUCCESS',
        data: {}
      })
    }),
    refetch: jest.fn()
  })),

  useUpdateConnector: jest.fn().mockImplementation(() => ({
    mutate: () => {
      return Promise.resolve(mockResponse)
    },
    loading: false
  })),
  validateTheIdentifierIsUniquePromise: jest.fn(() => Promise.resolve(mockResponse)),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: () => Promise.resolve(mockResponse),
    loading: false
  })),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('smtp details', () => {
  const setup = (): RenderResult =>
    render(
      <TestWrapper pathParams={{ accountId: 'dummy' }}>
        <SmtpDetails />
      </TestWrapper>
    )

  test('render smtp details', async () => {
    const { getByText: getByTextContainer } = setup()
    await waitFor(() => {
      expect(getByTextContainer('common.hostLabel')).toBeTruthy()
    })
    expect(getByTextContainer('common.hostLabel')).toBeTruthy()
  })
  test('edit smtp details', async () => {
    const { getByText: getByTextContainer } = setup()
    await act(async () => {
      fireEvent.click(getByTextContainer('edit'))
    })
    await waitFor(() => {
      const dialog = findDialogContainer()
      if (dialog) {
        return expect(getByText(dialog, 'continue')).toBeTruthy()
      }
      return false
    })

    const dialogContainer = findDialogContainer()
    if (dialogContainer) {
      expect(getByText(dialogContainer, 'continue')).toBeTruthy()
    }
  })
  test('update smtp details and test', async () => {
    const { getByText: getByTextContainer } = setup()
    await act(async () => {
      fireEvent.click(getByTextContainer('edit'))
    })
    await waitFor(() => {
      const dialog = findDialogContainer()
      if (dialog) {
        return expect(getByText(dialog, 'continue')).toBeTruthy()
      }
      return false
    })

    const dialogContainer = findDialogContainer()
    if (dialogContainer) {
      expect(getByText(dialogContainer, 'continue')).toBeTruthy()
    }
    await act(async () => {
      if (dialogContainer) {
        fireEvent.click(getByText(dialogContainer, 'continue'))
      }
    })
    expect(validateNameCalled).toBeTruthy()
    await waitFor(() => {
      if (dialogContainer) {
        return expect(getByText(dialogContainer, 'continue')).toBeTruthy()
      }
      return false
    })

    await act(async () => {
      if (dialogContainer) {
        fireEvent.click(getByText(dialogContainer, 'continue'))
      }
    })

    await waitFor(() => {
      if (dialogContainer) {
        return expect(getByText(dialogContainer, 'saveAndContinue')).toBeTruthy()
      }
      return false
    })

    await act(async () => {
      if (dialogContainer) {
        fireEvent.click(getByText(dialogContainer, 'saveAndContinue'))
      }
    })

    await act(async () => {
      if (dialogContainer) {
        fireEvent.click(getByText(dialogContainer, 'test'))
      }
    })
    act(() => {
      if (dialogContainer) {
        fireEvent.change(dialogContainer.querySelector('input[name="to"]')!, { target: { value: 'testing@test.com' } })
      }
    })
    await act(async () => {
      if (dialogContainer) {
        fireEvent.click(getByText(dialogContainer, 'test'))
      }
    })

    expect(validateConnecitivityCalled).toBeTruthy()
  })

  test('update smtp details and test update loader loading', async () => {
    useupdateSmtpConfigMock = {
      loading: true,
      mutate: jest.fn().mockImplementation(() => {
        return Promise.resolve({
          status: 'SUCCESS',
          data: {
            uuid: 'fdfdsfd'
          }
        })
      }),
      refetch: jest.fn()
    }
    const { getByText: getByTextContainer } = setup()
    await act(async () => {
      fireEvent.click(getByTextContainer('edit'))
    })
    await waitFor(() => {
      const dialog = findDialogContainer()
      if (dialog) {
        return expect(getByText(dialog, 'continue')).toBeTruthy()
      }
      return false
    })

    const dialogContainer = findDialogContainer()
    if (dialogContainer) {
      expect(getByText(dialogContainer, 'continue')).toBeTruthy()
    }
    await act(async () => {
      if (dialogContainer) {
        fireEvent.click(getByText(dialogContainer, 'continue'))
      }
    })
    expect(validateNameCalled).toBeTruthy()
    await waitFor(() => {
      if (dialogContainer) {
        return expect(getByText(dialogContainer, 'continue')).toBeTruthy()
      }
      return false
    })

    await act(async () => {
      if (dialogContainer) {
        fireEvent.click(getByText(dialogContainer, 'continue'))
      }
    })

    await waitFor(() => {
      if (dialogContainer) {
        return expect(getByText(dialogContainer, 'saveAndContinue')).toBeTruthy()
      }
      return false
    })

    await act(async () => {
      if (dialogContainer) {
        fireEvent.click(getByText(dialogContainer, 'saveAndContinue'))
      }
    })
    await waitFor(() => {
      if (dialogContainer) {
        return expect(getByText(dialogContainer, 'common.smtp.updatingSMTP')).toBeTruthy()
      }
      return false
    })
    expect(getByText(dialogContainer as HTMLElement, 'common.smtp.updatingSMTP')).toBeTruthy()
  })
})
