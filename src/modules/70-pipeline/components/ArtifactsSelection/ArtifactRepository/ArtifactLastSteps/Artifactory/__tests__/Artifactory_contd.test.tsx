/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'

import { TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { TestWrapper } from '@common/utils/testUtils'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

import Artifactory from '../Artifactory'
import { props, winRmDeploymentTypeProps } from './mock'

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useGetBuildDetailsForArtifactoryArtifact: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useGetRepositoriesDetailsForArtifactory: jest.fn().mockReturnValue({
    data: {},
    refetch: jest.fn(),
    error: null,
    loading: false
  })
}))

describe('artifactory test cases', () => {
  test('render form correctly when tagType is regex', async () => {
    const artifactInitValues = {
      spec: {
        artifactPath: 'path',
        tagType: TagTypes.Regex,
        tagRegex: '<+input>',
        artifactPathFilter: 'test'
      },

      type: 'ArtifactoryRegistry',

      identifier: '',

      repository: 'repo',
      repositoryUrl: 'url',
      repositoryFormat: 'docker'
    }
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={artifactInitValues as any} {...winRmDeploymentTypeProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`able to submit form when the form is non empty`, async () => {
    const formVals = {
      identifier: 'testidentifier',
      type: 'ArtifactoryRegistry',
      spec: {
        connectorRef: ' <+input>',
        artifactPath: '<+input>',
        tag: '<+input>',
        repository: '<+input>',
        repositoryUrl: 'test',
        repositoryFormat: 'docker',
        tagType: TagTypes.Value
      }
    } as any
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={formVals} {...props} selectedArtifact={'ArtifactoryRegistry'} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
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
          repositoryFormat: 'docker',
          repositoryUrl: 'test'
        }
      })
    })
  })

  test('render form when repoformat is generic', async () => {
    const formVals = {
      identifier: 'testidentifier',
      type: 'ArtifactoryRegistry',
      spec: {
        connectorRef: ' <+input>',
        artifactPath: '<+input>',
        tag: '<+input>',
        repository: '<+input>',
        artifactDirectory: '<+input>',
        repositoryUrl: 'test',
        repositoryFormat: 'generic',
        tagType: TagTypes.Value
      }
    } as any

    const { container } = render(
      <TestWrapper>
        <Artifactory
          key={'key'}
          initialValues={formVals}
          {...props}
          selectedArtifact={'ArtifactoryRegistry'}
          selectedDeploymentType={ServiceDeploymentType.ServerlessAwsLambda}
        />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)

    expect(container).toMatchSnapshot()

    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: '',
          artifactDirectory: '<+input>',
          repository: '<+input>',
          artifactPath: '<+input>',
          repositoryFormat: 'generic',
          repositoryUrl: 'test'
        }
      })
    })
  })

  test('when deployment is azurewebapp', async () => {
    const formVals = {
      identifier: 'testidentifier',
      type: 'ArtifactoryRegistry',
      spec: {
        connectorRef: ' <+input>',
        artifactPath: '<+input>',
        tag: '<+input>',
        repository: '<+input>',
        artifactDirectory: '<+input>',
        repositoryUrl: 'test',
        repositoryFormat: 'generic',
        tagType: TagTypes.Value
      }
    } as any

    const { container } = render(
      <TestWrapper>
        <Artifactory
          key={'key'}
          initialValues={formVals}
          {...props}
          selectedArtifact={'ArtifactoryRegistry'}
          selectedDeploymentType={ServiceDeploymentType.AzureWebApp}
        />
      </TestWrapper>
    )

    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)

    expect(container).toMatchSnapshot()

    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'testidentifier',
        spec: {
          connectorRef: '',
          artifactDirectory: '<+input>',
          repository: '<+input>',
          artifactPath: '<+input>',
          repositoryFormat: 'generic',
          repositoryUrl: 'test'
        }
      })
    })
  })
})
