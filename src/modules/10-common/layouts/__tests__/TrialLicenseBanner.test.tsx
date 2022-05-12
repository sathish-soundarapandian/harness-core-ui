/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetLicensesAndSummary, useExtendTrialLicense, useSaveFeedback } from 'services/cd-ng'

import { TrialLicenseBanner } from '../TrialLicenseBanner'

jest.mock('services/cd-ng')
const useGetLicensesAndSummaryMock = useGetLicensesAndSummary as jest.MockedFunction<any>
const useExtendTrialLicenseMock = useExtendTrialLicense as jest.MockedFunction<any>
const extendTrialMock = jest.fn()
useExtendTrialLicenseMock.mockImplementation(() => {
  return {
    mutate: extendTrialMock
  }
})
const useSaveFeedbackMock = useSaveFeedback as jest.MockedFunction<any>
const saveFeedbackMock = jest.fn()
useSaveFeedbackMock.mockImplementation(() => {
  return {
    mutate: saveFeedbackMock
  }
})

describe('TrialLicenseBanner', () => {
  test('should render banner and provide feedback button if api call returns TRIAL and not expired', () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            edition: 'TEAM',
            licenseType: 'TRIAL',
            maxExpiryTime: moment.now() + 24 * 60 * 60 * 1000,
            moduleType: 'CD'
          },
          status: 'SUCCESS'
        }
      }
    })
    const { container, getByText, queryByText } = render(
      <TestWrapper path="/account/my_account_id/cd/orgs/my_org/projects/my_project">
        <TrialLicenseBanner />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(getByText('common.banners.trial.description')).toBeDefined()
    expect(queryByText('common.banners.trial.expired.extendTrial')).toBeNull()
    expect(getByText('common.banners.trial.provideFeedback'))
  })

  test('should NOT render banner if api call returns NOT TRIAL', () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            edition: 'TEAM',
            licenseType: 'PAID',
            maxExpiryTime: moment.now() + 24 * 60 * 60 * 1000,
            moduleType: 'CD'
          },
          status: 'SUCCESS'
        }
      }
    })
    const { container, queryByText } = render(
      <TestWrapper path="/account/my_account_id/cd/orgs/my_org/projects/my_project">
        <TrialLicenseBanner />
      </TestWrapper>
    )
    expect(queryByText('common.banners.trial.contactSales')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render expired banner and extend trial button if it is expired less than or equal to 14 days', () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            edition: 'TEAM',
            licenseType: 'TRIAL',
            maxExpiryTime: moment.now() - 24 * 60 * 60 * 1000,
            moduleType: 'CD'
          },
          status: 'SUCCESS'
        }
      }
    })
    const { container, queryByText, getByText } = render(
      <TestWrapper path="/account/my_account_id/cd/orgs/my_org/projects/my_project">
        <TrialLicenseBanner />
      </TestWrapper>
    )
    expect(queryByText('common.banners.trial.description')).not.toBeInTheDocument()
    expect(getByText('common.banners.trial.expired.extendTrial')).toBeInTheDocument()
    expect(getByText('or')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render expired banner BUT NO extend trial button if it is expired more than 14 days', () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            edition: 'TEAM',
            licenseType: 'TRIAL',
            maxExpiryTime: moment.now() - 24 * 60 * 60 * 1000 * 15,
            moduleType: 'CD'
          },
          status: 'SUCCESS'
        }
      }
    })
    const { container, queryByText, getByText } = render(
      <TestWrapper path="/account/my_account_id/cd/orgs/my_org/projects/my_project">
        <TrialLicenseBanner />
      </TestWrapper>
    )
    expect(getByText('common.banners.trial.expired.contactSales')).toBeInTheDocument()
    expect(queryByText('common.banners.trial.description')).not.toBeInTheDocument()
    expect(queryByText('common.banners.trial.expired.extendTrial')).not.toBeInTheDocument()
    expect(queryByText('or')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should extend trial when click extend trial button', async () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            edition: 'TEAM',
            licenseType: 'TRIAL',
            maxExpiryTime: moment.now() - 24 * 60 * 60 * 1000,
            moduleType: 'CD'
          },
          status: 'SUCCESS'
        }
      }
    })
    const { getByText } = render(
      <TestWrapper path="/account/my_account_id/cd/orgs/my_org/projects/my_project">
        <TrialLicenseBanner />
      </TestWrapper>
    )
    fireEvent.click(getByText('common.banners.trial.expired.extendTrial'))
    await waitFor(() => {
      expect(extendTrialMock).toHaveBeenCalled()
    })
  })

  test('should submit feedback when click feedback submit button', async () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            edition: 'TEAM',
            licenseType: 'TRIAL',
            maxExpiryTime: moment.now() + 24 * 60 * 60 * 1000,
            moduleType: 'CD'
          },
          status: 'SUCCESS'
        }
      }
    })
    const { getByText } = render(
      <TestWrapper path="/account/my_account_id/cd/orgs/my_org/projects/my_project">
        <TrialLicenseBanner />
      </TestWrapper>
    )
    fireEvent.click(getByText('common.banners.trial.provideFeedback'))
    fireEvent.click(getByText('common.extendTrial.feedback.answers.useful'))
    fireEvent.click(getByText('submit'))
    await waitFor(() => {
      expect(saveFeedbackMock).toHaveBeenCalled()
    })
  })
})
