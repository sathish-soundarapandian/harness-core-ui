/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import WelcomePage from '../WelcomePage'
jest.mock('@harnessio/ff-react-client-sdk')
jest.mock('services/cd-ng', () => ({
  useUpdateAccountDefaultExperienceNG: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve({ status: 'SUCCESS', data: { defaultExperience: 'NG' } }) }
  }),
  useStartFreeLicense: jest.fn().mockImplementation(() => {
    return {
      mutate: () =>
        Promise.resolve({
          status: 'SUCCESS',
          data: {
            id: '631a3cd31353c237dedfb3a2',
            accountIdentifier: '7-dnAHjpSNuHHQ2OChaiRw',
            moduleType: 'CI',
            edition: 'FREE',
            status: 'ACTIVE',
            premiumSupport: false,
            selfService: false,
            createdAt: 1662663890993,
            lastModifiedAt: 1662663890993,
            numberOfCommitters: -1
          },
          metaData: null,
          correlationId: '9e8b87e6-afbb-44b6-b2b1-b96710328548'
        })
    }
  }),
  useStartTrialLicense: jest.fn().mockImplementation(() => {
    return {
      mutate: () =>
        Promise.resolve({
          status: 'SUCCESS',
          data: {
            id: '631a3cd31353c237dedfb3a2',
            accountIdentifier: '7-dnAHjpSNuHHQ2OChaiRw',
            moduleType: 'CHAOS',
            edition: 'ENTERPRISE',
            licenseType: 'TRIAL',
            status: 'ACTIVE',
            premiumSupport: true,
            selfService: false,
            createdAt: 1662663890993,
            lastModifiedAt: 1662663890993,
            numberOfCommitters: -1
          },
          metaData: null,
          correlationId: '9e8b87e6-afbb-44b6-b2b1-b96710328548'
        })
    }
  })
}))

const featureFlags = {
  CVNG_ENABLED: true
}

describe('Welcome Page', () => {
  test('Select Module Page Rendering', () => {
    const { container, getByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <WelcomePage />
      </TestWrapper>
    )
    expect(() => getByText('common.purpose.selectAModule'))
    expect(container).toMatchSnapshot()
  })

  test('Should go to module home page when select non cd module and continue', async () => {
    const { container, getByText, getByTestId, queryByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <WelcomePage />
      </TestWrapper>
    )
    await waitFor(() => expect(queryByText('common.purpose.ci.descriptionOnly')).toBeInTheDocument())
    fireEvent.click(getByTestId('ci'))
    fireEvent.click(getByText('continue'))
    await waitFor(() => expect(queryByText('common.purpose.ci.descriptionOnly')).not.toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })

  test('Should go to module home page when select cd module and continue', async () => {
    const { container, getByText, getByTestId, queryByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <WelcomePage />
      </TestWrapper>
    )
    await waitFor(() => expect(queryByText('common.purpose.cd.description')).toBeInTheDocument())
    fireEvent.click(getByTestId('cd'))
    fireEvent.click(getByText('continue'))
    await waitFor(() => expect(queryByText('common.purpose.cd.description')).not.toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })

  test('Should go to module home page when chaos module is selected and continue is clicked', async () => {
    const { container, getByText, getByTestId, queryByText } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <WelcomePage />
      </TestWrapper>
    )
    await waitFor(() => expect(queryByText('common.purpose.chaos.description')).toBeInTheDocument())
    fireEvent.click(getByTestId('chaos'))
    fireEvent.click(getByText('continue'))
    await waitFor(() => expect(queryByText('common.purpose.chaos.description')).not.toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })
})
