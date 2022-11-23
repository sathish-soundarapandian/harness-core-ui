/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateCard } from '@templates-library/components/TemplateCard/TemplateCard'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import { StepTemplate } from '@templates-library/components/Templates/StepTemplate/StepTemplate'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { TemplateMetadataSummaryResponse } from 'services/template-ng'

jest.mock('services/cd-ng', () => ({
  useListGitSync: jest.fn().mockImplementation(() => {
    return {
      data: [
        {
          branch: 'feature',
          identifier: 'repo1',
          name: 'repo1'
        }
      ],
      refetch: jest.fn()
    }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn() }
  })
}))

describe('<TemplateCard /> tests', () => {
  beforeAll(() => {
    templateFactory.registerTemplate(new StepTemplate())
  })
  test('snapshot test with git sync enabled', async () => {
    const template = {
      ...(mockTemplates.data?.content?.[0] || {}),
      ...{
        gitDetails: {
          repoIdentifier: 'some repo',
          branch: 'some branch'
        }
      }
    }
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: true }}>
        <TemplateCard template={template} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('should have menu icon', async () => {
    const template = mockTemplates.data?.content?.[0] || {}
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: false }}>
        <TemplateCard
          template={template}
          onPreview={jest.fn}
          onOpenEdit={jest.fn}
          onOpenSettings={jest.fn}
          onDelete={jest.fn}
        />
      </TestWrapper>
    )
    const menuBtn = container.querySelectorAll('button')
    expect(menuBtn).toHaveLength(1)
  })
  test('should not have menu icon', async () => {
    const template = mockTemplates.data?.content?.[0] || {}
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: false }}>
        <TemplateCard template={template} />
      </TestWrapper>
    )
    const menuBtn = container.querySelectorAll('button')
    expect(menuBtn).toHaveLength(0)
  })

  test('should show repo and branch for gitsync', async () => {
    const template = mockTemplates.data?.content?.[0] || {}
    template.gitDetails!.repoIdentifier = 'repo1'
    template.gitDetails!.branch = 'feature'
    const { getByText } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: true }}>
        <GitSyncStoreProvider>
          <TemplateCard template={template} />
        </GitSyncStoreProvider>
      </TestWrapper>
    )
    expect(getByText('repo1')).toBeInTheDocument()
    expect(getByText('feature')).toBeInTheDocument()
  })

  test('should show only repo and not branch for git simplification', async () => {
    const template = (mockTemplates.data?.content?.[0] as TemplateMetadataSummaryResponse) || {}
    template.storeType = 'REMOTE'
    template.gitDetails!.repoName = 'repo2'
    template.gitDetails!.branch = 'feature'
    const { queryByText } = render(
      <TestWrapper defaultAppStoreValues={{ isGitSyncEnabled: false }}>
        <TemplateCard template={template} />
      </TestWrapper>
    )
    expect(queryByText('repo2')).toBeInTheDocument()
    expect(queryByText('feature')).not.toBeInTheDocument()
  })
})
