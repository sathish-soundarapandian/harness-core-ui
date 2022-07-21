/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as uuid from 'uuid'
import userEvent from '@testing-library/user-event'
import {
  act,
  fireEvent,
  queryByAttribute,
  render,
  waitFor,
  getByText as getElementByText
} from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import { Scope } from '@common/interfaces/SecretsInterface'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import ServerlessAwsLambdaManifest from '../ServerlessAwsLambdaManifest'

jest.mock('uuid')

const props = {
  stepName: 'Manifest details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  handleSubmit: jest.fn(),
  selectedManifest: 'ServerlessAwsLambda' as ManifestTypes,
  manifestIdsList: []
}
const initialValues = {
  identifier: '',
  branch: undefined,
  spec: {},
  type: ManifestDataType.ServerlessAwsLambda,
  commitId: undefined,
  gitFetchType: 'Branch'
}

describe('Manifest Details tests', () => {
  beforeEach(() => jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID'))

  test('initial rendering', () => {
    const { container } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when branch is runtime input', async () => {
    const defaultProps = {
      ...props,
      stepName: 'Manifest details',
      expressions: [],
      initialValues: {
        identifier: 'test',
        spec: {
          store: {
            spec: {
              branch: RUNTIME_INPUT_VALUE,
              connectorRef: 'connectorRef',
              paths: [],
              gitFetchType: 'Branch'
            }
          }
        },
        type: ManifestDataType.ServerlessAwsLambda
      },
      prevStepData: {
        connectorRef: 'connectorRef',
        store: 'Git'
      },
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    // Branch cog test
    const cogBranch = document.getElementById('configureOptions_branch')
    userEvent.click(cogBranch!)
    await waitFor(() => expect(getElementByText(document.body, 'common.configureOptions.regex')).toBeInTheDocument())
    const modals = document.getElementsByClassName('bp3-dialog')
    expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(1)
    const cogModal = modals[0] as HTMLElement
    const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
    userEvent.click(regexRadio)
    const regexTextArea = queryByAttribute('name', cogModal, 'regExValues')
    act(() => {
      fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
    })
    const cogSubmit = getElementByText(cogModal, 'submit')
    userEvent.click(cogSubmit)
    const branchInput = queryByAttribute('name', container, 'branch') as HTMLInputElement
    await waitFor(() => expect(branchInput.value).toBe('<+input>.regex(<+input>.includes(/test/))'))
  })

  test('when config override path is runtime input', async () => {
    const defaultProps = {
      ...props,
      stepName: 'Manifest details',
      expressions: [],
      initialValues: {
        identifier: 'test',
        spec: {
          store: {
            spec: {
              branch: RUNTIME_INPUT_VALUE,
              connectorRef: 'connectorRef',
              paths: [],
              gitFetchType: 'Branch'
            }
          },
          configOverridePath: RUNTIME_INPUT_VALUE
        },
        type: ManifestDataType.ServerlessAwsLambda
      },
      prevStepData: {
        connectorRef: 'connectorRef',
        store: 'Git'
      },
      handleSubmit: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...defaultProps} />
      </TestWrapper>
    )

    userEvent.click(getByText('advancedTitle'))

    const configOverridePathInput = queryByAttribute('name', container, 'configOverridePath') as HTMLInputElement
    expect(configOverridePathInput.value).toBe('<+input>')

    const cogConfigOverridePath = document.getElementById('configureOptions_configOverridePath')
    userEvent.click(cogConfigOverridePath!)

    await waitFor(() => expect(getElementByText(document.body, 'common.configureOptions.regex')).toBeInTheDocument())
    const modals = document.getElementsByClassName('bp3-dialog')
    expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(1)
    const cogModal = modals[0] as HTMLElement
    const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
    userEvent.click(regexRadio)
    const regexTextArea = queryByAttribute('name', cogModal, 'regExValues')
    act(() => {
      fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test.yaml/)' } })
    })
    const cogSubmit = getElementByText(cogModal, 'submit')
    userEvent.click(cogSubmit)

    await waitFor(() => expect(configOverridePathInput.value).toBe('<+input>.regex(<+input>.includes(/test.yaml/))'))
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
        <ServerlessAwsLambdaManifest {...props} prevStepData={prevStepData} initialValues={initialValues} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
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
          type: 'ServerlessAwsLambda',
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
            configOverridePath: undefined
          }
        }
      })
    })
  })

  test('renders form in edit mode', async () => {
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
        type: ManifestDataType.ServerlessAwsLambda,
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
      selectedManifest: 'ServerlessAwsLambda' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...defaultProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const backButton = getByText('back').parentElement
    userEvent.click(backButton!)
    await waitFor(() => expect(defaultProps.previousStep).toBeCalled())
    expect(defaultProps.previousStep).toHaveBeenCalledWith(defaultProps.prevStepData)
  })

  test('when prevStepData is not passed in props', async () => {
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
        type: ManifestDataType.ServerlessAwsLambda,
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
      selectedManifest: 'ServerlessAwsLambda' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...defaultProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const backButton = getByText('back').parentElement
    userEvent.click(backButton!)
    await waitFor(() => expect(defaultProps.previousStep).toBeCalled())
    expect(defaultProps.previousStep).toHaveBeenCalledWith(undefined)
    const submitButton = getElementByText(container, 'submit')
    userEvent.click(submitButton!)
  })

  test('when prevStepData is passed with connectorRef as Runtime input', async () => {
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
        type: ManifestDataType.ServerlessAwsLambda,
        spec: {
          store: {
            spec: {
              branch: 'testBranch',
              connectorRef: RUNTIME_INPUT_VALUE,
              gitFetchType: 'Branch',
              paths: ['test-path']
            },
            type: ManifestDataType.ServerlessAwsLambda
          }
        }
      },
      prevStepData: {
        connectorRef: RUNTIME_INPUT_VALUE,
        store: 'Git'
      },
      selectedManifest: 'ServerlessAwsLambda' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...defaultProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const backButton = getByText('back').parentElement
    userEvent.click(backButton!)
    await waitFor(() => expect(defaultProps.previousStep).toBeCalled())
    expect(defaultProps.previousStep).toHaveBeenCalledWith(defaultProps.prevStepData)
    const submitButton = getElementByText(container, 'submit')
    userEvent.click(submitButton!)
  })

  test('change Git Fetch Type value to Commit and submit', async () => {
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
        type: ManifestDataType.ServerlessAwsLambda,
        spec: {
          store: {
            spec: {
              branch: 'testBranch',
              gitFetchType: 'Branch',
              connectorRef: 'testConnectorRef',
              paths: ['test-path']
            },
            type: 'Github'
          }
        }
      },
      prevStepData: {
        store: 'Github',
        gitFetchType: 'Branch',
        branch: 'testBranch',
        selectedManifest: 'ServerlessAwsLambda' as ManifestTypes,
        paths: ['test-path'],
        connectorRef: {
          connector: {
            identifier: 'testConnectorRef',
            name: 'Test Conn Ref',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'testProject',
            type: 'Github',
            spec: {
              type: 'Repo'
            }
          },
          scope: 'Project',
          value: 'testConnectorRef'
        }
      },
      selectedManifest: 'ServerlessAwsLambda' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...defaultProps} />
      </TestWrapper>
    )

    // Click on gitFetchType dropdown and select Specific Commit Id / Git Tag option
    const gitFetchTypeInput = queryByAttribute('name', container, 'gitFetchType') as HTMLInputElement
    userEvent.click(gitFetchTypeInput)
    const specifiCommitIdOption = getByText('Specific Commit Id / Git Tag')
    await waitFor(() => expect(specifiCommitIdOption).toBeInTheDocument())
    userEvent.click(specifiCommitIdOption)
    await waitFor(() => expect(gitFetchTypeInput.value).toBe('Specific Commit Id / Git Tag'))

    // Click on Submit button without providing commitId value and check if proper validation error appears
    userEvent.click(getByText('submit').parentElement!)
    await waitFor(() => expect(getByText('validation.commitId')).toBeInTheDocument())

    // Provide commitId value
    const commitIdInput = container.querySelector('input[name="commitId"]') as HTMLInputElement
    act(() => {
      fireEvent.change(commitIdInput, { target: { value: 'abc123' } })
    })
    await waitFor(() => expect(commitIdInput.value).toBe('abc123'))

    // Advanced Section
    userEvent.click(getByText('advancedTitle'))
    const configOverridePathInput = queryByAttribute('name', container, 'configOverridePath') as HTMLInputElement
    act(() => {
      fireEvent.change(configOverridePathInput, { target: { value: 'serverless.yaml' } })
    })

    // Click on submit button and submit the form
    userEvent.click(getByText('submit').parentElement!)

    await waitFor(() => {
      expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1)
      expect(defaultProps.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'ServerlessAwsLambda',
          spec: {
            store: {
              spec: {
                connectorRef: 'testConnectorRef',
                gitFetchType: 'Commit',
                paths: ['test-path'],
                commitId: 'abc123'
              },
              type: 'Github'
            },
            configOverridePath: 'serverless.yaml'
          }
        }
      })
    })
  })

  test('renders form in edit mode - when gitfetchtype is Commit', () => {
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
        type: ManifestDataType.ServerlessAwsLambda,
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
      selectedManifest: 'ServerlessAwsLambda' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when gitfetchtype is Commit and commitId is Runtime input', () => {
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
        type: ManifestDataType.ServerlessAwsLambda,
        spec: {
          store: {
            spec: {
              commitId: RUNTIME_INPUT_VALUE,
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
      selectedManifest: 'ServerlessAwsLambda' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('runtime value for connector should make runtime for repo too', () => {
    const defaultProps = {
      stepName: 'Manifest details',
      expressions: [],
      allowableTypes: [
        MultiTypeInputType.FIXED,
        MultiTypeInputType.RUNTIME,
        MultiTypeInputType.EXPRESSION
      ] as AllowedTypesWithRunTime[],
      manifestIdsList: [],
      initialValues: {
        identifier: 'testidentifier',
        type: ManifestDataType.ServerlessAwsLambda,
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
      selectedManifest: 'ServerlessAwsLambda' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when connectionType is of repo', () => {
    const defaultProps = {
      manifestIdsList: [],
      stepName: 'Manifest details',
      expressions: [],
      allowableTypes: [
        MultiTypeInputType.FIXED,
        MultiTypeInputType.RUNTIME,
        MultiTypeInputType.EXPRESSION
      ] as AllowedTypesWithRunTime[],
      initialValues: {
        identifier: 'testidentifier',
        type: ManifestDataType.ServerlessAwsLambda,
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
      selectedManifest: 'ServerlessAwsLambda' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when scope is of account', () => {
    const defaultProps = {
      stepName: 'Manifest details',
      expressions: [],
      allowableTypes: [
        MultiTypeInputType.FIXED,
        MultiTypeInputType.RUNTIME,
        MultiTypeInputType.EXPRESSION
      ] as AllowedTypesWithRunTime[],
      manifestIdsList: [],
      initialValues: {
        identifier: 'testidentifier',
        type: ManifestDataType.ServerlessAwsLambda,
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
      selectedManifest: 'ServerlessAwsLambda' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
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
      selectedManifest: 'ServerlessAwsLambda' as ManifestTypes,
      handleSubmit: jest.fn()
    }

    const { container, getByText } = render(
      <TestWrapper>
        <ServerlessAwsLambdaManifest {...defaultProps} />
      </TestWrapper>
    )

    userEvent.click(getByText('advancedTitle'))
    expect(container).toMatchSnapshot()
  })
})
