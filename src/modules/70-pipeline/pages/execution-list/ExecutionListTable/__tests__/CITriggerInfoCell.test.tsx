/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { CITriggerInfo } from '../CITriggerInfoCell'

describe('Test CITriggerInfo component', () => {
  describe('Test Webhook executions', () => {
    test('render Webhook execution view', () => {
      const { container, getByText } = render(
        <CITriggerInfo
          repoName="harness-core-ui"
          branch="develop"
          ciExecutionInfoDTO={{
            __recast: 'io.harness.ci.pipeline.executions.beans.CIWebhookInfoDTO',
            event: 'pullRequest',
            author: {
              __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildAuthor',
              id: 'test-user',
              name: '',
              email: '',
              avatar: 'https://avatars.githubusercontent.com/u/81607640?v=4'
            },
            pullRequest: {
              __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildPRHook',
              id: 1,
              link: 'https://github.com/harness/harness-core-ui/pull/1',
              title: 'feat: [CI-1]: test github view',
              sourceBranch: 'CI-1',
              targetBranch: 'develop',
              state: 'open',
              commits: [
                {
                  __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildCommit',
                  id: '700f1e5e876e711e82be867a4fcf364bf2baba84',
                  link: 'https://github.com/harness/harness-core-ui/commit/700f1e5e876e711e82be867a4fcf364bf2baba84',
                  message: 'feat: [CI-1]: test github view',
                  ownerName: 'Test User',
                  ownerId: 'test-user',
                  ownerEmail: 'test-user@xyz.com',
                  timeStamp: 1665566768000
                }
              ]
            }
          }}
        />
      )
      expect(container.querySelectorAll('[data-icon="git-branch"]').length).toBe(2)
      expect(container.querySelector('[data-icon="git-pull"]')).toBeInTheDocument()
      expect(container.querySelector('[data-icon="git-pull"]')).toBeInTheDocument()
      expect(container.querySelector('p[class*="prState"]')).toBeInTheDocument()
      expect(container.querySelector('div[class*="separator"]')).toBeInTheDocument()
      expect(getByText('open')).toBeInTheDocument()
    })
  })

  describe('Test Manual executions', () => {
    test('render Manual execution view with tag', () => {
      const { container, getByText } = render(
        <CITriggerInfo
          repoName="harness-core-ui"
          branch="develop"
          tag="v0.1"
          ciExecutionInfoDTO={{
            __recast: 'io.harness.ci.pipeline.executions.beans.CIWebhookInfoDTO',
            event: 'branch',
            branch: {
              __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildBranchHook',
              commits: [
                {
                  __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildCommit',
                  id: '52209442261a352f16e3f90ab540b4325dc7f4bd',
                  link: 'https://github.com/wings-software/springboot/commit/52209442261a352f16e3f90ab540b4325dc7f4bd',
                  message: 'springboot repo',
                  ownerName: 'Test User',
                  ownerId: 'test-user',
                  ownerEmail: 'test-user@xyz.com',
                  timeStamp: 1610120271000
                }
              ]
            }
          }}
        />
      )
      expect(container.querySelector('[data-icon="tag"]')).toBeInTheDocument()
      expect(getByText('v0.1')).toBeInTheDocument()
    })

    test('render Manual execution view with PR number', () => {
      const { container, getByText } = render(
        <CITriggerInfo
          repoName="harness-core-ui"
          branch="develop"
          ciExecutionInfoDTO={{
            __recast: 'io.harness.ci.pipeline.executions.beans.CIWebhookInfoDTO',
            event: 'pullRequest',
            pullRequest: {
              __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildPRHook',
              id: 69,
              link: 'https://github.com/wings-software/springboot/pull/69',
              title: 'Update README.md',
              sourceBranch: 'develop',
              targetBranch: 'master',
              state: 'open',
              commits: [
                {
                  __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildCommit',
                  id: '309af0579fa713e4a6f46709b9561b857431b066',
                  link: 'https://github.com/wings-software/springboot/commit/309af0579fa713e4a6f46709b9561b857431b066',
                  message: 'Update README.md',
                  ownerName: 'Test User',
                  ownerId: 'test-user',
                  ownerEmail: 'test-user@xyz.com',
                  timeStamp: 1661397950000
                }
              ]
            }
          }}
        />
      )
      expect(container.querySelectorAll('[data-icon="git-branch"]').length).toBe(2)
      expect(container.querySelector('[data-icon="git-pull"]')).toBeInTheDocument()
      expect(getByText('open')).toBeInTheDocument()
    })

    test('render Manual execution view with branch', () => {
      const { container } = render(
        <CITriggerInfo
          repoName="harness-core-ui"
          branch="develop"
          ciExecutionInfoDTO={{
            __recast: 'io.harness.ci.pipeline.executions.beans.CIWebhookInfoDTO',
            event: 'branch',
            branch: {
              __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildBranchHook',
              commits: [
                {
                  __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildCommit',
                  id: '91f405c826adab9caf004ea5d3cca821d44621f6',
                  link: 'https://github.com/wings-software/springboot/commit/91f405c826adab9caf004ea5d3cca821d44621f6',
                  message: 'Update README.md',
                  ownerName: 'Test User',
                  ownerId: 'test-user',
                  ownerEmail: 'test-user@xyz.com',
                  timeStamp: 1660741194000
                }
              ]
            }
          }}
        />
      )
      expect(container.querySelector('[data-icon="git-branch"]')).toBeInTheDocument()
      expect(container.querySelector('[data-icon="git-commit"]')).toBeInTheDocument()
    })
  })
})
