/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, act, findByText, queryByAttribute } from '@testing-library/react'

import { TagTypes } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { TestWrapper } from '@common/utils/testUtils'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

import Artifactory from '../Artifactory'
import { props, serverlessDeploymentTypeProps } from './mock'
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

describe('artifactory submit flow', () => {
  test('on focus of dropdown api is success and fetches the values right', async () => {
    const { container } = render(
      <TestWrapper>
        <Artifactory key={'key'} initialValues={initialValues} {...serverlessDeploymentTypeProps} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const portal = document.getElementsByClassName('bp3-portal')
    const repositoryDropDownButton = container.querySelectorAll('[data-icon="chevron-down"]')[0]
    fireEvent.click(repositoryDropDownButton!)

    const dropdownPortalDiv = portal[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    const selectItem = await findByText(selectListMenu as HTMLElement, 'harness-nuget')
    act(() => {
      fireEvent.click(selectItem)
    })
    const repositorySelect = queryByNameAttribute('repository') as HTMLInputElement
    expect(repositorySelect.value).toBe('harness-nuget')

    await act(async () => {
      fireEvent.change(queryByNameAttribute('artifactDirectory')!, { target: { value: 'testDirectory' } })
    })

    expect(queryByNameAttribute('artifactDirectory')).toHaveValue('testDirectory')
  })

  test('render form when repoformat is generic and has fixed inputs', async () => {
    const formVals = {
      identifier: 'testidentifier',
      type: 'ArtifactoryRegistry',
      spec: {
        connectorRef: 'test',
        artifactPath: 'test',
        tag: 'test-tag',
        repository: { label: 'iistest', value: 'iistest' },
        artifactDirectory: 'test-directory',
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
          artifactDirectory: 'test-directory',
          artifactPath: 'test',
          repository: 'iistest',

          repositoryFormat: 'generic',
          repositoryUrl: 'test'
        }
      })
    })
  })
})
