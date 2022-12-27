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
      <div>
        <p>{routes.toCODE({ accountId: 'test-accountId' })}</p>
        <p>{routes.toCODEHome({ accountId: 'test-accountId' })}</p>
        <p>{routes.toCODERepositories({ space: '/harness/default/test' })}</p>
        <p>
          {routes.toCODERepository({
            repoPath: 'harness/default/test/repo1',
            gitRef: 'main',
            resourcePath: 'src/components/Test.tsx'
          })}
        </p>
        <p>
          {routes.toCODERepository({
            repoPath: 'harness/default/test/repo1',
            gitRef: 'main'
          })}
        </p>
        <p>
          {routes.toCODERepository({
            repoPath: 'harness/default/test/repo1',
            resourcePath: 'src/components/Test.tsx'
          })}
        </p>
        <p>
          {routes.toCODEFileEdit({
            repoPath: 'harness/default/test/repo1',
            gitRef: 'main',
            resourcePath: 'src/components/Test.tsx'
          })}
        </p>
        <p>
          {routes.toCODEFileEdit({
            repoPath: 'harness/default/test/repo1',
            gitRef: 'main'
          })}
        </p>
        <p>{routes.toCODECommits({ repoPath: 'harness/default/test/repo1', commitRef: 'main' })}</p>
        <p>{routes.toCODECommits({ repoPath: 'harness/default/test/repo1' })}</p>
        <p>{routes.toCODEBranches({ repoPath: 'harness/default/test/repo1' })}</p>
        <p>{routes.toCODEPullRequests({ repoPath: 'harness/default/test/repo1' })}</p>
        <p>{routes.toCODEPullRequest({ repoPath: 'harness/default/test/repo1', pullRequestId: '1001' })}</p>
        <p>
          {routes.toCODEPullRequest({
            repoPath: 'harness/default/test/repo1',
            pullRequestId: '1001',
            pullRequestSection: 'commits'
          })}
        </p>
        <p>
          {routes.toCODEPullRequest({
            repoPath: 'harness/default/test/repo1',
            pullRequestId: '1001',
            pullRequestSection: 'diffs'
          })}
        </p>
        <p>{routes.toCODECompare({ repoPath: 'harness/default/test/repo1', diffRefs: 'main...develop' })}</p>
        <p>{routes.toCODESettings({ repoPath: 'harness/default/test/repo1' })}</p>
        <p>{routes.toCODECreateWebhook({ repoPath: 'harness/default/test/repo1' })}</p>
      </div>
    )

    expect(container).toMatchSnapshot()
  })
})
