/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// import { TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { TestWrapper } from '@common/utils/testUtils'
// import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

import Artifactory from '../Artifactory'
import { serverlessDeploymentTypeProps } from './mock'

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useGetBuildDetailsForArtifactoryArtifact: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: {
        message: 'failed to fetch'
      },
      loading: false
    }
  }),
  useGetRepositoriesDetailsForArtifactory: jest.fn().mockReturnValue({
    data: {
      data: {
        repositories: {
          iistest: 'iistest',
          'harness-nuget': 'harness-nuget'
        }
      }
    },
    refetch: jest.fn(),
    error: null,
    loading: true
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

describe('Artifactory tests for generic repository type', () => {
  beforeAll(() => {
    jest.clearAllMocks()
  })

  test('mock the error flow', async () => {
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...serverlessDeploymentTypeProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render when deployment type is ssh', async () => {
    const { container } = render(
      <TestWrapper>
        <Artifactory
          key={'key'}
          initialValues={initialValues}
          {...serverlessDeploymentTypeProps}
          selectedDeploymentType={ServiceDeploymentType.Ssh}
        />
      </TestWrapper>
    )

    const repositoryFormat = container.querySelector('input[name="repositoryFormat"]') as HTMLInputElement

    expect(repositoryFormat!).toHaveValue('Generic')

    userEvent.click(repositoryFormat)
    userEvent.click(screen.getByText('Docker'))
    expect(repositoryFormat!).toHaveValue('Docker')
  })
})
