/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useStartTrialLicense, useStartFreeLicense } from 'services/cd-ng'
import CETrialHomePage from '../CETrialHomePage'

jest.mock('services/cd-ng')
const useStartTrialMock = useStartTrialLicense as jest.MockedFunction<any>
const useStartFreeLicenseMock = useStartFreeLicense as jest.MockedFunction<any>

describe('CETrialHomePage snapshot test', () => {
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

  test('it should render properly', async () => {
    window.deploymentType = 'ON_PREM'
    const { getByText } = render(
      <TestWrapper>
        <CETrialHomePage />
      </TestWrapper>
    )
    fireEvent.click(getByText('ce.ceTrialHomePage.startTrial.startBtn.description'))
    await waitFor(() => expect('ce.ceTrialHomePage.modal.welcome'))
  })
})
