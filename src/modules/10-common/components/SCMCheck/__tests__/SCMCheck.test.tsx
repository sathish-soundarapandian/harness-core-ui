/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { noop } from 'lodash-es'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import SCMCheck from '../SCMCheck'

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }
const title = 'Save to git'
const handlerForSCM = jest.fn()

describe('Test SCMCheck', () => {
  test('SCMCheck while loading should render none of user info or missing SCM warning', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
        gitSyncStoreValues={{ loadingCodeManagers: true, codeManagers: [] }}
      >
        <SCMCheck title={title} validateSCM={noop} />
      </GitSyncTestWrapper>
    )
    expect(container).toMatchSnapshot()
    await waitFor(() => {
      expect(getByText(title)).toBeInTheDocument()
    })
  })

  test('SCMCheck should render currentUserLabel if SCM is present', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
        defaultAppStoreValues={{ currentUserInfo: { name: 'dev', email: 'mail@harness.io', uuid: '123' } }}
      >
        <SCMCheck title={title} validateSCM={handlerForSCM} />
      </GitSyncTestWrapper>
    )
    expect(container).toMatchSnapshot()
    await waitFor(() => {
      expect(getByText('common.git.currentUserLabel')).toBeInTheDocument()
    })
    expect(handlerForSCM).toBeCalled()
  })

  test('SCMCheck should render currentUserLabel using email if name is not present', async () => {
    const { container } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
        defaultAppStoreValues={{ currentUserInfo: { email: 'mail@harness.io', uuid: '123' } }}
      >
        <SCMCheck title={title} validateSCM={handlerForSCM} />
      </GitSyncTestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('SCMCheck should render warning for missing SCM with link to addUserCredentialLabel', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
        gitSyncStoreValues={{ loadingCodeManagers: false, codeManagers: [] }}
      >
        <SCMCheck title={title} validateSCM={handlerForSCM} />
      </GitSyncTestWrapper>
    )
    expect(container).toMatchSnapshot()
    await waitFor(() => {
      expect(getByText('common.git.noUserLabel')).toBeInTheDocument()
      expect(getByText('common.git.addUserCredentialLabel')).toBeInTheDocument()
    })
    expect(handlerForSCM).toBeCalled()
  })
})
