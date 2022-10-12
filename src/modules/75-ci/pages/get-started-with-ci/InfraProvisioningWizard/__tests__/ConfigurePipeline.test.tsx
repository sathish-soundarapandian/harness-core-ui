/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { InfraProvisioningWizard } from '../InfraProvisioningWizard'
import { InfraProvisiongWizardStepId } from '../Constants'
import { ConfigurePipeline } from '../ConfigurePipeline'

const pathParams = { accountId: 'accountId', orgIdentifier: 'orgId', projectIdentifier: 'projectId' }

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
      userEvent.click(getByText('ci.getStartedWithCI.starterPipeline'))
    })
    expect(container.querySelectorAll('.bp3-card')[0]).toHaveClass('Card--selected')
  })

  test('Select Starter configuration option', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.ConfigurePipeline} />
      </TestWrapper>
    )
    const starterConfigCards = container.querySelectorAll('.bp3-card')
    expect(starterConfigCards.length).toBe(6)
    const dotNetStarterConfig = getByText('Build and test a .NET or ASP.NET Core project')
    await act(async () => {
      userEvent.click(dotNetStarterConfig)
    })
    expect(starterConfigCards[1]).toHaveClass('Card--selected')
  })

  test('Select Starter configuration option with CIE_HOSTED_VMS FF', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CIE_HOSTED_VMS: true
    })
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard lastConfiguredWizardStepId={InfraProvisiongWizardStepId.ConfigurePipeline} />
      </TestWrapper>
    )
    const starterConfigCards = container.querySelectorAll('.bp3-card')
    expect(starterConfigCards.length).toBe(6)
    const dotNetStarterConfig = getByText('Build and test a .NET or ASP.NET Core project')
    await act(async () => {
      userEvent.click(dotNetStarterConfig)
    })
    expect(starterConfigCards[1]).toHaveClass('Card--selected')
  })

  test('Select Starter configuration option should show expected validation error message', async () => {
    const props = {
      repoName: 'test-repo',
      disableNextBtn: jest.fn(),
      enableNextBtn: jest.fn(),
      configuredGitConnector: {
        identifier: 'id',
        name: 'test-connector',
        spec: {},
        type: 'Github' as ConnectorConfigDTO['type']
      },
      enableForTesting: true
    }
    const { container, getByText, rerender } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <ConfigurePipeline
          repoName="test-repo"
          disableNextBtn={jest.fn()}
          enableNextBtn={jest.fn()}
          configuredGitConnector={{ identifier: 'id', name: 'test-connector', spec: {}, type: 'Github' }}
          enableForTesting={true}
        />
      </TestWrapper>
    )
    await act(async () => {
      userEvent.click(getByText('ci.getStartedWithCI.chooseExistingYAML'))
    })
    expect(getByText('gitsync.selectBranchTitle')).toBeInTheDocument()
    expect(getByText('gitsync.gitSyncForm.yamlPathLabel')).toBeInTheDocument()
    rerender(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <ConfigurePipeline {...props} showError={true} />
      </TestWrapper>
    )
    await act(async () => {
      userEvent.click(getByText('ci.getStartedWithCI.chooseExistingYAML'))
    })
    const yamlPathValidationError = container.querySelector('div[class*="FormError--errorDiv"][data-name="yamlPath"]')
    expect(yamlPathValidationError).toBeInTheDocument()
  })

  test('Configure Pipeline view for GitLab connector', async () => {
    const { getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <ConfigurePipeline
          repoName="test-repo"
          disableNextBtn={jest.fn()}
          enableNextBtn={jest.fn()}
          configuredGitConnector={{ identifier: 'id', name: 'test-connector', spec: {}, type: 'Gitlab' }}
          enableForTesting={true}
        />
      </TestWrapper>
    )
    try {
      getByText('ci.getStartedWithCI.chooseExistingYAML')
    } catch (error) {
      expect((error as any)?.message as string).toContain(
        'Unable to find an element with the text: ci.getStartedWithCI.chooseExistingYAML'
      )
    }
  })
})
