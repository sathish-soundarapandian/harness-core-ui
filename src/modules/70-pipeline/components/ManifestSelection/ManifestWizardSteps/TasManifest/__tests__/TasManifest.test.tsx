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
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import TasManifest from '../TasManifest'

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
  selectedManifest: 'TasManifest' as ManifestTypes,
  manifestIdsList: []
}
const initialValues = {
  identifier: '',
  branch: undefined,
  commitId: undefined,
  gitFetchType: 'Branch',
  spec: {},
  type: ManifestDataType.TasManifest,
  cfCliVersion: 'V7'
}

const validateRuntimeField = async (pathInput: HTMLInputElement, regexText = '') => {
  await waitFor(() => expect(getElementByText(document.body, 'common.configureOptions.regex')).toBeInTheDocument())
  const modals = document.getElementsByClassName('bp3-dialog')
  expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(1)
  const cogModal = modals[0] as HTMLElement
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  userEvent.click(regexRadio)
  const regexTextArea = queryByAttribute('name', cogModal, 'regExValues')
  act(() => {
    fireEvent.change(regexTextArea!, { target: { value: `<+input>.includes(/${regexText}/)` } })
  })
  const cogSubmit = getElementByText(cogModal, 'submit')
  userEvent.click(cogSubmit)

  await waitFor(() => expect(pathInput.value).toBe(`<+input>.regex(<+input>.includes(/${regexText}/))`))
  userEvent.click(cogSubmit)
}

describe('Manifest Details tests', () => {
  beforeEach(() => jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID'))

  test('when config varsPaths & autoScalerPath path is runtime input', async () => {
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
              paths: ['test-path'],
              gitFetchType: 'Branch'
            }
          },
          cfCliVersion: 'V7',
          varsPaths: RUNTIME_INPUT_VALUE,
          autoScalerPath: RUNTIME_INPUT_VALUE
        },
        type: ManifestDataType.TasManifest
      },
      prevStepData: {
        connectorRef: 'connectorRef',
        store: 'Git'
      },
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <TasManifest {...defaultProps} />
      </TestWrapper>
    )

    // Branch runtime test
    const branchInput = queryByAttribute('name', container, 'branch') as HTMLInputElement
    expect(branchInput.value).toBe('<+input>')
    const cogBranch = document.getElementById('configureOptions_branch')
    userEvent.click(cogBranch!)
    await validateRuntimeField(branchInput, 'test')

    const varsPathInput = queryByAttribute('name', container, 'varsPaths') as HTMLInputElement
    expect(varsPathInput.value).toBe('<+input>')

    const autoScalerPathInput = queryByAttribute('name', container, 'autoScalerPath') as HTMLInputElement
    expect(autoScalerPathInput.value).toBe('<+input>')

    const varsPath = document.getElementById('configureOptions_varsPaths')
    userEvent.click(varsPath!)
    await validateRuntimeField(varsPathInput, 'varTest.yaml')
    const autoScalerPath = document.getElementById('configureOptions_autoScalerPath')
    userEvent.click(autoScalerPath!)
    await validateRuntimeField(autoScalerPathInput, 'autoScaler.yaml')
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
        <TasManifest {...props} prevStepData={prevStepData} initialValues={initialValues} />
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
          type: 'TasManifest',
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
            cfCliVersion: 'V7',
            varsPaths: undefined,
            autoScalerPath: undefined
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
        type: ManifestDataType.TasManifest,
        spec: {
          cfCliVersion: 'V7',
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
      selectedManifest: 'TasManifest' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <TasManifest {...defaultProps} />
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
        type: ManifestDataType.TasManifest,
        spec: {
          cfCliVersion: 'V7',
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
          },
          varsPaths: ['var1Path', 'var2Path', 'var3Path'],
          autoScalerPath: ['autoScalerPath']
        }
      },
      selectedManifest: 'TasManifest' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <TasManifest {...defaultProps} />
      </TestWrapper>
    )
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
        type: ManifestDataType.TasManifest,
        spec: {
          cfCliVersion: 'V7',
          store: {
            spec: {
              branch: 'testBranch',
              connectorRef: RUNTIME_INPUT_VALUE,
              gitFetchType: 'Branch',
              paths: ['test-path']
            },
            type: ManifestDataType.TasManifest
          }
        }
      },
      prevStepData: {
        connectorRef: RUNTIME_INPUT_VALUE,
        store: 'Git'
      },
      selectedManifest: 'TasManifest' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <TasManifest {...defaultProps} />
      </TestWrapper>
    )
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
        type: ManifestDataType.TasManifest,
        spec: {
          cfCliVersion: 'V7',
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
        selectedManifest: 'TasManifest' as ManifestTypes,
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
      selectedManifest: 'TasManifest' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <TasManifest {...defaultProps} />
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

    // Click on submit button and submit the form
    userEvent.click(getByText('submit').parentElement!)

    await waitFor(() => {
      expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1)
      expect(defaultProps.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'TasManifest',
          spec: {
            cfCliVersion: 'V7',
            store: {
              spec: {
                connectorRef: 'testConnectorRef',
                gitFetchType: 'Commit',
                paths: ['test-path'],
                commitId: 'abc123'
              },
              type: 'Github'
            },
            varsPaths: undefined,
            autoScalerPath: undefined
          }
        }
      })
    })
  })

  test('renders form in edit mode - when gitfetchtype is Commit and commitId is Runtime input and runtime connector', () => {
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
        type: ManifestDataType.TasManifest,
        spec: {
          cfCliVersion: 'V7',
          store: {
            spec: {
              commitId: RUNTIME_INPUT_VALUE,
              connectorRef: RUNTIME_INPUT_VALUE,
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
      selectedManifest: 'TasManifest' as ManifestTypes,
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <TasManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
