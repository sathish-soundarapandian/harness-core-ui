/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, screen, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdServices from 'services/cd-ng'
import ChaosTrialHomePage from '../ChaosTrialHomePage'

jest.mock('services/cd-ng')
const useStartTrialMock = cdServices.useStartTrialLicense as jest.MockedFunction<any>
const useStartFreeLicenseMock = cdServices.useStartFreeLicense as jest.MockedFunction<any>

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
      <ChaosTrialHomePage />
    </TestWrapper>
  )

describe('ChaosTrialHomePage snapshot test', () => {
  beforeEach(() => {
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
    }),
      useStartFreeLicenseMock.mockImplementation(() => {
        return {
          cancel: jest.fn(),
          loading: false,
          mutate: jest.fn().mockImplementationOnce(() => {
            return {
              status: 'SUCCESS',
              data: {
                licenseType: 'FREE'
              }
            }
          })
        }
      })
  })

  test('it should render properly for ON_PREM', async () => {
    window.deploymentType = 'ON_PREM'
    render(
      <TestWrapper>
        <ChaosTrialHomePage />
      </TestWrapper>
    )

    await waitFor(() => expect('chaos.homepage.slogan'))
  })

  test('it should render properly for SAAS', async () => {
    window.deploymentType = 'SAAS'
    const { getByText } = render(
      <TestWrapper>
        <ChaosTrialHomePage />
      </TestWrapper>
    )
    fireEvent.click(getByText('common.startFreePlan'))
    await waitFor(() => expect('chaos.homepage.slogan'))
  })

  test('it should start free plan when Start Free Plan is clicked', async () => {
    const handleStartButtonClick = jest.fn()
    window.deploymentType = 'SAAS'
    jest.spyOn(cdServices, 'useStartFreeLicense').mockReturnValue({
      mutate: handleStartButtonClick,
      loading: false
    } as any)

    renderComponent()

    expect(handleStartButtonClick).not.toHaveBeenCalled()

    userEvent.click(screen.getByText('common.startFreePlan'))

    await waitFor(() => expect(handleStartButtonClick).toHaveBeenCalled())
  })

  test('it should not start trial when Start 14 day Chaos Enterprise trial is clicked', async () => {
    const handleEnterpriseButtonClick = jest.fn()
    window.deploymentType = 'ON_PREM'
    jest.spyOn(cdServices, 'useStartTrialLicense').mockReturnValue({
      mutate: handleEnterpriseButtonClick,
      loading: false
    } as any)

    renderComponent()

    expect(handleEnterpriseButtonClick).not.toHaveBeenCalled()
    const text = screen.queryByText('chaos.chaosTrialHomePage.description')
    expect(text).not.toBeInTheDocument()
  })
})
