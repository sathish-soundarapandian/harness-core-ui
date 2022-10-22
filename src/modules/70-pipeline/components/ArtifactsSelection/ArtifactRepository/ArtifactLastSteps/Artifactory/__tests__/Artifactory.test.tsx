/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import * as pipelineng from 'services/cd-ng'
import Artifactory from '../Artifactory'
import {
  azureWebAppDeploymentTypeProps,
  dockerArtifactoryInitialValues,
  genericArtifactoryInitialValues,
  emptyRepoMockData,
  props,
  repoMock,
  serverlessDeploymentTypeProps,
  useGetRepositoriesDetailsForArtifactoryError,
  useGetRepositoriesDetailsForArtifactoryFailure,
  sshDeploymentTypeProps,
  winRmDeploymentTypeProps
} from './mock'

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useGetBuildDetailsForArtifactoryArtifact: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetRepositoriesDetailsForArtifactory: jest.fn().mockReturnValue({
    data: {
      repositories: {
        iistest: 'iistest',
        'harness-nuget': 'harness-nuget'
      }
    },
    refetch: jest.fn(),
    error: null,
    loading: false
  })
}))

const initialValues = {
  identifier: '',
  artifactPath: '',
  tag: '',
  tagType: TagTypes.Value,
  tagRegex: '',
  repository: '',
  repositoryUrl: ''
}

const runtimeInitialValues = {
  spec: {
    artifactDirectory: '/',
    artifactPath: '<+input>',
    connectorRef: 'connector',
    repositoryFormat: 'generic',
    repository: RUNTIME_INPUT_VALUE
  },
  type: 'ArtifactoryRegistry'
}

describe('Nexus Artifact tests', () => {
  beforeEach(() => {
    jest.spyOn(pipelineng, 'useGetRepositoriesDetailsForArtifactory').mockImplementation((): any => {
      return {
        loading: false,
        data: repoMock,
        refetch: jest.fn()
      }
    })
  })

  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )

    expect(container.querySelector('input[name="repositoryFormat"]')!).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test(`tag is disabled if imagepath and repository is empty`, () => {
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const tagInput = container.querySelector('input[name="tag"]')
    expect(tagInput).toBeDisabled()
  })
  test(`unable to submit the form when either of imagename, repository are empty`, async () => {
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)

    const repositoryRequiredErr = await findByText(container, 'common.git.validation.repoRequired')
    expect(repositoryRequiredErr).toBeDefined()

    const imagePahRequiredErr = await findByText(container, 'pipeline.artifactsSelection.validation.artifactPath')
    expect(imagePahRequiredErr).toBeDefined()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip(`able to submit form when the form is non empty`, async () => {
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    const repositoryRequiredErr = await findByText(container, 'common.git.validation.repoRequired')
    expect(repositoryRequiredErr).toBeDefined()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('repository')!, {
        target: { value: '<+input>' }
      })
    })
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: '',
          repository: '<+input>',
          artifactPath: '<+input>',
          tag: '<+input>',
          repositoryFormat: 'docker'
        }
      })
    })
  })

  test(`form renders correctly in Edit Case`, async () => {
    const filledInValues = {
      identifier: 'nexusSidecarId',
      artifactPath: 'nexus-imagepath',
      tagType: TagTypes.Value,
      tag: 'tag',
      tagRegex: '',
      repository: 'repository-name',
      repositoryUrl: 'repositoryUrl'
    }
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={filledInValues} {...props} />
      </TestWrapper>
    )
    const repositoryField = container.querySelector('input[name="repository"]')
    expect(repositoryField).not.toBeNull()
    expect(container.querySelector('input[name="artifactPath"]')).not.toBeNull()
    expect(container.querySelector('input[name="repositoryUrl"]')).not.toBeNull()

    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip(`submits correctly with tagregex data`, async () => {
    const defaultValues = {
      identifier: '',
      artifactPath: '',
      tag: '',
      tagType: TagTypes.Value,
      tagRegex: '',
      repository: '',
      repositoryUrl: ''
    }
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={defaultValues} {...props} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    const repositoryRequiredErr = await findByText(container, 'common.git.validation.repoRequired')
    expect(repositoryRequiredErr).toBeDefined()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('artifactPath')!, {
        target: { value: { label: 'artifact-path', value: 'artifact-path' } }
      })
      fireEvent.change(queryByNameAttribute('repository')!, {
        target: { value: { label: 'repository', value: 'repository' } }
      })
      fireEvent.change(queryByNameAttribute('repositoryUrl')!, { target: { value: 'repositoryUrl' } })
    })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: '',
          artifactPath: { label: 'artifact-path', value: 'artifact-path' },
          repository: { label: 'repository', value: 'repository' },
          tag: '<+input>',
          repositoryUrl: 'repositoryUrl',
          repositoryFormat: 'docker'
        }
      })
    })
    await waitFor(() => expect(container.querySelector('input[name="repository"]')).toHaveValue('repository'))
    await waitFor(() => expect(container.querySelector('input[name="artifactPath"]')).toHaveValue('artifact-path'))
    await waitFor(() => expect(container.querySelector('input[name="repositoryUrl"]')).toHaveValue('repositoryUrl'))
  })
})

describe('Serverless artifact', () => {
  test(`renders serverlessArtifactRepository`, () => {
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...serverlessDeploymentTypeProps} />
      </TestWrapper>
    )

    expect(container.querySelector('input[name="repositoryFormat"]')!).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test(`ServerlessArtifactoryRepository while fetching repository list`, () => {
    jest.spyOn(pipelineng, 'useGetRepositoriesDetailsForArtifactory').mockImplementation((): any => {
      return {
        loading: true,
        data: repoMock,
        refetch: jest.fn()
      }
    })
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...serverlessDeploymentTypeProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`ServerlessArtifactoryRepository with status as error`, async () => {
    jest.spyOn(pipelineng, 'useGetRepositoriesDetailsForArtifactory').mockImplementation((): any => {
      return {
        loading: false,
        data: emptyRepoMockData,
        error: useGetRepositoriesDetailsForArtifactoryError,
        refetch: jest.fn()
      }
    })
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...serverlessDeploymentTypeProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const repositoryField = getByPlaceholderText('Search...')
    expect(repositoryField).toBeTruthy()
    userEvent.click(repositoryField)
    const errorText = await findPopoverContainer()?.querySelector('.StyledProps--main')?.innerHTML
    await waitFor(() => expect(errorText).toEqual('error'))
  })

  test(`ServerlessArtifactoryRepository with status as failure`, async () => {
    jest.spyOn(pipelineng, 'useGetRepositoriesDetailsForArtifactory').mockImplementation((): any => {
      return {
        loading: false,
        error: useGetRepositoriesDetailsForArtifactoryFailure,
        refetch: jest.fn()
      }
    })
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...serverlessDeploymentTypeProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const repositoryField = getByPlaceholderText('Search...')
    expect(repositoryField).toBeTruthy()
  })

  test(`ServerlessArtifactoryRepository with empty repo list`, async () => {
    jest.spyOn(pipelineng, 'useGetRepositoriesDetailsForArtifactory').mockImplementation((): any => {
      return {
        loading: false,
        data: emptyRepoMockData,
        refetch: jest.fn()
      }
    })
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...serverlessDeploymentTypeProps} />
      </TestWrapper>
    )

    const repositoryField = getByPlaceholderText('Search...')
    expect(repositoryField).toBeTruthy()
    userEvent.click(repositoryField)
  })

  test(`ServerlessArtifactoryRepository with repository as runtime`, () => {
    jest.spyOn(pipelineng, 'useGetRepositoriesDetailsForArtifactory').mockImplementation((): any => {
      return {
        loading: false,
        refetch: jest.fn()
      }
    })

    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={runtimeInitialValues as any} {...serverlessDeploymentTypeProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('Azure web app artifact', () => {
  test(`renders Generic Artifactory view by default`, () => {
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={genericArtifactoryInitialValues} {...azureWebAppDeploymentTypeProps} />
      </TestWrapper>
    )

    const repositoryFormat = getByPlaceholderText('- Select -')
    expect(repositoryFormat!).toBeDefined()
    expect(repositoryFormat!).toHaveAttribute('value', 'Generic')

    const artifactDirectory = container.querySelector('input[name="artifactDirectory"]')
    expect(artifactDirectory!).toBeDefined()

    const repositoryUrl = container.querySelector('input[name="repositoryUrl"]')
    expect(repositoryUrl!).toBeNull()
  })

  test(`renders Docker Artifactory view`, () => {
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={dockerArtifactoryInitialValues} {...azureWebAppDeploymentTypeProps} />
      </TestWrapper>
    )

    const repositoryFormat = getByPlaceholderText('- Select -')
    expect(repositoryFormat!).toBeDefined()

    const artifactDirectory = container.querySelector('input[name="artifactDirectory"]')
    expect(artifactDirectory!).toBeNull()

    const repositoryUrl = container.querySelector('input[name="repositoryUrl"]')
    expect(repositoryUrl!).toBeDefined()
  })
})

describe('SSH artifactory artifact', () => {
  beforeEach(() => {
    jest.spyOn(pipelineng, 'useGetRepositoriesDetailsForArtifactory').getMockImplementation()
  })

  test(`renders Generic Artifactory view by default`, () => {
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={genericArtifactoryInitialValues} {...sshDeploymentTypeProps} />
      </TestWrapper>
    )

    const repositoryFormat = getByPlaceholderText('- Select -')
    expect(repositoryFormat!).toBeDefined()
    expect(repositoryFormat!).toHaveAttribute('value', 'Generic')

    const artifactDirectory = container.querySelector('input[name="artifactDirectory"]')
    expect(artifactDirectory!).toBeDefined()

    const repositoryUrl = container.querySelector('input[name="repositoryUrl"]')
    expect(repositoryUrl!).toBeNull()

    const repository = container.querySelector('input[name="repository"]')
    expect(repository).toHaveAttribute('placeholder', 'Search...')

    userEvent.click(repository!)

    expect(pipelineng.useGetRepositoriesDetailsForArtifactory).toBeCalled()
  })

  test(`renders Docker Artifactory view`, () => {
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={dockerArtifactoryInitialValues} {...sshDeploymentTypeProps} />
      </TestWrapper>
    )

    const repositoryFormat = getByPlaceholderText('- Select -')
    expect(repositoryFormat!).toBeDefined()

    const artifactDirectory = container.querySelector('input[name="artifactDirectory"]')
    expect(artifactDirectory!).toBeNull()

    const repositoryUrl = container.querySelector('input[name="repositoryUrl"]')
    expect(repositoryUrl!).toBeDefined()

    const repository = container.querySelector('input[name="repository"]')
    expect(repository!).toBeDefined()
  })
})

describe('WinRm artifactory artifact', () => {
  beforeEach(() => {
    jest.spyOn(pipelineng, 'useGetRepositoriesDetailsForArtifactory').getMockImplementation()
  })

  test(`renders Generic Artifactory view by default`, async () => {
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={genericArtifactoryInitialValues} {...winRmDeploymentTypeProps} />
      </TestWrapper>
    )

    const repositoryFormat = getByPlaceholderText('- Select -')
    expect(repositoryFormat!).toBeDefined()
    expect(repositoryFormat!).toHaveAttribute('value', 'Generic')

    const artifactDirectory = container.querySelector('input[name="artifactDirectory"]')
    expect(artifactDirectory!).toBeDefined()

    const repositoryUrl = container.querySelector('input[name="repositoryUrl"]')
    expect(repositoryUrl!).toBeNull()

    const repository = container.querySelector('input[name="repository"]')
    expect(repository).toHaveAttribute('placeholder', 'Search...')

    userEvent.click(repository!)

    expect(pipelineng.useGetRepositoriesDetailsForArtifactory).toBeCalled()
  })

  test(`renders Docker Artifactory view`, async () => {
    const { container, getByPlaceholderText } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={dockerArtifactoryInitialValues} {...winRmDeploymentTypeProps} />
      </TestWrapper>
    )

    const repositoryFormat = getByPlaceholderText('- Select -')
    expect(repositoryFormat!).toBeDefined()

    const artifactDirectory = container.querySelector('input[name="artifactDirectory"]')
    expect(artifactDirectory!).toBeNull()

    const repositoryUrl = container.querySelector('input[name="repositoryUrl"]')
    expect(repositoryUrl!).toBeDefined()

    const repository = container.querySelector('input[name="repository"]')
    expect(repository!).toBeDefined()
  })
})
