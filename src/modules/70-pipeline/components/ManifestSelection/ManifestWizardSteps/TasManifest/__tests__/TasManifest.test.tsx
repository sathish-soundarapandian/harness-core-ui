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
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import TasManifest from '../TasManifest'
import {
  props,
  initialValues,
  prevStepData,
  prevStepDatWithRepoDetails,
  runtimeInitialValues,
  expressionInitialValues,
  fixedValueInitialValues
} from './helper'

jest.mock('uuid')

const validateRuntimeField = async (pathInput: HTMLInputElement, regexText = ''): Promise<void> => {
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

  test('when branch is runtime input and configure options', async () => {
    const defaultProps = {
      ...props,
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

  test('submits with right payload for fixed input types', async () => {
    const tasManifestProps = {
      ...props,
      prevStepData,
      initialValues: {
        identifier: 'testidentifier',
        type: ManifestDataType.TasManifest,
        spec: initialValues
      }
    }

    const { container } = render(
      <TestWrapper>
        <TasManifest {...tasManifestProps} />
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
          type: ManifestDataType.TasManifest,
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

  test('submits with right payload for runtime input types', async () => {
    const defaultProps = {
      ...props,
      initialValues: runtimeInitialValues,
      prevStepData: prevStepDatWithRepoDetails,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }

    const { container } = render(
      <TestWrapper>
        <TasManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(queryByAttribute('name', container, 'paths')!).toHaveValue(RUNTIME_INPUT_VALUE)
    expect(queryByAttribute('name', container, 'varsPaths')!).toHaveValue(RUNTIME_INPUT_VALUE)
    expect(queryByAttribute('name', container, 'autoScalerPath')!).toHaveValue(RUNTIME_INPUT_VALUE)
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1)
      expect(defaultProps.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: ManifestDataType.TasManifest,
          spec: {
            store: {
              spec: {
                branch: 'testBranch',
                connectorRef: 'testConnectorRef',
                gitFetchType: 'Branch',
                paths: RUNTIME_INPUT_VALUE
              },
              type: 'Github'
            },
            cfCliVersion: 'V7',
            varsPaths: RUNTIME_INPUT_VALUE,
            autoScalerPath: RUNTIME_INPUT_VALUE
          }
        }
      })
    })
  })
  test('submits with right payload for expression input types', async () => {
    const defaultProps = {
      ...props,
      initialValues: expressionInitialValues,
      prevStepData: prevStepDatWithRepoDetails,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }

    const { container } = render(
      <TestWrapper>
        <TasManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(queryByAttribute('name', container, 'paths[0].path')!).toHaveValue('<+tas.filePath>')
    expect(queryByAttribute('name', container, 'varsPaths[0].path')!).toHaveValue('<+tas.varsPath>')
    expect(queryByAttribute('name', container, 'autoScalerPath[0].path')!).toHaveValue('<+tas.autoScalerPath>')
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1)
      expect(defaultProps.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: ManifestDataType.TasManifest,
          spec: {
            store: {
              spec: {
                branch: 'testBranch',
                connectorRef: 'testConnectorRef',
                gitFetchType: 'Branch',
                paths: ['<+tas.filePath>']
              },
              type: 'Github'
            },
            cfCliVersion: 'V7',
            varsPaths: ['<+tas.varsPath>'],
            autoScalerPath: ['<+tas.autoScalerPath>']
          }
        }
      })
    })
  })

  test('renders form in edit mode', async () => {
    const defaultProps = {
      ...props,
      initialValues: fixedValueInitialValues,
      prevStepData: {
        store: 'Git'
      },
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
      ...props,
      initialValues: fixedValueInitialValues,
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
      ...props,
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
      ...props,
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
          type: ManifestDataType.TasManifest,
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
      ...props,
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
