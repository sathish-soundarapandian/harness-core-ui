/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { InfraProvisioningWizard } from '../InfraProvisioningWizard'
import { InfraProvisiongWizardStepId } from '../Constants'
import { ConfigurePipeline } from '../ConfigurePipeline'

const pathParams = { accountId: 'accountId', orgIdentifier: 'orgId', projectIdentifier: 'projectId' }

const mockBranches = {
  status: 'SUCCESS',
  data: {
    branches: [{ name: 'main' }, { name: 'main-demo' }, { name: 'main-patch' }, { name: 'dev' }],
    defaultBranch: { name: 'main' }
  },
  metaData: null,
  correlationId: 'correlationId'
}
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))

jest.mock('services/cd-ng', () => ({
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  })
}))

describe('Test ConfigurePipeline component', () => {
  test('Select Starter pipeline config option', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.ConfigurePipeline} />
      </TestWrapper>
    )
    await act(async () => {
      userEvent.click(getByText('ci.getStartedWithCI.createPipeline'))
    })
    await act(async () => {
      userEvent.click(getByText('ci.getStartedWithCI.generatePipelineConfig'))
    })
    expect(container.querySelectorAll('.bp3-card')[0]).toHaveClass('Card--selected')
  })

  test('Advanced Options section should be not be visible irrespective of FF CI_YAML_VERSIONING on/off', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CI_YAML_VERSIONING: false
    })
    const { getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <ConfigurePipeline
          repoName="test-repo"
          disableNextBtn={jest.fn()}
          enableNextBtn={jest.fn()}
          configuredGitConnector={{ identifier: 'id', name: 'test-connector', spec: {}, type: 'Github' }}
        />
      </TestWrapper>
    )
    expect(getByText('common.seeAdvancedOptions')).toBeInTheDocument()
  })

  test('Advanced Options section should be be visible for FF CI_YAML_VERSIONING on', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CI_YAML_VERSIONING: true
    })
    const { getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <ConfigurePipeline
          repoName="test-repo"
          disableNextBtn={jest.fn()}
          enableNextBtn={jest.fn()}
          configuredGitConnector={{ identifier: 'id', name: 'test-connector', spec: {}, type: 'Github' }}
        />
      </TestWrapper>
    )
    expect(getByText('common.seeAdvancedOptions')).toBeInTheDocument()
  })

  test('Advanced Options section should show expected validation error message', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CI_YAML_VERSIONING: true
    })
    const props = {
      repoName: 'test-repo',
      disableNextBtn: jest.fn(),
      enableNextBtn: jest.fn(),
      configuredGitConnector: {
        identifier: 'id',
        name: 'test-connector',
        spec: {},
        type: 'Github' as ConnectorConfigDTO['type']
      }
    }
    const { container, getByText, rerender } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <ConfigurePipeline
          repoName="test-repo"
          disableNextBtn={jest.fn()}
          enableNextBtn={jest.fn()}
          configuredGitConnector={{ identifier: 'id', name: 'test-connector', spec: {}, type: 'Github' }}
        />
      </TestWrapper>
    )
    await act(async () => {
      userEvent.click(getByText('common.seeAdvancedOptions'))
    })
    expect(getByText('pipelineSteps.deploy.inputSet.branch')).toBeInTheDocument()
    expect(getByText('gitsync.gitSyncForm.yamlPathLabel')).toBeInTheDocument()
    rerender(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <ConfigurePipeline {...props} showError={true} />
      </TestWrapper>
    )
    await act(async () => {
      userEvent.click(getByText('common.seeAdvancedOptions'))
    })
    const yamlPathValidationError = container.querySelector('div[class*="FormError--errorDiv"][data-name="branch"]')
    expect(yamlPathValidationError).toBeInTheDocument()
  })

  test('Configure Pipeline view for GitLab connector - Advanced section should not be visible', async () => {
    render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <ConfigurePipeline
          repoName="test-repo"
          disableNextBtn={jest.fn()}
          enableNextBtn={jest.fn()}
          configuredGitConnector={{ identifier: 'id', name: 'test-connector', spec: {}, type: 'Gitlab' }}
        />
      </TestWrapper>
    )
    expect(screen.queryByText('common.seeAdvancedOptions')).toBeNull()
  })
})
