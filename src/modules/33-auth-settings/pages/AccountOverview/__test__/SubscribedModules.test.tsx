/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetAccountLicenses, useExtendTrialLicense } from 'services/cd-ng'
import SubscribedModules from '../views/SubscribedModules'

jest.mock('services/cd-ng')
const useGetAccountLicensesMock = useGetAccountLicenses as jest.MockedFunction<any>
useExtendTrialLicense as jest.MockedFunction<any>

describe('SubscribedModules', () => {
  test('should render modules when api call returns modules', () => {
    useGetAccountLicensesMock.mockImplementation(() => {
      return {
        data: {
          correlationId: '40d39b08-857d-4bd2-9418-af1aafc42d20',
          data: {
            accountId: 'HlORRJY8SH2IlwpAGWwkmg',
            allModuleLicenses: {
              CI: [
                {
                  accountIdentifier: 'HlORRJY8SH2IlwpAGWwkmg',
                  createdAt: 1618619866814,
                  edition: 'ENTERPRISE',
                  expiryTime: 1619829466787,
                  id: '607a2ddaa8641a3a65f8bbde',
                  lastModifiedAt: 1618619866814,
                  licenseType: 'TRIAL',
                  moduleType: 'CI',
                  numberOfCommitters: 10,
                  startTime: 1618619866,
                  status: 'ACTIVE'
                }
              ]
            }
          },
          metaData: null,
          status: 'SUCCESS'
        }
      }
    })
    const { container, queryByText } = render(
      <TestWrapper defaultAppStoreValues={{}}>
        <SubscribedModules />
      </TestWrapper>
    )
    expect(queryByText('common.account.visitSubscriptions.link')).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('should NOT render modules when api call returns modules but module is not enabled', () => {
    useGetAccountLicensesMock.mockImplementation(() => {
      return {
        data: {
          correlationId: '40d39b08-857d-4bd2-9418-af1aafc42d20',
          data: {
            accountId: 'HlORRJY8SH2IlwpAGWwkmg',
            allModuleLicenses: {
              CI: [
                {
                  accountIdentifier: 'HlORRJY8SH2IlwpAGWwkmg',
                  createdAt: 1618619866814,
                  edition: 'ENTERPRISE',
                  expiryTime: 1619829466787,
                  id: '607a2ddaa8641a3a65f8bbde',
                  lastModifiedAt: 1618619866814,
                  licenseType: 'TRIAL',
                  moduleType: 'CI',
                  numberOfCommitters: 10,
                  startTime: 1618619866,
                  status: 'ACTIVE'
                }
              ]
            }
          },
          metaData: null,
          status: 'SUCCESS'
        }
      }
    })
    const { container, queryByText } = render(
      <TestWrapper defaultAppStoreValues={{}}>
        <SubscribedModules />
      </TestWrapper>
    )
    expect(queryByText('common.purpose.ci.integration')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render link to subscriptions page only when no modules returned', () => {
    useGetAccountLicensesMock.mockImplementation(() => {
      return {
        data: {
          correlationId: '40d39b08-857d-4bd2-9418-af1aafc42d20',
          data: {
            accountId: 'HlORRJY8SH2IlwpAGWwkmg',
            allModuleLicenses: {}
          },
          metaData: null,
          status: 'SUCCESS'
        }
      }
    })
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <SubscribedModules />
      </TestWrapper>
    )
    expect(getByText('common.account.visitSubscriptions.link')).toBeDefined()
    expect(queryByText('common.purpose.continuous')).toBeNull()
    expect(container).toMatchSnapshot()
  })
})
