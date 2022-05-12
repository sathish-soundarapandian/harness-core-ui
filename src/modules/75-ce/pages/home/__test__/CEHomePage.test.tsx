/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  useGetLicensesAndSummary,
  useStartTrialLicense,
  useExtendTrialLicense,
  useGetProjectList,
  useSaveFeedback
} from 'services/cd-ng'
import useCETrialModal from '@ce/modals/CETrialModal/useCETrialModal'
import CEHomePage from '../CEHomePage'

jest.mock('services/cd-ng')
const useGetModuleLicenseInfoMock = useGetLicensesAndSummary as jest.MockedFunction<any>
const useStartTrialMock = useStartTrialLicense as jest.MockedFunction<any>
const useGetProjectListMock = useGetProjectList as jest.MockedFunction<any>
const useExtendTrialLicenseMock = useExtendTrialLicense as jest.MockedFunction<any>
useExtendTrialLicenseMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})
const useSaveFeedbackMock = useSaveFeedback as jest.MockedFunction<any>
useSaveFeedbackMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})

jest.mock('@ce/modals/CETrialModal/useCETrialModal')
const useCETrialModalMock = useCETrialModal as jest.MockedFunction<any>

const currentUser = {
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ],
  uuid: '123'
}

describe('CEHomePage snapshot test', () => {
  test('should go to the overview page when return success with data', () => {
    useCETrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))

    useGetProjectListMock.mockImplementation(() => {
      return {
        data: {
          content: []
        }
      }
    })
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
      >
        <CEHomePage />
      </TestWrapper>
    )
    expect(getByText('/account/123/ce/overview')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should display a loading spinner if the module license call is loading', () => {
    useCETrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
    useGetProjectListMock.mockImplementation(() => {
      return {
        data: {
          content: []
        }
      }
    })
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        loading: true,
        refetch: jest.fn()
      }
    })
    const { container } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
      >
        <CEHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should move to the trial page when query param trial is true', async () => {
    useCETrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
    useStartTrialMock.mockImplementation(() => {
      return {
        cancel: jest.fn(),
        loading: false,
        mutate: jest.fn().mockImplementationOnce(() => {
          return {
            status: 'SUCCESS',
            data: {
              licenseType: 'TRIAL'
            }
          }
        })
      }
    })

    useGetProjectListMock.mockImplementation(() => {
      return {
        data: {
          content: []
        }
      }
    })

    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        error: null,
        refetch: jest.fn()
      }
    })
    const { container } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
        queryParams={{ trial: true }}
      >
        <CEHomePage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should display an error if the get licenses call fails', () => {
    useCETrialModalMock.mockImplementation(() => ({ showModal: jest.fn(), hideModal: jest.fn() }))
    useGetProjectListMock.mockImplementation(() => {
      return {
        data: {
          content: []
        }
      }
    })
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: {}
        },
        loading: true,
        refetch: jest.fn()
      }
    })
    const { container } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
      >
        <CEHomePage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
