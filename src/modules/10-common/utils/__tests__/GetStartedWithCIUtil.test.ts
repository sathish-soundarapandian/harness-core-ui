/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const getOrgResponse = { status: 'SUCCESS', data: { organization: { identifier: 'default' } } }

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
