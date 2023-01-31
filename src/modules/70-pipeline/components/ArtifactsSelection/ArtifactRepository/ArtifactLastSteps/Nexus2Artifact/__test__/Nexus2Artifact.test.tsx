/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, fireEvent, render } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import {
  ArtifactType,
  Nexus2InitialValuesType,
  TagTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { RepositoryFormatTypes, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type { ResponseListNexusRepositories } from 'services/cd-ng'
import { Nexus2Artifact } from '../Nexus2Artifact'

const mockRepositoryResponse: UseGetMockDataWithMutateAndRefetch<ResponseListNexusRepositories> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    status: 'SUCCESS',
    data: [
      { repositoryName: 'docker-group', repositoryId: 'docker-group' },
      { repositoryName: 'usheerdocker', repositoryId: 'usheerdocker' },
      { repositoryName: 'ken-test-docker', repositoryId: 'ken-test-docker' },
      { repositoryName: 'zee-repo', repositoryId: 'zee-repo' },
      { repositoryName: 'cdp-qa-automation-2', repositoryId: 'cdp-qa-automation-2' },
      { repositoryName: 'cdp-qa-automation-1', repositoryId: 'cdp-qa-automation-1' },
      { repositoryName: 'francisco-swat', repositoryId: 'francisco-swat' },
      { repositoryName: 'todolist', repositoryId: 'todolist' },
      { repositoryName: 'aleksadocker', repositoryId: 'aleksadocker' },
      { repositoryName: 'cdp-test-group1', repositoryId: 'cdp-test-group1' },
      { repositoryName: 'cdp-test-group2', repositoryId: 'cdp-test-group2' },
      { repositoryName: 'cdp-test-group3', repositoryId: 'cdp-test-group3' },
      { repositoryName: 'docker-private', repositoryId: 'docker-private' },
      { repositoryName: 'lukicm-test', repositoryId: 'lukicm-test' }
    ],
    correlationId: 'c938e28e-6359-481e-9e75-3141561c4186'
  }
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

jest.mock('services/cd-ng', () => ({
  useGetBuildDetailsForNexusArtifact: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => mockRepositoryResponse)
}))
const initialValues: Nexus2InitialValuesType = {
  identifier: '',
  tagType: TagTypes.Value,
  tag: '<+input>',
  tagRegex: '',
  repository: 'repository',
  spec: {
    artifactId: '',
    groupId: '',
    extension: '',
    classifier: ''
  }
} as Nexus2InitialValuesType

describe('Nexus Artifact tests', () => {
  // beforeEach(() => {
  //   // eslint-disable-next-line
  //   // @ts-ignore
  //   useMutateAsGet.mockImplementation(() => {
  //     return mockRepositoryResponse
  //   })
  // })
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render ui - when repository format type is maven', () => {
    const formValues = {
      ...initialValues,
      repositoryFormat: 'Maven'
    }
    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={formValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render ui - when repository format type is NPM', () => {
    const formValues = {
      ...initialValues,
      repositoryFormat: 'NPM'
    }
    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={formValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render ui - when repository format type is NuGet', () => {
    const formValues = {
      ...initialValues,
      repositoryFormat: 'NuGet'
    }
    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={formValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render ui - when repository format type is Raw', () => {
    const formValues = {
      ...initialValues,
      repositoryFormat: RepositoryFormatTypes.Raw
    }
    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={formValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when click submit - should throw validation error', async () => {
    const formValues = {
      ...initialValues,
      repositoryFormat: RepositoryFormatTypes.Raw
    }
    const { container } = render(
      <TestWrapper>
        <Nexus2Artifact key={'key'} initialValues={formValues} {...props} />
      </TestWrapper>
    )

    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)

    const repositoryRequiredErr = await findByText(container, 'common.git.validation.repoRequired')
    expect(repositoryRequiredErr).toBeDefined()

    const artifactRequiredErr = await findByText(container, 'pipeline.artifactsSelection.validation.artifactId')
    expect(artifactRequiredErr).toBeDefined()
  })
})
