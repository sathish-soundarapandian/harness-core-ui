/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Editions } from '@common/constants/SubscriptionTypes'
import { setUpCI } from '../GetStartedWithCIUtil'

let getOrgResponse = { status: 'SUCCESS', data: { organization: { identifier: 'default' } } }

jest.mock('services/cd-ng', () => ({
  startFreeLicensePromise: jest
    .fn()
    .mockImplementation(() => Promise.resolve({ status: 'SUCCESS', data: { status: 'ACTIVE' } })),
  startTrialLicensePromise: jest
    .fn()
    .mockImplementation(() => Promise.resolve({ status: 'SUCCESS', data: { status: 'ACTIVE' } })),
  getOrganizationPromise: jest.fn().mockImplementation(() => Promise.resolve(getOrgResponse)),
  postOrganizationPromise: jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ status: 'SUCCESS', data: { organization: { identifier: 'identifier' } } })
    ),
  postProjectPromise: jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ status: 'SUCCESS', data: { project: { identifier: 'Default_Pipeline' } } })
    )
}))

describe('Test GetStartedWithCIUtil', () => {
  test('Test setUpCI when default org is present', () => {
    const mock = jest.fn()
    setUpCI({
      accountId: 'accountId',
      edition: Editions.FREE,
      onSetUpSuccessCallback: mock,
      licenseInformation: {},
      updateLicenseStore: jest.fn()
    })
    expect(mock.mock.calls.length).toBe(0)
  })

  test('Test setUpCI when default org is not present', () => {
    getOrgResponse = { status: 'FAILURE', data: { organization: { identifier: '' } } }
    const mock = jest.fn()
    setUpCI({
      accountId: 'accountId',
      edition: Editions.TEAM,
      onSetUpSuccessCallback: mock,
      licenseInformation: {},
      updateLicenseStore: jest.fn()
    })
    expect(mock.mock.calls.length).toBe(0)
  })
})
