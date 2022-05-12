/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as uuid from 'uuid'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import { Scope } from '@common/interfaces/SecretsInterface'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import K8sValuesManifest from '../K8sValuesManifest'

jest.mock('uuid')

const props = {
  stepName: 'Manifest details',
  expressions: [],
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  handleSubmit: jest.fn(),
  selectedManifest: 'Values' as ManifestTypes,
  manifestIdsList: []
}
const initialValues = {
  identifier: '',
  branch: undefined,
  spec: {},
  type: ManifestDataType.K8sManifest,
  commitId: undefined,
  gitFetchType: 'Branch',
  folderPath: '',
  skipResourceVersioning: false,
  repoName: '',
  pluginPath: ''
}

describe('Manifest Details tests', () => {
  beforeEach(() => jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID'))

  test('initial rendering', () => {
    const { container } = render(
      <TestWrapper>
        <K8sValuesManifest {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when branch is runtime input', () => {
    const defaultProps = {
      ...props,
      stepName: 'Manifest details',
      expressions: [],
      initialValues: {
        identifier: 'test',

        branch: RUNTIME_INPUT_VALUE,

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
    const { container } = render(
      <TestWrapper>
        <K8sValuesManifest {...defaultProps} initialValues={initialValues} />
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
        <K8sValuesManifest {...props} prevStepData={prevStepData} initialValues={initialValues} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
      fireEvent.change(queryByNameAttribute('paths[0].path')!, { target: { value: 'test-path' } })
      fireEvent.change(queryByNameAttribute('repoName')!, { target: { value: 'repo-name' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledTimes(1)
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'Values',
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
      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
      initialValues: {
        identifier: 'testidentifier',
        type: ManifestDataType.K8sManifest,
        spec: {
          store: {
            spec: {
              branch: 'testBranch',
              commitId: undefined,
              connectorRef: '',
              gitFetchType: 'Branch',
              paths: ['test-path'],
              repoName: ''
            },
            type: undefined
          }
        }
      },
      prevStepData: {
        store: 'Git'
      },
      selectedManifest: 'Values' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <K8sValuesManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders form in edit mode - when gitfetchtype is commitid', () => {
    const defaultProps = {
      stepName: 'Manifest details',
      manifestIdsList: [],
      expressions: [],
      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
      initialValues: {
        identifier: 'testidentifier',
        type: ManifestDataType.K8sManifest,
        spec: {
          store: {
            spec: {
              commitId: 'test-commit',
              connectorRef: '',
              gitFetchType: 'Commit',
              paths: ['test-path'],
              repoName: ''
            },
            type: undefined
          }
        }
      },
      prevStepData: {
        store: 'Git'
      },
      selectedManifest: 'Values' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <K8sValuesManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('runtime value for connector should make runtime for repo too', () => {
    const defaultProps = {
      stepName: 'Manifest details',
      expressions: [],
      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
      manifestIdsList: [],
      initialValues: {
        identifier: 'testidentifier',
        type: ManifestDataType.K8sManifest,
        spec: {
          store: {
            spec: {
              commitId: 'test-commit',
              connectorRef: '',
              gitFetchType: 'Commit',
              paths: ['test-path'],
              repoName: ''
            },
            type: undefined
          }
        }
      },
      prevStepData: {
        store: 'Git',
        connectorRef: '<+input>'
      },
      selectedManifest: 'Values' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <K8sValuesManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when connectionType is of repo', () => {
    const defaultProps = {
      manifestIdsList: [],
      stepName: 'Manifest details',
      expressions: [],
      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
      initialValues: {
        identifier: 'testidentifier',
        type: ManifestDataType.K8sManifest,
        spec: {
          store: {
            spec: {
              commitId: 'test-commit',
              connectorRef: {
                label: 'test',
                value: 'test',
                scope: 'Account',
                connector: {
                  spec: {
                    connectionType: 'Repo'
                  }
                }
              },
              gitFetchType: 'Commit',
              paths: ['test-path'],
              repoName: ''
            },
            type: undefined
          }
        }
      },
      prevStepData: {
        store: 'Git',
        connectorRef: {
          label: 'test',
          value: 'test',
          scope: 'Account',
          connector: {
            spec: {
              connectionType: 'Repo'
            }
          }
        }
      },
      selectedManifest: 'Values' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <K8sValuesManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when scope is of account', () => {
    const defaultProps = {
      stepName: 'Manifest details',
      expressions: [],
      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
      manifestIdsList: [],
      initialValues: {
        identifier: 'testidentifier',
        type: ManifestDataType.K8sManifest,
        spec: {
          store: {
            spec: {
              commitId: 'test-commit',
              connectorRef: 'account.test',
              gitFetchType: 'Commit',
              paths: ['test-path'],
              repoName: ''
            },
            type: undefined
          }
        }
      },
      prevStepData: {
        store: 'Git',
        connectorRef: {
          label: 'test',
          value: 'test',
          scope: Scope.ACCOUNT,
          connector: {
            identifier: 'test'
          }
        }
      },
      selectedManifest: 'Values' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <K8sValuesManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when selected manifest is of type K8sManifest', async () => {
    const defaultProps = {
      ...props,
      prevStepData: {
        store: 'Git',
        connectorRef: {
          connector: {
            spec: {
              connectionType: 'Account',
              url: 'accounturl-test'
            }
          }
        }
      },
      initialValues,
      handleSubmit: jest.fn()
    }

    const { container } = render(
      <TestWrapper>
        <K8sValuesManifest {...defaultProps} />
      </TestWrapper>
    )
    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('gitFetchType')!, { target: { value: 'Branch' } })
      fireEvent.change(queryByNameAttribute('branch')!, { target: { value: 'testBranch' } })
      fireEvent.change(queryByNameAttribute('paths[0].path')!, { target: { value: 'test-path' } })
      fireEvent.change(queryByNameAttribute('repoName')!, { target: { value: 'repo-name' } })
    })
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledTimes(1)
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'Values',
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
            }
          }
        }
      })
    })
  })

  test('expand advanced section - when type is k8smanifest', () => {
    const defaultProps = {
      ...props,
      prevStepData: {
        store: 'Git',
        connectorRef: {
          label: 'test',
          value: 'test',
          scope: Scope.ACCOUNT,
          connector: {
            identifier: 'test'
          }
        }
      },
      initialValues,
      selectedManifest: 'K8sManifest' as ManifestTypes,
      handleSubmit: jest.fn()
    }

    const { container, getByText } = render(
      <TestWrapper>
        <K8sValuesManifest {...defaultProps} />
      </TestWrapper>
    )

    fireEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })
})
