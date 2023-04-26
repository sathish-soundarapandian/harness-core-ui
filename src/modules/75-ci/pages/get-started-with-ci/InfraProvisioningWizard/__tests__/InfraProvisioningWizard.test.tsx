/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor, Matcher, SelectorMatcherOptions } from '@testing-library/react'
import mockImport from 'framework/utils/mockImport'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { mockBranches } from '@gitsync/components/GitSyncForm/__tests__/mockdata'
import { InfraProvisioningWizard } from '../InfraProvisioningWizard'
import { InfraProvisiongWizardStepId } from '../Constants'
import { repos } from '../mocks/repositories'

const createInputSetForPipelinePromiseMock = jest.fn(() =>
  Promise.resolve({
    status: 'SUCCESS',
    data: { identifier: 'created_input_set' }
  })
)

jest.mock('services/pipeline-ng', () => ({
  createPipelineV2Promise: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: {
        identifier: 'Default_Pipeline'
      }
    })
  ),
  createTriggerPromise: jest.fn(() =>
    Promise.resolve({
      status: 'SUCCESS'
    })
  ),
  createInputSetForPipelinePromise: jest.fn().mockImplementation(() => {
    return createInputSetForPipelinePromiseMock()
  })
}))

const generatedYAMLResponseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    data: {
      status: 'SUCCESS',
      data: 'name: sample pipeline\nstages:\n- name: build\n  spec:\n    steps:\n    - name: npm_install\n      spec:\n        run: npm install\n      type: script\n    - name: npm_test\n      spec:\n        run: npm run test\n      type: script\n    - name: npm_test\n      spec:\n        run: npm run lint\n      type: script\n    - name: docker_build\n      spec:\n        image: plugins/docker\n        with:\n          dry_run: true\n          repo: hello/world\n          tags: latest\n      type: plugin\n  type: ci\nversion: 1\n'
    },
    loading: false
  })
})

const updateConnector = jest.fn()
const createConnector = jest.fn(() =>
  Promise.resolve({
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'test git connector',
        identifier: 'test_git_connector',
        type: 'Github',
        spec: {
          dockerRegistryUrl: 'https;//github.com',
          auth: {
            type: 'UsernamePassword',
            spec: { username: 'testpass', passwordRef: 'account.testpass' }
          }
        }
      },
      createdAt: 1607289652713,
      lastModifiedAt: 1607289652713,
      status: 'SUCCESS'
    }
  })
)
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))
jest.mock('services/cd-ng', () => ({
  useCreateDefaultScmConnector: jest.fn().mockImplementation(() => {
    return {
      mutate: () =>
        Promise.resolve({
          status: 'SUCCESS',
          data: {
            connectorResponseDTO: { connector: { identifier: 'identifier' } },
            connectorValidationResult: { status: 'SUCCESS' },
            secretResponseWrapper: { secret: { identifier: 'identifier' } }
          }
        })
    }
  }),
  useGetListOfAllReposByRefConnector: jest.fn().mockImplementation(() => {
    return {
      data: { data: repos, status: 'SUCCESS' },
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  }),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  }),
  generateYamlPromise: jest.fn().mockImplementation(() => {
    return generatedYAMLResponseMock()
  })
}))

const pathParams = { accountId: 'accountId', orgIdentifier: 'orgId', projectIdentifier: 'projectId' }

const routesToPipelineStudio = jest.spyOn(routes, 'toPipelineStudio')
describe('Render and test InfraProvisioningWizard', () => {
  test('Test Wizard Navigation end-to-end', async () => {
    global.fetch = jest.fn()
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.click((Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[])[0])
    })

    await act(async () => {
      fireEvent.click(getByText('common.getStarted.accessTokenLabel'))
    })

    await waitFor(() =>
      fillAtForm([
        {
          container,
          fieldId: 'accessToken',
          type: InputTypes.TEXTFIELD,
          value: 'sample-access-token'
        }
      ])
    )

    const testConnectionBtn = container.querySelector("button[id='test-connection-btn']") as Element
    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })

    await act(async () => {
      fireEvent.click(getByText('next: common.selectRepository'))
    })

    await act(async () => {
      fireEvent.click(getByText('community/wings-software/wingsui'))
    })

    await act(async () => {
      fireEvent.click(getByText('next: ci.getStartedWithCI.configurePipeline'))
    })

    await act(async () => {
      fireEvent.click(getByText('ci.getStartedWithCI.starterPipelineConfig'))
    })

    expect(routesToPipelineStudio).not.toHaveBeenCalled()

    await waitFor(() =>
      fillAtForm([
        {
          container,
          fieldId: 'branch',
          type: InputTypes.TEXTFIELD,
          value: 'main'
        }
      ])
    )

    await act(async () => {
      fireEvent.click(getByText('ci.getStartedWithCI.createPipeline'))
    })

    expect(createInputSetForPipelinePromiseMock).toBeCalled()

    expect(createInputSetForPipelinePromiseMock).toBeCalledTimes(2)

    expect(routesToPipelineStudio).toHaveBeenCalled()
  })

  const setupGitRepo = async ({
    container,
    getByText
  }: {
    container: HTMLElement
    getByText: (
      text: Matcher,
      options?: SelectorMatcherOptions | undefined,
      waitForElementOptions?: unknown
    ) => HTMLElement
  }): Promise<void> => {
    await act(async () => {
      fireEvent.click((Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[])[0])
    })

    await act(async () => {
      fireEvent.click(getByText('common.getStarted.accessTokenLabel'))
    })

    await waitFor(() =>
      fillAtForm([
        {
          container,
          fieldId: 'accessToken',
          type: InputTypes.TEXTFIELD,
          value: 'sample-access-token'
        }
      ])
    )

    const testConnectionBtn = container.querySelector("button[id='test-connection-btn']") as Element
    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })
  }

  const setupRepository = async ({
    getByText
  }: {
    getByText: (
      text: Matcher,
      options?: SelectorMatcherOptions | undefined,
      waitForElementOptions?: unknown
    ) => HTMLElement
  }): Promise<void> => {
    await act(async () => {
      fireEvent.click(getByText('next: common.selectRepository'))
    })

    await act(async () => {
      fireEvent.click(getByText('community/wings-software/wingsui'))
    })

    await act(async () => {
      fireEvent.click(getByText('next: ci.getStartedWithCI.configurePipeline'))
    })
  }

  test('Test pipeline creation using existing YAML', async () => {
    global.fetch = jest.fn()
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard enableImportYAMLOption={true} />
      </TestWrapper>
    )

    await setupGitRepo({ container, getByText })

    await setupRepository({ getByText })

    await act(async () => {
      fireEvent.click(getByText('ci.getStartedWithCI.importExistingYAML'))
    })

    await act(async () => {
      fireEvent.click(getByText('ci.getStartedWithCI.createPipeline'))
    })

    const yamlPathValidationError = container.querySelector('div[class*="FormError--errorDiv"][data-name="yamlPath"]')
    expect(yamlPathValidationError).toBeInTheDocument()
  })

  test('Ensure errors are shown for test pipeline creation using existing YAML', async () => {
    global.fetch = jest.fn()
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard
          enableImportYAMLOption={true}
          lastConfiguredWizardStepId={InfraProvisiongWizardStepId.ConfigurePipeline}
        />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(getByText('ci.getStartedWithCI.importExistingYAML'))
    })

    await act(async () => {
      fireEvent.click(getByText('ci.getStartedWithCI.createPipeline'))
    })

    const yamlPathValidationError = container.querySelector('div[class*="FormError--errorDiv"][data-name="yamlPath"]')
    expect(yamlPathValidationError).toBeInTheDocument()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Test "Option" flow end-to-end', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard />
      </TestWrapper>
    )
    await act(async () => {
      const cards = Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[]
      fireEvent.click(cards[cards.length - 1])
    })

    try {
      expect(getByText('next: ci.getStartedWithCI.selectRepo')).not.toBeInTheDocument()
    } catch (e) {
      // Ignore error
    }

    await act(async () => {
      fireEvent.click(getByText('ci.getStartedWithCI.createPipeline'))
    })

    expect(routesToPipelineStudio).toHaveBeenCalled()
  })

  test('Test generate YAML flow with FF on/off', async () => {
    mockImport('@common/hooks/useFeatureFlag', {
      useFeatureFlags: () => ({ CI_YAML_VERSIONING: true })
    })
    global.fetch = jest.fn()
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCI({ ...pathParams, module: 'ci' })} pathParams={pathParams}>
        <InfraProvisioningWizard />
      </TestWrapper>
    )

    await setupGitRepo({ container, getByText })

    await setupRepository({ getByText })

    expect(getByText('ci.getStartedWithCI.generatePipelineConfig')).toBeDefined()

    await waitFor(() => expect(generatedYAMLResponseMock).toBeCalled())
  })
})
