/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, act, waitFor, findByText } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { environments, mockData, mockedDelegates, mockSecretList, repos, services } from './mocks'
import { DeployProvisioningWizard } from '../DeployProvisioningWizard'

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
      lastModifiedAt: 1607289652713
    }
  })
)

const updateService = jest.fn(() =>
  Promise.resolve({
    status: 'SUCCESS',
    data: {
      service: {
        accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
        identifier: 'sample_service_1658515110913',
        orgIdentifier: 'default',
        projectIdentifier: 'Jira',
        name: 'sample_service',
        description: '',
        deleted: false,
        tags: {},
        yaml: 'service:\n    name: sample_service\n    identifier: sample_service_1658515110913\n    description: ""\n    tags: {}\n    gitOpsEnabled: false\n    serviceDefinition:\n        type: Kubernetes\n        spec:\n            manifests:\n                - manifest:\n                      identifier: manifestName\n                      type: K8sManifest\n                      spec:\n                          store:\n                              spec:\n                                  gitFetchType: Branch\n                                  paths:\n                                      - test-path\n                                  branch: CDS-1234\n                                  repoName: wings-software/wingsui\n                                  connectorRef: account.Github\n                              type: Github\n                          valuesPaths: []\n                          skipResourceVersioning: false\n'
      },
      createdAt: 1658515110913,
      lastModifiedAt: 1624079631940
    }
  })
)

const updatedInfra = jest.fn(() =>
  Promise.resolve({
    status: 'SUCCESS',
    data: {
      infrastructure: {
        accountId: 'px7xd_BFRCi-pfWPYXVjvw',
        identifier: 'sample_infrastructure_1658642798969',
        orgIdentifier: 'default',
        projectIdentifier: 'Jira',
        environmentRef: 'sample_environment_1658642798969',
        name: 'sample_infrastructure',
        description: '',
        tags: {},
        type: 'KubernetesDirect',
        yaml: 'infrastructureDefinition:\n  name: "sample_infrastructure"\n  identifier: "sample_infrastructure_1658642798969"\n  orgIdentifier: "default"\n  projectIdentifier: "Jira"\n  environmentRef: "sample_environment_1658642798969"\n  description: ""\n  tags: {}\n  allowSimultaneousDeployments: false\n  type: "KubernetesDirect"\n  spec:\n    connectorRef: "dfg_1658642333088"\n    namespace: "sample_namespace"\n    releaseName: "release-<+INFRA_KEY>"\n'
      },
      createdAt: 1658642799889,
      lastModifiedAt: 1658642799889
    },
    metaData: null
  })
)

jest.mock('services/cd-ng', () => ({
  useCreateServiceV2: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(obj => {
      services.data.content.push({
        service: {
          accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
          identifier: obj.identifier,
          orgIdentifier: 'default',
          projectIdentifier: 'asdsaff',
          name: obj.name,
          description: null,
          deleted: false,
          tags: {},
          version: 9
        },
        createdAt: 1658515110913,
        lastModifiedAt: 1624079631940
      })
      return {
        status: 'SUCCESS'
      }
    })
  })),
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
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  useGetListOfAllReposByRefConnector: jest.fn().mockImplementation(() => {
    return { data: { data: repos, status: 'SUCCESS' }, refetch: jest.fn(), error: null, loading: false }
  }),
  useUpdateServiceV2: jest.fn().mockImplementation(() => ({ mutate: updateService })),

  useCreateEnvironmentV2: jest.fn().mockImplementation(() => ({
    mutate: jest.fn().mockImplementation(obj => {
      environments.data.content.push({
        environment: {
          accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
          orgIdentifier: 'default',
          projectIdentifier: 'asdasd',
          identifier: obj.identifier,
          name: obj.name,
          description: null,
          color: '#0063F7',
          type: obj.type,
          deleted: false,
          tags: {},
          version: 1
        },
        createdAt: 1624020290070,
        lastModifiedAt: 1624020290070
      })
      return {
        status: 'SUCCESS'
      }
    })
  })),

  useCreateInfrastructure: jest.fn().mockImplementation(() => ({
    mutate: updatedInfra
  })),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecretList)),
  getSecretV2Promise: jest.fn().mockImplementation(() => {
    return { data: mockSecretList, refetch: jest.fn() }
  }),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useCreatePR: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useCreatePRV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => jest.fn())
}))

jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegateFromId: jest.fn().mockImplementation(() => jest.fn()),
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(() => {
    return {
      loading: false,
      data: mockData
    }
  }),
  useGetDelegatesUpTheHierarchy: jest.fn().mockImplementation(() => {
    return {
      loading: false,
      error: undefined,
      data: mockedDelegates
    }
  })
}))

jest.mock('services/pipeline-ng', () => ({
  createPipelineV2Promise: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: {
        identifier: 'Default_Pipeline'
      }
    })
  )
}))

const pathParams = { accountId: 'accountId', orgIdentifier: 'orgId', projectIdentifier: 'projectId' }

describe('Render and test DeployProvisioningWizard', () => {
  test('Test Wizard Navigation ', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCD({ ...pathParams, module: 'cd' })} pathParams={pathParams}>
        <DeployProvisioningWizard />
      </TestWrapper>
    )

    /* Get Started Step 1:  Select Workload Component*/

    await act(async () => {
      fireEvent.click((Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[])[0])
    })

    await act(async () => {
      fireEvent.click(
        (Array.from(container.querySelectorAll('div[class*="serviceDeploymentTypeCard"]')) as HTMLElement[])[0]
      )
    })

    expect(container.querySelector('input[name="serviceRef"]')).toBeDefined()

    //click on Configure repo for creating service
    await act(async () => {
      fireEvent.click(getByText('next: cd.getStartedWithCD.configureRepo'))
    })

    //Getting toaster for service creation
    expect(getByText('cd.serviceCreated')).toBeDefined()

    /* Get Started Step 2:  Select Artifact Component*/

    await act(async () => {
      fireEvent.click(getByText('cd.getStartedWithCD.inManifest'))
    })

    //Expecting Accordion 1: ' Where is your code repository?' to open on choosing artifact type
    expect(container.querySelector("div[data-testid='codeRepo-summary']")).toBeDefined()

    //Choosing Github as gitprovider for creating connector
    await act(async () => {
      fireEvent.click(getByText('common.repo_provider.githubLabel'))
    })

    //choosing access token as authentication method
    await act(async () => {
      fireEvent.click(getByText('common.getStarted.accessTokenLabel'))
    })

    //fill access token for github
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

    //test connector connection
    await act(async () => {
      fireEvent.click(testConnectionBtn)
    })

    //Connector creation message
    expect(getByText('common.test.connectionSuccessful'))

    // See success-tick after completing accordion 1
    expect(container.querySelector('span[data-icon="success-tick"]')).toBeDefined()

    expect(container.querySelector("div[data-testid='selectYourRepo-summary']")).toBeDefined()

    //Opening Accordion 2: Select your Repository
    fireEvent.click(getByText('common.selectYourRepo'))

    //choosing code repo from list
    await act(async () => {
      fireEvent.click(getByText('harness/agent-gateway'))
    })

    // See success-tick after completing accordion 2
    expect(container.querySelector('span[data-icon="success-tick"]')).toBeDefined()

    expect(container.querySelector("div[data-testid='provideManifest-summary']")).toBeDefined()

    //Opening Accordion 3: Provide Manifest Details
    fireEvent.click(getByText('cd.getStartedWithCD.provideManifest'))

    //filling manifest details form
    await waitFor(() =>
      fillAtForm([
        {
          container,
          fieldId: 'identifier',
          type: InputTypes.TEXTFIELD,
          value: 'manifestName'
        },
        {
          container,
          fieldId: 'branch',
          type: InputTypes.TEXTAREA,
          value: 'CDS-1234'
        },
        {
          container,
          fieldId: 'paths[0].path',
          type: InputTypes.TEXTFIELD,
          value: 'test-path'
        }
      ])
    )

    // See success-tick after completing accordion 3
    expect(container.querySelector('span[data-icon="success-tick"]')).toBeDefined()

    //click on configure infra for creating infrastructure
    await act(async () => {
      fireEvent.click(getByText('cd.getStartedWithCD.manifestFile'))
    })

    //Getting toaster for service update
    expect(getByText('Service updated successfully')).toBeDefined()

    /* Get Started Step 3:  Select Infrastructure Component*/

    await act(async () => {
      fireEvent.click((Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[])[0])
    })

    //entering namespace value
    fireEvent.change(container.querySelector('input[name="namespace"]')!, {
      target: { value: 'sample_namespace' }
    })

    //Expecting accordion: 'Connect to your Kubernetes cluster' to open on filling namespace and choosing infra type
    expect(container.querySelector("div[class*='Accordion--accordion']")).toBeDefined()

    //Enter connectorName
    fireEvent.change(container.querySelector('input[name="connectorName"]')!, {
      target: { value: 'connector2' }
    })

    //choose delegate type to be specific
    await act(async () => {
      fireEvent.click(getByText('connectors.k8.delegateOutClusterInfo'))
    })

    //fill authentication details
    await waitFor(() =>
      fillAtForm([
        {
          container,
          type: InputTypes.TEXTFIELD,
          fieldId: 'masterUrl',
          value: 'dummyMasterUrl'
        },
        {
          container,
          type: InputTypes.TEXTFIELD,
          fieldId: 'usernametextField',
          value: 'dummyusername'
        }
      ])
    )

    //click on password input box
    await act(async () => {
      fireEvent.click(getByText('createOrSelectSecret'))
    })

    //opening secret dialog
    const modal = findDialogContainer()

    const secret = await findByText(modal!, 'mockSecret')

    //choosing secret password
    await act(async () => {
      fireEvent.click(secret)
    })
    const applyBtn = await waitFor(() => findByText(modal!, 'entityReference.apply'))

    //Click on apply
    await act(async () => {
      fireEvent.click(applyBtn)
    })

    //choose delegate options to be any
    expect(container.querySelector('input[value="DelegateOptions.DelegateOptionsAny"]')).toBeTruthy()
  })
})
