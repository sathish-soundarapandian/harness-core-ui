/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  useGetLicensesAndSummary,
  useExtendTrialLicense,
  useSaveFeedback,
  useGetProjectList,
  useStartTrialLicense,
  useStartFreeLicense
} from 'services/cd-ng'
import CIHomePage from '../CIHomePage'

const projects = [
  {
    project: {
      accountIdentifier: 'dummy',
      orgIdentifier: 'default',
      identifier: 'TestCiproject',
      name: 'project1',
      color: '#0063F7',
      modules: ['CI', 'CD'],
      description: '',
      tags: {},
      lastModifiedAt: 1607348985778
    }
  },
  {
    project: {
      accountIdentifier: 'dummy',
      orgIdentifier: 'default',
      identifier: 'test11',
      name: 'project2',
      color: '#0063F7',
      modules: ['CI'],
      description: '',
      tags: {},
      lastModifiedAt: 1607075878518
    }
  }
]

jest.mock('services/cd-ng')
const useGetModuleLicenseInfoMock = useGetLicensesAndSummary as jest.MockedFunction<any>
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
const useGetProjectListMock = useGetProjectList as jest.MockedFunction<any>
useGetProjectListMock.mockImplementation(() => {
  return { data: { data: { content: projects } }, refetch: jest.fn(), error: null }
})

const currentUser = {
  defaultAccountId: '123',
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ],
  uuid: '123'
}
const useStartFreeLicenseMock = useStartFreeLicense as jest.MockedFunction<any>
useStartFreeLicenseMock.mockImplementation(() => {
  return {
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS',
        data: {
          licenseType: 'FREE'
        }
      }
    })
  }
})
const useStartTrialMock = useStartTrialLicense as jest.MockedFunction<any>
useStartTrialMock.mockImplementation(() => {
  return {
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS',
        data: {
          licenseType: 'TRIAL'
        }
      }
    })
  }
})
describe('CIHomePage', () => {
  test('should render HomePageTemplate when return success with data', () => {
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
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
      >
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('ci.dashboard.subHeading')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should render the home page template when the current user is not created from NG', () => {
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

    const userCreatedFromCG = {
      accounts: [
        {
          uuid: '123',
          createdFromNG: false
        }
      ],
      uuid: '123'
    }

    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: userCreatedFromCG }}
      >
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('ci.dashboard.subHeading')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should return error page if call fails', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        error: {
          message: 'call failed'
        },
        refetch: jest.fn()
      }
    })
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('call failed')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should move to trial in progress page when query param experience is TRIAL', () => {
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
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('common.trialInProgress')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should update the license store', async () => {
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

    const updateLicenseStoreSpy = jest.fn()

    const { container, getByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ currentUserInfo: currentUser }}
        path="/account/:accountId"
        pathParams={{ accountId: '123' }}
        queryParams={{ experience: 'TRIAL' }}
        defaultLicenseStoreValues={{
          updateLicenseStore: updateLicenseStoreSpy
        }}
      >
        <CIHomePage />
      </TestWrapper>
    )
    expect(getByText('common.trialInProgress')).toBeDefined()
    expect(container).toMatchSnapshot()

    await waitFor(() => expect(updateLicenseStoreSpy).toHaveBeenCalledTimes(1))
  })

  test('should pop up select project CI Trial modal if query param modal is TRIAL and there is NOT selected project', () => {
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
      <TestWrapper queryParams={{ modal: 'TRIAL' }}>
        <CIHomePage />
      </TestWrapper>
    )
    // expect(getByText('projectsOrgs.selectAnExistingProject')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('should show a loading spinner', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {},
        loading: true,
        error: null,
        refetch: jest.fn()
      }
    })
    const { container } = render(
      <TestWrapper queryParams={{ experience: 'TRIAL' }}>
        <CIHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should refetch the module license info when the link in the error screen is clicked', async () => {
    const refetchMock = jest.fn()

    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {},
        error: {},
        refetch: refetchMock
      }
    })
    const { getByText } = render(
      <TestWrapper queryParams={{ trial: true }}>
        <CIHomePage />
      </TestWrapper>
    )

    const retryButton = getByText('Retry')

    fireEvent.click(retryButton)

    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(2))
  })
})
