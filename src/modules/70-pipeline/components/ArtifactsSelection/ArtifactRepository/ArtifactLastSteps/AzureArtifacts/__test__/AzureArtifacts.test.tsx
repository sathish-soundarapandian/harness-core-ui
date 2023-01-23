/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'

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
    return { data: [], error: null, loading: false }
  }),
  useListPackagesForAzureArtifacts: jest.fn().mockImplementation(() => {
    return { data: [], error: null, loading: false }
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
    const projectDropdownBtn = container.querySelector('[data-id=project-2] .bp3-icon-chevron-down')

    userEvent.click(projectDropdownBtn!)

    expect(portalDivs.length).toBe(1)
    await waitFor(() => expect(fetchProjects).toHaveBeenCalledTimes(1))
  })
})
