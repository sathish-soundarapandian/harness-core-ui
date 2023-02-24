/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'

import * as cdng from 'services/cd-ng'

import { Scope } from '@common/interfaces/SecretsInterface'
import { TestWrapper } from '@common/utils/testUtils'

import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'

import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

import { AzureArtifacts } from '../AzureArtifacts'

const fetchProjects = jest.fn().mockReturnValue({
  data: [
    {
      id: 'test-id',
      name: 'sample-k8s-manifests'
    }
  ]
})

const fetchFeeds = jest.fn().mockReturnValue({
  data: [
    {
      fullyQualifiedName: 'feedproject',
      id: '6434318d-7904-4b76-a503-332951acb8a2',
      name: 'feedproject'
    }
  ]
})

const fetchPackages = jest.fn().mockReturnValue({
  data: [
    {
      id: 'test',
      name: 'test'
    }
  ]
})
jest.mock('services/cd-ng', () => ({
  useListProjectsForAzureArtifacts: jest.fn().mockImplementation(() => {
    return {
      data: [
        {
          id: 'test-id',
          name: 'sample-k8s-manifests'
        }
      ],
      refetch: fetchProjects,
      error: null,
      loading: false
    }
  }),
  useListFeedsForAzureArtifacts: jest.fn().mockImplementation(() => {
    return {
      data: [
        {
          fullyQualifiedName: 'feedproject',
          id: '6434318d-7904-4b76-a503-332951acb8a2',
          name: 'feedproject'
        }
      ],
      error: null,
      loading: false
    }
  }),
  useListPackagesForAzureArtifacts: jest.fn().mockImplementation(() => {
    return {
      data: [
        {
          id: 'test',
          name: 'test'
        }
      ],
      error: null,
      loading: false
    }
  }),
  useListVersionsFromPackage: jest.fn().mockImplementation(() => {
    return { data: [], error: null, loading: false }
  })
}))

const props = {
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: 2,
  handleSubmit: jest.fn(),
  artifactIdentifiers: [],
  selectedArtifact: 'AzureArtifacts' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.Kubernetes,
  prevStepData: {
    connectorId: {
      value: 'testConnector'
    }
  }
}

const editValues = {
  identifier: 'test-id',
  type: 'AzureArtifacts' as ArtifactType,
  spec: {
    versionType: '',
    scope: Scope.PROJECT,
    project: 'sample-k8s-manifests',
    feed: 'feedproject',
    packageType: 'Maven',
    package: 'test',
    version: '1',
    versionRegex: ''
  }
}

describe('Azure Artifacts tests', () => {
  test(`renders without crashing - when scope is org`, () => {
    const initialValues = {
      identifier: 'test-azure-id',

      versionType: 'value',
      scope: Scope.ORG,

      feed: 'test',
      packageType: 'Maven',
      package: 'test',
      version: '<+input>'
    }

    const { container } = render(
      <TestWrapper>
        <AzureArtifacts key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders without crashing - when scope is project`, () => {
    const initialValues = {
      identifier: 'test-azure-id',

      versionType: '',
      scope: Scope.PROJECT,

      feed: '',
      packageType: '',
      package: '',
      version: ''
    }

    const { container } = render(
      <TestWrapper>
        <AzureArtifacts key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('clicking on projects dropdown', async () => {
    jest.spyOn(cdng, 'useListProjectsForAzureArtifacts').mockImplementation((): any => {
      return {
        loading: true,
        data: null,
        refetch: fetchProjects
      }
    })
    const initialValues = {
      identifier: '',

      versionType: '',
      scope: '',
      project: '',
      feed: '',
      packageType: '',
      package: '',
      version: ''
    }

    const { container } = render(
      <TestWrapper>
        <AzureArtifacts key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    const projectDropdownBtn = container.querySelectorAll('[data-icon="chevron-down"]')[1]

    userEvent.click(projectDropdownBtn!)

    expect(portalDivs.length).toBe(1)
    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')

    const loadingBucketsOption = await findByText(selectListMenu as HTMLElement, 'common.loadingFieldOptions')
    expect(loadingBucketsOption).toBeDefined()
    await waitFor(() => expect(fetchProjects).toHaveBeenCalledTimes(1))
  })

  test('clicking on feeds dropdown', async () => {
    jest.spyOn(cdng, 'useListFeedsForAzureArtifacts').mockImplementation((): any => {
      return {
        loading: true,
        data: null,
        refetch: fetchFeeds
      }
    })

    const initialValues = {
      identifier: 'test-id',
      type: 'AzureArtifacts' as ArtifactType,
      spec: {
        versionType: '',
        scope: Scope.PROJECT,
        project: 'sample-k8s-manifests',
        feed: 'feedproject',
        packageType: 'Maven',
        package: 'test',
        version: '1'
      }
    }

    const { container } = render(
      <TestWrapper>
        <AzureArtifacts key={'key'} initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    expect(container).toMatchSnapshot()
    const feedDropDwmBtn = container.querySelectorAll('[data-icon="chevron-down"]')[2]

    userEvent.click(feedDropDwmBtn!)

    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')

    const loadingBucketsOption = await findByText(selectListMenu as HTMLElement, 'common.loadingFieldOptions')
    expect(loadingBucketsOption).toBeDefined()
    await waitFor(() => expect(fetchFeeds).toHaveBeenCalledTimes(1))
  })

  test('clicking on package name dropdown', async () => {
    jest.spyOn(cdng, 'useListPackagesForAzureArtifacts').mockImplementation((): any => {
      return {
        loading: true,
        data: null,
        refetch: fetchPackages
      }
    })
    const { container } = render(
      <TestWrapper>
        <AzureArtifacts key={'key'} initialValues={editValues as any} {...props} />
      </TestWrapper>
    )

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)
    expect(container).toMatchSnapshot()
    const packageDropdwnBtn = container.querySelectorAll('[data-icon="chevron-down"]')[4]
    userEvent.click(packageDropdwnBtn!)

    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')

    const loadingBucketsOption = await findByText(selectListMenu as HTMLElement, 'common.loadingFieldOptions')
    expect(loadingBucketsOption).toBeDefined()
    await waitFor(() => expect(fetchPackages).toHaveBeenCalledTimes(1))
  })

  test('should throw validation error for version when it is not a runtime input', async () => {
    const versionVals = {
      ...editValues,

      spec: {
        ...editValues.spec,
        version: ''
      }
    }
    const { container } = render(
      <TestWrapper>
        <AzureArtifacts key={'key'} initialValues={versionVals as any} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    await act(async () => {
      const submitBtn = container.querySelector('button[type="submit"]')!

      fireEvent.click(submitBtn)
    })
    expect(container).toMatchSnapshot()
  })

  test('when scope is changed to org', () => {
    const orgValues = {
      identifier: 'test-id',
      type: 'AzureArtifacts' as ArtifactType,
      spec: {
        versionType: '',
        scope: Scope.ORG,
        feed: 'feedproject',
        packageType: 'Maven',
        package: 'test',
        version: '1',
        versionRegex: ''
      }
    }

    const { container } = render(
      <TestWrapper>
        <AzureArtifacts key={'key'} initialValues={orgValues as any} {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('shows validation error on submit when form is empty', async () => {
    const errorVals = {
      identifier: '',
      spec: {
        versionType: '',
        scope: Scope.ORG,
        project: '',
        feed: '',
        packageType: 'Maven',
        package: '',
        version: '',
        versionRegex: ''
      },

      type: 'AzureArtifacts' as ArtifactType
    }

    const { container } = render(
      <TestWrapper>
        <AzureArtifacts key={'key'} initialValues={errorVals as any} {...props} />
      </TestWrapper>
    )

    await act(async () => {
      const submitBtn = container.querySelector('button[type="submit"]')!

      fireEvent.click(submitBtn)
    })
    expect(container).toMatchSnapshot()
  })

  test('shows validation error on submit when form is empty, when scope is project', async () => {
    const errorVals = {
      identifier: '',
      spec: {
        versionType: '',
        scope: Scope.PROJECT,
        project: '',
        feed: '',
        packageType: 'Maven',
        package: '',
        version: '',
        versionRegex: ''
      },

      type: 'AzureArtifacts' as ArtifactType
    }

    const { container } = render(
      <TestWrapper>
        <AzureArtifacts key={'key'} initialValues={errorVals as any} {...props} />
      </TestWrapper>
    )

    await act(async () => {
      const submitBtn = container.querySelector('button[type="submit"]')!

      fireEvent.click(submitBtn)
    })
    expect(container).toMatchSnapshot()
  })
})
