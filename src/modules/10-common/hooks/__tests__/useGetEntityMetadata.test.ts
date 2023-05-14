/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook, RenderHookResult } from '@testing-library/react-hooks'
import {
  getPipelineMetadataByIdentifier,
  getTemplateMetadataByIdentifier,
  useGetEntityMetadata,
  UseGetEntityUrlProp
} from '@common/hooks/useGetEntityMetadata'
import { TestWrapper } from '@common/utils/testUtils'
import type { EntityReference } from 'services/cd-ng'
import { mockRemotePipelineSummary, mockInlinePipelineSummary, mockTemplateMetadataList } from '../__mocks__/mockdata'

const entityMockScope = { accountIdentifier: 'mockAccount', orgIdentifier: 'mockOrg', projectIdentifier: 'mockProject' }
let getPipelineSummaryMock = jest.fn().mockImplementation(() => Promise.resolve(mockRemotePipelineSummary))
let getTemplateMetadataListMock = jest.fn().mockImplementation(() => Promise.resolve(mockTemplateMetadataList))

jest.mock('services/pipeline-ng', () => ({
  getPipelineSummaryPromise: jest.fn().mockImplementation(() => getPipelineSummaryMock())
}))

jest.mock('services/template-ng', () => ({
  getTemplateMetadataListPromise: jest.fn().mockImplementation(() => getTemplateMetadataListMock())
}))

const renderUseGetEntityMetadataHook = (
  entityInfo?: UseGetEntityUrlProp['entityInfo']
): RenderHookResult<undefined, { getEntityURL: () => Promise<string> }> =>
  renderHook(() => useGetEntityMetadata({ entityInfo }), {
    wrapper: TestWrapper
  })

describe('useGetEntityMetadata tests', () => {
  test('getPipelineMetadataByIdentifier should return pipeline metadata', async () => {
    const pipelineMetadataResponse = await getPipelineMetadataByIdentifier(entityMockScope, 'reference_test_remote')
    expect(pipelineMetadataResponse).toBe(mockRemotePipelineSummary)
  })

  test('getTemplateMetadataByIdentifier should return template metadata', async () => {
    const templateMetadataResponse = await getTemplateMetadataByIdentifier(
      entityMockScope,
      'pipline_using_stage_template'
    )
    expect(templateMetadataResponse).toBe(mockTemplateMetadataList.data.content[0])
  })

  test('With no entity type redirect should be to home page', async () => {
    const { result } = renderUseGetEntityMetadataHook({})
    const pipelineUrl = await result.current.getEntityURL()
    expect(pipelineUrl).toBe('/account//home/get-started')
  })

  test('If pipeline metadata is for remote, url should be of pipelineStudio with all queryParams', async () => {
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Pipelines',
      entityRef: { identifier: 'reference_test_remote', ...entityMockScope }
    })

    const pipelineUrl = await result.current.getEntityURL()
    expect(pipelineUrl).toBe(
      '/account/mockAccount/home/orgs/mockOrg/projects/mockProject/pipelines/reference_test_remote/pipeline-studio/?storeType=REMOTE&connectorRef=git_connector&repoName=gitX2'
    )
  })

  test('If pipeline metadata is for remote with branch, url have all queryParams including given branch', async () => {
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Pipelines',
      entityRef: { identifier: 'reference_test_remote', ...entityMockScope, branch: 'testBranch' }
    })

    const pipelineUrl = await result.current.getEntityURL()
    expect(pipelineUrl).toBe(
      '/account/mockAccount/home/orgs/mockOrg/projects/mockProject/pipelines/reference_test_remote/pipeline-studio/?storeType=REMOTE&connectorRef=git_connector&repoName=gitX2&branch=testBranch'
    )
  })

  test('If pipeline metadata is not available, url should be of pipelineList', async () => {
    getPipelineSummaryMock = jest.fn().mockImplementation(() => Promise.resolve({ status: 'FAILURE', data: {} }))
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Pipelines',
      entityRef: { identifier: 'reference_test_remote', ...entityMockScope }
    })

    const pipelineUrl = await result.current.getEntityURL()

    expect(pipelineUrl).toBe('/account/mockAccount/home/orgs/mockOrg/projects/mockProject/pipelines')
  })

  test('If pipeline metadata available without storeType, url should be of pipelineList', async () => {
    getPipelineSummaryMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ status: 'SUCCESS', data: { identifier: 'reference_test_old_git_sync' } })
      )
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Pipelines',
      entityRef: { identifier: 'reference_test_old_git_sync', ...entityMockScope }
    })

    const pipelineUrl = await result.current.getEntityURL()

    expect(pipelineUrl).toBe('/account/mockAccount/home/orgs/mockOrg/projects/mockProject/pipelines')
  })

  test('If pipeline metadata is for inline, url should be of pipelineStudio for Inline', async () => {
    getPipelineSummaryMock = jest.fn().mockImplementation(() => Promise.resolve(mockInlinePipelineSummary))
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Pipelines',
      entityRef: { identifier: 'reference_test_inline', ...entityMockScope }
    })

    const pipelineUrl = await result.current.getEntityURL()

    expect(pipelineUrl).toBe(
      '/account/mockAccount/home/orgs/mockOrg/projects/mockProject/pipelines/reference_test_inline/pipeline-studio/?storeType=INLINE'
    )
  })

  test('If template metadata is for remote with branch, url have all queryParams including given branch', async () => {
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Template',
      entityRef: {
        identifier: 'pipline_using_stage_template',
        ...entityMockScope,
        branch: 'testBranch',
        versionLabel: 'v1'
      } as EntityReference
    })

    const templateeUrl = await result.current.getEntityURL()
    expect(templateeUrl).toBe(
      '/account/mockAccount/home/orgs/mockOrg/projects/mockProject/setup/resources/template-studio/Pipeline/template/pipline_using_stage_template/?versionLabel=v1&branch=testBranch'
    )
  })

  test('If template metadata is not available, url should be of templateList', async () => {
    getTemplateMetadataListMock = jest.fn().mockImplementation(() => Promise.resolve({ status: 'FAILURE', data: {} }))
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Template',
      entityRef: {
        identifier: 'pipline_using_stage_template',
        ...entityMockScope,
        branch: 'testBranch'
      }
    })

    const templateeUrl = await result.current.getEntityURL()
    expect(templateeUrl).toBe('/account/mockAccount/home/orgs/mockOrg/projects/mockProject/setup/resources/templates')
  })

  test('For connector it should open connector details page', async () => {
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Connectors',
      entityRef: {
        identifier: 'mock_connector',
        ...entityMockScope
      }
    })

    const connnectorUrl = await result.current.getEntityURL()
    expect(connnectorUrl).toBe(
      '/account/mockAccount/home/orgs/mockOrg/projects/mockProject/setup/resources/connectors/mock_connector'
    )
  })

  test('For secret it should open secret details page', async () => {
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Secrets',
      entityRef: {
        identifier: 'mock_secret',
        ...entityMockScope
      }
    })

    const secretUrl = await result.current.getEntityURL()
    expect(secretUrl).toBe(
      '/account/mockAccount/home/orgs/mockOrg/projects/mockProject/setup/resources/secrets/mock_secret/overview'
    )
  })
  test('For service it should open service details page', async () => {
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Service',
      entityRef: {
        identifier: 'mock_enity',
        ...entityMockScope
      }
    })

    const entityUrl = await result.current.getEntityURL()
    expect(entityUrl).toBe(
      '/account/mockAccount/home/orgs/mockOrg/projects/mockProject/services/mock_enity?tab=configuration'
    )
  })
  test('For EnvironmentGroup it should open EnvironmentGroup summary page', async () => {
    const { result } = renderUseGetEntityMetadataHook({
      type: 'EnvironmentGroup',
      entityRef: {
        identifier: 'mock_enity',
        ...entityMockScope
      }
    })

    const entityUrl = await result.current.getEntityURL()
    expect(entityUrl).toBe(
      '/account/mockAccount/home/orgs/mockOrg/projects/mockProject/environments/groups/mock_enity/details'
    )
  })
  test('For Environment it should open Environment summary page', async () => {
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Environment',
      entityRef: {
        identifier: 'mock_enity',
        ...entityMockScope
      }
    })

    const entityUrl = await result.current.getEntityURL()
    expect(entityUrl).toBe(
      '/account/mockAccount/home/orgs/mockOrg/projects/mockProject/environments/mock_enity/details'
    )
  })
  test('For Infrastructure it should open Infrastructure definiitons page', async () => {
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Infrastructure',
      entityRef: {
        identifier: 'mock_entity',
        envIdentifier: 'mock_env_entity',
        ...entityMockScope
      }
    })

    const entityUrl = await result.current.getEntityURL()
    expect(entityUrl).toBe(
      '/account/mockAccount/home/orgs/mockOrg/projects/mockProject/environments/mock_env_entity/details?sectionId=INFRASTRUCTURE&infrastructureId=mock_entity'
    )
  })

  test('Trigger reference: If pipeline metadata is for remote, url should be of trigger details page with all queryParams', async () => {
    const pipelineIdentifier = 'test_pipeline'
    const identifier = 'test-trigger'
    getPipelineSummaryMock = jest.fn().mockImplementation(() => Promise.resolve(mockRemotePipelineSummary))
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Triggers',
      entityRef: { pipelineIdentifier, identifier, ...entityMockScope }
    })

    const pipelineUrl = await result.current.getEntityURL()
    expect(pipelineUrl).toBe(
      `/account/${entityMockScope.accountIdentifier}/home/orgs/${entityMockScope.orgIdentifier}/projects/${entityMockScope.projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${identifier}/detail?storeType=REMOTE&connectorRef=git_connector&repoName=gitX2`
    )
  })

  test('Trigger reference: If pipeline metadata is for remote with branch, url have all queryParams including given branch', async () => {
    const pipelineIdentifier = 'test_pipeline'
    const identifier = 'test-trigger'
    getPipelineSummaryMock = jest.fn().mockImplementation(() => Promise.resolve(mockRemotePipelineSummary))
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Triggers',
      entityRef: {
        pipelineIdentifier,
        identifier,
        ...entityMockScope,
        branch: 'testBranch'
      }
    })

    const pipelineUrl = await result.current.getEntityURL()
    expect(pipelineUrl).toBe(
      `/account/${entityMockScope.accountIdentifier}/home/orgs/${entityMockScope.orgIdentifier}/projects/${entityMockScope.projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${identifier}/detail?storeType=REMOTE&connectorRef=git_connector&repoName=gitX2&branch=testBranch`
    )
  })

  test('Trigger reference: If pipeline metadata is not available, url should be of triggers list', async () => {
    const pipelineIdentifier = 'test_pipeline'
    const identifier = 'test-trigger'
    getPipelineSummaryMock = jest.fn().mockImplementation(() => Promise.resolve({ status: 'FAILURE', data: {} }))
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Triggers',
      entityRef: { pipelineIdentifier, identifier, ...entityMockScope }
    })

    const pipelineUrl = await result.current.getEntityURL()

    expect(pipelineUrl).toBe(
      `/account/${entityMockScope.accountIdentifier}/home/orgs/${entityMockScope.orgIdentifier}/projects/${entityMockScope.projectIdentifier}/pipelines/${pipelineIdentifier}/triggers`
    )
  })

  test('Trigger reference: If pipeline metadata available without storeType, url should be of triggers list', async () => {
    const pipelineIdentifier = 'test_pipeline'
    const identifier = 'test-trigger'
    getPipelineSummaryMock = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ status: 'SUCCESS', data: { identifier: 'reference_test_old_git_sync' } })
      )
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Triggers',
      entityRef: { pipelineIdentifier, identifier, ...entityMockScope }
    })

    const pipelineUrl = await result.current.getEntityURL()

    expect(pipelineUrl).toBe(
      `/account/${entityMockScope.accountIdentifier}/home/orgs/${entityMockScope.orgIdentifier}/projects/${entityMockScope.projectIdentifier}/pipelines/${pipelineIdentifier}/triggers`
    )
  })

  test('Trigger reference: If pipeline metadata is for inline, url should be of trigger detail for Inline', async () => {
    const pipelineIdentifier = 'test_pipeline'
    const identifier = 'test-trigger'
    getPipelineSummaryMock = jest.fn().mockImplementation(() => Promise.resolve(mockInlinePipelineSummary))
    const { result } = renderUseGetEntityMetadataHook({
      type: 'Triggers',
      entityRef: { pipelineIdentifier, identifier, ...entityMockScope }
    })

    const pipelineUrl = await result.current.getEntityURL()

    expect(pipelineUrl).toBe(
      `/account/${entityMockScope.accountIdentifier}/home/orgs/${entityMockScope.orgIdentifier}/projects/${entityMockScope.projectIdentifier}/pipelines/${pipelineIdentifier}/triggers/${identifier}/detail?storeType=INLINE`
    )
  })
})
