/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, queryByAttribute, waitFor } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import HelmWithGIT from '../HelmWithGIT'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  handleSubmit: jest.fn(),
  manifestIdsList: []
}

jest.mock('services/cd-ng', () => ({
  useHelmCmdFlags: jest.fn().mockImplementation(() => ({ data: { data: ['Template'] }, refetch: jest.fn() }))
}))

describe('helm with GIT tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      gitFetchType: 'Branch',
      spec: {},
      type: ManifestDataType.HelmChart,
      branch: '',
      folderPath: '',
      helmVersion: '',
      repoName: '',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id' }]
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders while adding step first time`, () => {
    const initialValues = {
      identifier: '',
      gitFetchType: 'Branch',
      spec: {},
      type: ManifestDataType.HelmChart,
      branch: 'master',
      folderPath: './',
      helmVersion: 'V2',
      repoName: 'reponame',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id' }]
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('expand advanced section', () => {
    const initialValues = {
      identifier: '',
      gitFetchType: 'Branch',
      branch: 'master',
      spec: {},
      type: ManifestDataType.HelmChart,
      folderPath: './',
      helmVersion: 'V2',
      repoName: 'reponame',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: 'id' }]
    }

    const { container, getByText } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )

    fireEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly in edit case`, () => {
    const initialValues = {
      identifier: 'identifier',
      gitFetchType: 'Commit',
      commitId: 'sgdnkkjhhsfafaa',
      spec: {},
      type: ManifestDataType.HelmChart,
      folderPath: './',
      helmVersion: 'V2',
      repoName: 'reponame',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: 'Template', flag: 'flag', id: 'id' }]
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload when gitfetchtype is branch', async () => {
    const initialValues = {
      identifier: '',
      branch: '',
      gitFetchType: '',
      folderPath: './',
      spec: {},
      type: ManifestDataType.HelmChart,
      helmVersion: '',
      skipResourceVersioning: false,
      repoName: ''
    }

    const prevStepData = {
      connectorRef: {
        connector: {
          spec: {
            connectionType: 'Account',
            url: 'accounturl-test'
          }
        }
      },
      store: 'Git'
    }

    const { container } = render(
      <TestWrapper>
        <HelmWithGIT initialValues={initialValues} {...props} prevStepData={prevStepData} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
      fireEvent.change(queryByNameAttribute('folderPath')!, { target: { value: 'test-path' } })
      fireEvent.change(queryByNameAttribute('repoName')!, { target: { value: 'repo-name' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'HelmChart',
          spec: {
            store: {
              spec: {
                branch: 'testBranch',
                connectorRef: undefined,
                folderPath: 'test-path',
                gitFetchType: 'Branch',
                repoName: 'repo-name'
              },
              type: 'Git'
            },
            helmVersion: 'V2',
            skipResourceVersioning: false
          }
        }
      })
    })
  })
})
