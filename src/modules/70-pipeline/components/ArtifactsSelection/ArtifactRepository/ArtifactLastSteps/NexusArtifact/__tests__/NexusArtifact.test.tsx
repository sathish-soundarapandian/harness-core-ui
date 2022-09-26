/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import {
  ArtifactType,
  Nexus2InitialValuesType,
  RepositoryPortOrServer,
  TagTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { Nexus3Artifact } from '../NexusArtifact'

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
  selectedArtifact: 'Nexus3Registry' as ArtifactType,
  selectedDeploymentType: ServiceDeploymentType.Kubernetes
}

jest.mock('services/cd-ng', () => ({
  useGetBuildDetailsForNexusArtifact: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
const initialValues: Nexus2InitialValuesType = {
  identifier: '',
  tagType: TagTypes.Value,
  tag: '',
  tagRegex: '',
  repository: '',
  spec: {
    artifactPath: '',
    repositoryPortorRepositoryURL: RepositoryPortOrServer.RepositoryUrl,
    repositoryUrl: '',
    repositoryPort: ''
  }
} as Nexus2InitialValuesType

describe('Nexus Artifact tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <Nexus3Artifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test(`tag is disabled if imagepath and repository is empty`, () => {
    const { container } = render(
      <TestWrapper>
        <Nexus3Artifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const tagInput = container.querySelector('input[name="tag"]')
    expect(tagInput).toBeDisabled()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip(`unable to submit the form when either of imagename, repository and repositoryUrl are empty`, async () => {
    const { container } = render(
      <TestWrapper>
        <Nexus3Artifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    const repositoryRequiredErr = await findByText(container, 'common.git.validation.repoRequired')
    expect(repositoryRequiredErr).toBeDefined()

    const dockerRepositoryRequiredErr = await findByText(
      container,
      'pipeline.artifactsSelection.validation.repositoryUrl'
    )
    expect(dockerRepositoryRequiredErr).toBeDefined()

    const imagePathRequiredErr = await findByText(container, 'pipeline.artifactsSelection.validation.artifactPath')
    expect(imagePathRequiredErr).toBeDefined()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip(`get RepositoryPort error, when repositoryPortorRepositoryURL is of type Repository port`, async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Nexus3Artifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    const imagePathRequiredErr = await findByText(container, 'pipeline.artifactsSelection.validation.artifactPath')
    expect(imagePathRequiredErr).toBeDefined()

    const repositoryRequiredErr = await findByText(container, 'common.git.validation.repoRequired')
    expect(repositoryRequiredErr).toBeDefined()

    const repositoryUrl = getByText('repositoryUrlLabel')
    expect(repositoryUrl).toBeDefined()

    fireEvent.click(getByText('Repository Port'))
    const repositoryPort = getByText('pipeline.artifactsSelection.repositoryPort')
    expect(repositoryPort).toBeDefined()
    fireEvent.click(submitBtn)

    const repositoryPortRequiredErr = await findByText(
      container,
      'pipeline.artifactsSelection.validation.repositoryPort'
    )
    expect(repositoryPortRequiredErr).toBeDefined()
  })

  test(`able to submit form when the form is non empty`, async () => {
    const { container } = render(
      <TestWrapper>
        <Nexus3Artifact key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    const repositoryRequiredErr = await findByText(container, 'common.git.validation.repoRequired')
    expect(repositoryRequiredErr).toBeDefined()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('spec.artifactPath')!, { target: { value: 'artifact-path' } })
      fireEvent.change(queryByNameAttribute('repository')!, { target: { value: 'repository' } })
      fireEvent.change(queryByNameAttribute('spec.repositoryUrl')!, { target: { value: 'repositoryUrl' } })
    })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: '',
          repository: 'repository',
          tag: '<+input>',
          repositoryFormat: 'docker',
          spec: {
            artifactPath: 'artifact-path',
            repositoryUrl: 'repositoryUrl'
          }
        }
      })
    })
  })

  test(`form renders correctly in Edit Case`, async () => {
    const filledInValues: Nexus2InitialValuesType = {
      identifier: 'nexusSidecarId',
      tagType: TagTypes.Value,
      tag: 'tag',
      tagRegex: '',
      repository: 'repository-name',
      spec: {
        repositoryPort: undefined,
        artifactPath: 'nexus-artifactpath',
        repositoryUrl: 'repositoryUrl'
      }
    } as Nexus2InitialValuesType

    const { container } = render(
      <TestWrapper>
        <Nexus3Artifact key={'key'} initialValues={filledInValues} {...props} />
      </TestWrapper>
    )
    const repositoryField = container.querySelector('input[name="repository"]')
    expect(repositoryField).not.toBeNull()
    expect(container.querySelector('input[name="spec.artifactPath"]')).not.toBeNull()
    expect(container.querySelector('input[name="tag"]')).not.toBeNull()
    expect(container.querySelector('input[name="spec.repositoryUrl"]')).not.toBeNull()

    expect(container).toMatchSnapshot()
  })

  test(`submits correctly with repositoryPort value`, async () => {
    const defaultValues: Nexus2InitialValuesType = {
      identifier: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: '',
      repository: '',
      spec: {
        artifactPath: '',
        repositoryPortorRepositoryURL: RepositoryPortOrServer.RepositoryPort,
        repositoryUrl: '',
        repositoryPort: ''
      }
    } as Nexus2InitialValuesType
    const { container, getByText } = render(
      <TestWrapper>
        <Nexus3Artifact key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    const repositoryRequiredErr = await findByText(container, 'common.git.validation.repoRequired')
    expect(repositoryRequiredErr).toBeDefined()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('spec.artifactPath')!, { target: { value: 'artifact-path' } })
      fireEvent.change(queryByNameAttribute('repository')!, { target: { value: 'repository' } })
      fireEvent.change(queryByNameAttribute('spec.repositoryUrl')!, { target: { value: 'repositoryUrl' } })
    })
    fireEvent.click(getByText('Repository Port'))
    const repositoryPort = getByText('pipeline.artifactsSelection.repositoryPort')
    expect(repositoryPort).toBeDefined()

    await act(async () => {
      fireEvent.change(queryByNameAttribute('spec.repositoryPort')!, { target: { value: 'repositoryPort' } })
    })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: '',
          repository: 'repository',
          tag: '<+input>',
          repositoryFormat: 'docker',
          spec: {
            artifactPath: 'artifact-path',
            repositoryPort: 'repositoryPort'
          }
        }
      })
    })
    await waitFor(() => expect(container.querySelector('input[name="repository"]')).toHaveValue('repository'))
    await waitFor(() => expect(container.querySelector('input[name="spec.artifactPath"]')).toHaveValue('artifact-path'))
  })

  test(`submits correctly with tagRegex data`, async () => {
    const defaultValues: Nexus2InitialValuesType = {
      identifier: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: '',
      repository: '',
      spec: {
        artifactPath: '',
        repositoryPortorRepositoryURL: RepositoryPortOrServer.RepositoryPort,
        repositoryUrl: '',
        repositoryPort: ''
      }
    } as Nexus2InitialValuesType
    const { container, getByText } = render(
      <TestWrapper>
        <Nexus3Artifact key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    const repositoryRequiredErr = await findByText(container, 'common.git.validation.repoRequired')
    expect(repositoryRequiredErr).toBeDefined()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      await fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      await fireEvent.change(queryByNameAttribute('spec.artifactPath')!, { target: { value: 'artifact-path' } })
      await fireEvent.change(queryByNameAttribute('repository')!, { target: { value: 'repository' } })
      await fireEvent.change(queryByNameAttribute('spec.repositoryUrl')!, { target: { value: 'repositoryUrl' } })
    })
    expect(container).toMatchSnapshot()
    fireEvent.click(getByText('Regex'))
    const tagRegexConatiner = getByText('tagRegex')
    expect(tagRegexConatiner).toBeDefined()

    await act(async () => {
      fireEvent.change(queryByNameAttribute('tagRegex')!, { target: { value: 'tagRegex' } })
    })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: '',
          repository: 'repository',
          tagRegex: '<+input>',
          repositoryFormat: 'docker',
          spec: {
            artifactPath: 'artifact-path',
            repositoryUrl: 'repositoryUrl'
          }
        }
      })
    })
    await waitFor(() => expect(container.querySelector('input[name="repository"]')).toHaveValue('repository'))
    await waitFor(() => expect(container.querySelector('input[name="spec.artifactPath"]')).toHaveValue('artifact-path'))
  })
})
