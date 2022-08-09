/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'
import userEvent from '@testing-library/user-event'
import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { FeatureFlag } from '@common/featureFlags'
import KustomizeWithGIT from '../KustomizeWithGIT'

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
describe('Kustomize with Git/ Github/Gitlab/Bitbucket tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      spec: {},
      type: ManifestDataType.Kustomize,
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      folderPath: '',
      skipResourceVersioning: false,
      repoName: '',
      pluginPath: ''
    }
    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('expand advanced section', () => {
    const initialValues = {
      identifier: '',
      spec: {},
      type: ManifestDataType.Kustomize,
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      folderPath: '',
      skipResourceVersioning: false,
      repoName: '',
      pluginPath: ''
    }
    const { container, getByText } = render(
      <TestWrapper>
        <KustomizeWithGIT {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    fireEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })

  test(`renders while adding step first time`, () => {
    const initialValues = {
      identifier: 'id2',
      branch: 'master',
      spec: {},
      type: ManifestDataType.Kustomize,
      gitFetchType: 'Branch',
      folderPath: '',
      skipResourceVersioning: false,
      repoName: '',
      pluginPath: ''
    }

    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly in edit case`, () => {
    const initialValues = {
      identifier: 'id12',
      commitId: 'awsd123sd',
      spec: {},
      type: ManifestDataType.Kustomize,
      gitFetchType: 'Commit',
      folderPath: './temp',
      skipResourceVersioning: true,
      repoName: 'someurl/repoName',
      pluginPath: ''
    }

    const { container } = render(
      <TestWrapper>
        <KustomizeWithGIT initialValues={initialValues} {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with the right payload when gitfetchtype is branch', async () => {
    const initialValues = {
      identifier: '',
      branch: undefined,
      spec: {},
      type: ManifestDataType.Kustomize,
      gitFetchType: '',
      folderPath: '',
      skipResourceVersioning: true,
      repoName: '',
      pluginPath: ''
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
        <KustomizeWithGIT initialValues={initialValues} {...props} prevStepData={prevStepData} />
      </TestWrapper>
    )
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier', container)!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType', container)!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch', container)!, { target: { value: 'testBranch' } })
      fireEvent.change(queryByNameAttribute('folderPath', container)!, { target: { value: 'test-path' } })
      fireEvent.change(queryByNameAttribute('pluginPath', container)!, { target: { value: 'plugin-path' } })
      fireEvent.change(queryByNameAttribute('repoName', container)!, { target: { value: 'repo-name' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'Kustomize',
          spec: {
            store: {
              spec: {
                branch: 'testBranch',
                connectorRef: undefined,
                gitFetchType: 'Branch',
                folderPath: 'test-path',
                repoName: 'repo-name'
              },
              type: 'Git'
            },
            pluginPath: 'plugin-path',
            skipResourceVersioning: false
          }
        }
      })
    })
  })

  test('renders "Optimized Kustomize Manifest Collection" checkbox when feature flag is enabled', async () => {
    const initialValues = {
      identifier: '',
      spec: {},
      type: ManifestDataType.Kustomize,
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      folderPath: '',
      skipResourceVersioning: false,
      repoName: '',
      pluginPath: ''
    }
    const { container, getByTestId } = render(
      <TestWrapper
        defaultFeatureFlagValues={{
          [FeatureFlag.NG_OPTIMIZE_FETCH_FILES_KUSTOMIZE]: true
        }}
      >
        <KustomizeWithGIT {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    await act(async () => userEvent.click(getByTestId('advancedTitle-summary')))
    expect(queryByNameAttribute('optimizedKustomizeManifestCollection', container)).toBeInTheDocument()
  })

  test('renders "Kustomize YAML Folder Path" input when feature flag is enabled and checkbox is selected', async () => {
    const initialValues = {
      identifier: '',
      spec: {},
      type: ManifestDataType.Kustomize,
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      folderPath: '',
      skipResourceVersioning: false,
      repoName: '',
      pluginPath: ''
    }
    const { container, getByTestId } = render(
      <TestWrapper
        defaultFeatureFlagValues={{
          [FeatureFlag.NG_OPTIMIZE_FETCH_FILES_KUSTOMIZE]: true
        }}
      >
        <KustomizeWithGIT {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    await act(async () => userEvent.click(getByTestId('advancedTitle-summary')))
    expect(queryByNameAttribute('kustomizeYamlFolderPath', container)).toBeNull()

    await act(async () =>
      userEvent.click(container.querySelector('input[name="optimizedKustomizeManifestCollection"]')!)
    )
    expect(queryByNameAttribute('kustomizeYamlFolderPath', container)).toBeInTheDocument()
  })
})
