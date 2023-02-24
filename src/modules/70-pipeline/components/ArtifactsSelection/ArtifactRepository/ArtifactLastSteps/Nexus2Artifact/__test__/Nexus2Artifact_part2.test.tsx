/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import {
  ArtifactType,
  Nexus2InitialValuesType,
  RepositoryPortOrServer,
  TagTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type { ResponseListNexusRepositories } from 'services/cd-ng'
import { Nexus2Artifact } from '../Nexus2Artifact'

const mockRepositoryResponse: UseGetMockDataWithMutateAndRefetch<ResponseListNexusRepositories> = {
  loading: true,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: undefined
}

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
  selectedArtifact: 'Nexus2Registry' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.Kubernetes
}

const initialValues: Nexus2InitialValuesType = {
  identifier: '',
  tagType: TagTypes.Value,
  tag: '<+input>',
  tagRegex: '',
  repository: 'repository',
  spec: {
    artifactPath: '',
    repositoryPortorRepositoryURL: RepositoryPortOrServer.RepositoryUrl,
    repositoryUrl: '',
    repositoryPort: ''
  }
} as Nexus2InitialValuesType

describe('Nexus Artifact tests - error handling case', () => {
  jest.mock('services/cd-ng', () => ({
    useGetBuildDetailsForNexusArtifact: jest.fn().mockImplementation(() => {
      return {
        data: {},
        refetch: jest.fn(),
        error: {
          message: 'test'
        },
        loading: false
      }
    })
  }))
  jest.mock('@common/hooks', () => ({
    ...(jest.requireActual('@common/hooks') as any),
    useMutateAsGet: jest.fn().mockImplementation(() => mockRepositoryResponse)
  }))
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('Nexus Artifact tests - api success flow', () => {
  beforeAll(() => {
    jest.clearAllMocks()
  })
  jest.mock('services/cd-ng', () => ({
    useGetBuildDetailsForNexusArtifact: jest.fn().mockImplementation(() => {
      return {
        data: {
          data: {
            buildDetailsList: []
          }
        },
        refetch: jest.fn(),
        error: null,
        loading: false
      }
    })
  }))
  jest.mock('@common/hooks', () => ({
    ...(jest.requireActual('@common/hooks') as any),
    useMutateAsGet: jest.fn().mockImplementation(() => mockRepositoryResponse)
  }))
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
