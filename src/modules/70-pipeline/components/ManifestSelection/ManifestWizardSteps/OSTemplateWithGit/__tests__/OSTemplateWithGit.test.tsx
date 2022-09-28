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
import OpenShiftTemplateWithGit from '../OSTemplateWithGit'

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
describe('Open shift template with git tests', () => {
  test(`renders without crashing`, () => {
    const initialValues = {
      identifier: '',
      branch: '',
      spec: {},
      type: ManifestDataType.OpenshiftTemplate,
      commitId: '',
      gitFetchType: 'Branch',
      paths: [],
      skipResourceVersioning: false,
      repoName: ''
    }
    const { container } = render(
      <TestWrapper>
        <OpenShiftTemplateWithGit {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('expand advanced section', () => {
    const initialValues = {
      identifier: '',
      branch: '',
      spec: {},
      type: ManifestDataType.OpenshiftTemplate,
      commitId: '',
      gitFetchType: 'Branch',
      paths: [],
      skipResourceVersioning: false,
      repoName: ''
    }
    const { container, getByText } = render(
      <TestWrapper>
        <OpenShiftTemplateWithGit {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    fireEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })

  test(`renders correctly in edit case`, () => {
    const initialValues = {
      identifier: 'test',
      commitId: 'test-commit',
      spec: {},
      type: ManifestDataType.OpenshiftTemplate,
      gitFetchType: 'Commit',
      paths: ['test'],
      skipResourceVersioning: false,
      repoName: 'repo-test'
    }
    const { container } = render(
      <TestWrapper>
        <OpenShiftTemplateWithGit {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with right payload', async () => {
    const initialValues = {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      spec: {},
      type: ManifestDataType.OpenshiftTemplate,
      gitFetchType: 'Branch',
      paths: [],
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
        <OpenShiftTemplateWithGit {...props} initialValues={initialValues} prevStepData={prevStepData} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
      fireEvent.change(queryByNameAttribute('path')!, { target: { value: 'test-path' } })
      fireEvent.change(queryByNameAttribute('repoName')!, { target: { value: 'repo-name' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'OpenshiftTemplate',
          spec: {
            store: {
              spec: {
                branch: 'testBranch',
                connectorRef: undefined,
                gitFetchType: 'Branch',
                paths: ['test-path'],
                repoName: 'repo-name'
              },
              type: 'Git'
            },
            skipResourceVersioning: false
          }
        }
      })
    })
  })
})
