/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as uuid from 'uuid'
import { render, fireEvent, act, queryByAttribute, waitFor } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import OpenShiftParamWithGit from '../OSWithGit'

jest.mock('uuid')

const props = {
  stepName: 'Manifest details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  manifestIdsList: [],
  initialValues: {
    identifier: 'test',
    spec: {},
    type: ManifestDataType.OpenshiftParam,
    branch: 'master',
    commitId: 'test-commit',
    gitFetchType: 'Branch',
    paths: ['test'],
    skipResourceVersioning: false,
    repoName: 'repo-test'
  },
  prevStepData: {
    connectorRef: 'connectorRef',
    store: 'Git'
  },
  handleSubmit: jest.fn()
}
describe('Open shift params with git tests', () => {
  beforeEach(() => jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID'))
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <OpenShiftParamWithGit {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('submits with right payload', async () => {
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
        <OpenShiftParamWithGit {...props} prevStepData={prevStepData} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
      fireEvent.change(queryByNameAttribute('repoName')!, { target: { value: 'repo-name' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'OpenshiftParam',
          spec: {
            store: {
              spec: {
                branch: 'testBranch',
                connectorRef: undefined,
                gitFetchType: 'Branch',
                paths: [''],
                repoName: 'repo-name'
              },
              type: 'Git'
            }
          }
        }
      })
    })
  })

  test('renders form in edit mode', () => {
    const defaultProps = {
      stepName: 'Manifest details',
      manifestIdsList: [],
      expressions: [],
      allowableTypes: [
        MultiTypeInputType.FIXED,
        MultiTypeInputType.RUNTIME,
        MultiTypeInputType.EXPRESSION
      ] as AllowedTypesWithRunTime[],
      initialValues: {
        identifier: 'testidentifier',
        type: ManifestDataType.OpenshiftParam,
        spec: {
          store: {
            spec: {
              branch: 'testBranch',
              commitId: undefined,
              connectorRef: '',
              gitFetchType: 'Branch',
              paths: [],
              repoName: ''
            },
            type: 'Git'
          }
        }
      },
      prevStepData: {
        store: 'Git'
      },
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <OpenShiftParamWithGit {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
