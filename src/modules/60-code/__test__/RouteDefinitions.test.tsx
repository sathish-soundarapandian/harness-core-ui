/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { render } from '@testing-library/react'
import routes from '../RouteDefinitions'

describe('RouteDefinitions', () => {
  test('routes should render links correctly', async () => {
    const { container } = render(
      <pre>
        {routes.toCODE({ accountId: 'test-accountId' })}
        {routes.toCODEHome({ accountId: 'test-accountId' })}
        {routes.toCODERepositories({ space: '/harness/default/test' })}

        {routes.toCODERepository({
          repoPath: 'harness/default/test/repo1',
          gitRef: 'main',
          resourcePath: 'src/components/Test.tsx'
        })}

        {routes.toCODERepository({
          repoPath: 'harness/default/test/repo1',
          gitRef: 'main'
        })}

        {routes.toCODERepository({
          repoPath: 'harness/default/test/repo1',
          resourcePath: 'src/components/Test.tsx'
        })}

        {routes.toCODEFileEdit({
          repoPath: 'harness/default/test/repo1',
          gitRef: 'main',
          resourcePath: 'src/components/Test.tsx'
        })}

        {routes.toCODEFileEdit({
          repoPath: 'harness/default/test/repo1',
          gitRef: 'main'
        })}

        {routes.toCODECommits({ repoPath: 'harness/default/test/repo1', commitRef: 'main' })}
        {routes.toCODECommits({ repoPath: 'harness/default/test/repo1' })}
        {routes.toCODEBranches({ repoPath: 'harness/default/test/repo1' })}
        {routes.toCODEPullRequests({ repoPath: 'harness/default/test/repo1' })}
        {routes.toCODEPullRequest({ repoPath: 'harness/default/test/repo1', pullRequestId: '1001' })}

        {routes.toCODEPullRequest({
          repoPath: 'harness/default/test/repo1',
          pullRequestId: '1001',
          pullRequestSection: 'commits'
        })}

        {routes.toCODEPullRequest({
          repoPath: 'harness/default/test/repo1',
          pullRequestId: '1001',
          pullRequestSection: 'diffs'
        })}

        {routes.toCODECompare({ repoPath: 'harness/default/test/repo1', diffRefs: 'main...develop' })}
        {routes.toCODESettings({ repoPath: 'harness/default/test/repo1' })}
        {routes.toCODEWebhooks({ repoPath: 'harness/default/test/repo1' })}
        {routes.toCODEWebhookNew({ repoPath: 'harness/default/test/repo1' })}
        {routes.toCODEWebhookDetails({ repoPath: 'harness/default/test/repo1', webhookId: '1234' })}
      </pre>
    )

    expect(container).toMatchSnapshot()
  })
})
