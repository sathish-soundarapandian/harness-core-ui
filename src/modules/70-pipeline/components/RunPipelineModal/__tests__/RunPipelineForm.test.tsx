/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  fireEvent,
  render,
  waitFor,
  act,
  queryByAttribute,
  findByTestId as findByTestIdGlobal,
  screen
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  useGetPreflightCheckResponse,
  startPreflightCheckPromise,
  useGetPipeline,
  useGetTemplateFromPipeline
} from 'services/pipeline-ng'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { TestWrapper } from '@common/utils/testUtils'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { GetInputSetYamlDiffInline } from '@pipeline/components/InputSetErrorHandling/__tests__/InputSetErrorHandlingMocks'
import { useShouldDisableDeployment } from 'services/cd-ng'
import { RunPipelineForm } from '../RunPipelineForm'
import {
  getMockFor_Generic_useMutate,
  getMockFor_useGetInputSetsListForPipeline,
  getMockFor_useGetMergeInputSetFromPipelineTemplateWithListInput,
  getMockFor_useGetPipeline,
  getMockFor_useGetTemplateFromPipeline
} from './mocks'

const commonProps: PipelineType<PipelinePathProps & GitQueryParams> = {
  pipelineIdentifier: 'pid',
  projectIdentifier: 'prjid',
  accountId: 'acid',
  orgIdentifier: 'orgId',
  branch: 'br',
  repoIdentifier: 'repoid',
  module: 'ci'
}
const successResponse = (): Promise<{ status: string }> => Promise.resolve({ status: 'SUCCESS', data: {} })

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('services/cd-ng', () => ({
  useShouldDisableDeployment: jest.fn().mockReturnValue({
    loading: false,
    data: {}
  }),
  useCreatePR: () => ({ data: [], mutate: jest.fn() }),
  useCreatePRV2: () => ({ data: [], mutate: jest.fn() }),
  useGetFileContent: () => ({
    data: {},
    mutate: jest.fn(),
    refetch: jest.fn()
  }),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetConnector: () => ({
    loading: false,
    data: connectorMock,
    refetch: jest.fn()
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn() }
  }),
  useGetSettingValue: jest.fn().mockImplementation(() => {
    return { data: { allowDifferentRepoSettings: { data: { value: 'false' } }, loading: false } }
  })
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn() }
  })
}))

const connectorMock = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'test-connector',
      identifier: 'test_connector',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'projectIdentifier',
      tags: {},
      type: 'Github',
      spec: {
        url: 'https://github.com',
        validationRepo: 'devrepo',
        authentication: {
          type: 'Http',
          spec: {
            type: 'UsernameToken',
            spec: {
              username: 'username',
              usernameRef: null,
              tokenRef: 'tokenRef'
            }
          }
        },
        type: 'Account'
      }
    }
  }
}

const mockRePostPipelineExecuteYaml = jest.fn()
const mockMergeInputSet = jest.fn()
const mockCreateInputSet = jest.fn().mockResolvedValue({})

jest.mock('services/pipeline-ng', () => ({
  // used in RunPipelineForm
  useGetPipeline: jest.fn(() => getMockFor_useGetPipeline()),
  usePostPipelineExecuteWithInputSetYaml: jest.fn(() => getMockFor_Generic_useMutate()),
  useRePostPipelineExecuteWithInputSetYaml: jest.fn(() => getMockFor_Generic_useMutate(mockRePostPipelineExecuteYaml)),
  useRunStagesWithRuntimeInputYaml: jest.fn(() => getMockFor_Generic_useMutate()),
  useRerunStagesWithRuntimeInputYaml: jest.fn(() => getMockFor_Generic_useMutate()),
  useGetStagesExecutionList: jest.fn(() => ({})),

  // used within SaveAsInputSets
  useCreateInputSetForPipeline: jest.fn(() => getMockFor_Generic_useMutate(mockCreateInputSet)),

  // used within InputSetsSelector
  useGetInputSetsListForPipeline: jest.fn(() => getMockFor_useGetInputSetsListForPipeline()),

  // used within useInputSets
  useGetTemplateFromPipeline: jest.fn(() => getMockFor_useGetTemplateFromPipeline()),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => getMockFor_Generic_useMutate(mockMergeInputSet)),

  // used within PipelineVaribalesContext
  useCreateVariablesV2: jest.fn(() => ({})),

  // used within PreFlightCheckModal
  useGetPreflightCheckResponse: jest.fn(() => ({ data: { data: { status: 'SUCCESS' } } })),
  startPreflightCheckPromise: jest.fn().mockResolvedValue({}),
  useValidateTemplateInputs: jest.fn(() => getMockFor_Generic_useMutate()),
  useUpdateInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useUpdateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useYamlDiffForInputSet: jest.fn(() => GetInputSetYamlDiffInline),
  useDeleteInputSetForPipeline: jest.fn(() => ({ mutate: jest.fn() })),
  useDebugPipelineExecuteWithInputSetYaml: jest.fn().mockImplementation(() => ({ mutate: successResponse }))
}))

describe('STUDIO MODE', () => {
  beforeEach(() => {
    mockMergeInputSet
      .mockReset()
      .mockImplementation(getMockFor_useGetMergeInputSetFromPipelineTemplateWithListInput().mutate)
    mockRePostPipelineExecuteYaml.mockReset()
  })

  test('should toggle visual and yaml mode', async () => {
    const { container, getByText, findByTestId } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} source="executions" />
      </TestWrapper>
    )

    await findByTestId('selectExistingOrProvide')

    const yamlSwitch = getByText('YAML')
    await waitFor(() => expect(yamlSwitch).not.toHaveClass('disabledMode'))
    userEvent.click(yamlSwitch)

    await waitFor(() => {
      const editorDiv = container.querySelector('.editor')
      expect(editorDiv).not.toBe(null)
      expect(editorDiv).toBeInTheDocument()
    })

    fireEvent.click(getByText('VISUAL'))
    await waitFor(() => findByTestId('selectExistingOrProvide'))
  })

  test('should display the help text on hover', async () => {
    const { findByText, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} source="executions" />
      </TestWrapper>
    )

    const txt = await findByText('pipeline.pipelineInputPanel.useExisitingInputSets')

    fireEvent.mouseOver(txt)
    await waitFor(() => expect(queryByText('pipeline.inputSets.aboutInputSets')).toBeTruthy())
  })

  test('should not allow submit if form is incomplete as variable values are required', async () => {
    const { findByTestId, queryByText, getByRole } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} source="executions" />
      </TestWrapper>
    )

    // Navigate to 'Provide Values'
    const selectExistingOrProvide = await findByTestId('selectExistingOrProvide')
    fireEvent.click(selectExistingOrProvide)
    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Submit the incomplete form
    const runPipelineButton = getByRole('button', {
      name: 'runPipeline'
    })
    act(() => {
      fireEvent.click(runPipelineButton)
    })
    // Required variable is present so ErrorStrip is visible and submit button is disabled in RPF
    await waitFor(() => expect(queryByText('common.errorCount')).toBeTruthy())
    await waitFor(() => expect(queryByText('common.seeDetails')).toBeTruthy())
    await waitFor(() => expect(queryByText('fieldRequired')).toBeTruthy())
    expect(runPipelineButton).toBeDisabled()
  })

  test('should submit and call the run pipeine method if form is valid', async () => {
    const { container, findByTestId, queryByText, findByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} source="executions" />
      </TestWrapper>
    )

    // Navigate to 'Provide Values'
    const selectExistingOrProvide = await findByTestId('selectExistingOrProvide')
    fireEvent.click(selectExistingOrProvide)
    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())
    await waitFor(() => queryByAttribute('name', container, 'variables[0].value'))

    // Enter a value for the required pipeline variable
    const variableInputElement = queryByAttribute('name', container, 'variables[0].value')
    act(() => {
      fireEvent.change(variableInputElement!, { target: { value: 'enteredvalue' } })
    })

    // Skip the preflight check
    const skipCheck = await findByText('pre-flight-check.skipCheckBtn')
    act(() => {
      fireEvent.click(skipCheck)
    })

    const runButton = container.querySelector('button[type="submit"]')

    // Form is valid try andsubmit the pipeline
    act(() => {
      fireEvent.click(runButton!)
    })

    // await waitFor(() => expect(mockPostPipelineExecuteYaml.mutate).toBeCalled())
  })

  test('if SAVE_AS_INPUT_SET works', async () => {
    const { container, getByText, findByTestId, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} source="executions" />
      </TestWrapper>
    )

    // Navigate to 'Provide Values'
    const selectExistingOrProvide = await findByTestId('selectExistingOrProvide')
    fireEvent.click(selectExistingOrProvide)
    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Enter a value for the required pipeline variable
    const variableInputElement = queryByAttribute('name', container, 'variables[0].value')
    act(() => {
      fireEvent.change(variableInputElement!, { target: { value: 'enteredvalue' } })
    })

    act(() => {
      fireEvent.click(getByText('inputSets.saveAsInputSet'))
    })

    const saveAsInputSetForm = await findByTestIdGlobal(global.document.body, 'save-as-inputset-form')

    // Check on input set form
    await waitFor(() => expect(queryByAttribute('name', saveAsInputSetForm, 'name')).toBeTruthy())

    // Enter input set name
    const inputSetNameDiv = queryByAttribute('name', saveAsInputSetForm, 'name')
    fireEvent.change(inputSetNameDiv!, { target: { value: 'inputsetname' } })

    // Hit save
    act(() => {
      fireEvent.click(getByText('save'))
    })

    // Expect the input set save API to be called
    await waitFor(() => expect(mockCreateInputSet).toBeCalled())
  })

  test('should close the modal on cancel click', async () => {
    const onCloseMocked = jest.fn()
    const { findByTestId, findByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} onClose={onCloseMocked} source="executions" />
      </TestWrapper>
    )
    await findByTestId('selectExistingOrProvide')
    const cancel = await findByText('cancel')

    fireEvent.click(cancel)

    await waitFor(() => expect(onCloseMocked).toBeCalled())
  })

  test('should accept values from input sets and submit the form', async () => {
    const { container, getByText, queryByText, queryByTestId, queryAllByTestId } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} source="executions" />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByTestId('selectExistingOrProvide')).toBeTruthy())

    // Click on the Add input sets button
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    await waitFor(() => expect(queryByText('is1')).toBeTruthy())

    // input set is invalid should be flagged
    const allinvalidflags = queryAllByTestId('invalid-icon')

    // one for invalid input set and one forinvalid overlay set as per the mocked data
    expect(allinvalidflags.length).toBe(2)

    // Select the input sets - is2 and then is3
    act(() => {
      fireEvent.click(getByText('is2'))
    })
    act(() => {
      fireEvent.click(getByText('is3'))
    })

    // Apply the input sets
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.applyInputSets'))
    })

    // Expect the merge APi to be called
    await waitFor(() =>
      expect(mockMergeInputSet).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inputSetReferences: ['inputset2', 'inputset3']
        }),
        expect.any(Object)
      )
    )

    // Save the snapshot - value is present from merge input set API
    expect(container).toMatchSnapshot('after applying input sets')
  })

  test('invalid input sets should not be applied', async () => {
    const { container, getByText, queryByText, queryByTestId, queryAllByTestId } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} source="executions" />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByTestId('selectExistingOrProvide')).toBeTruthy())

    // Click on the Add input sets button
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    await waitFor(() => expect(queryByText('is1')).toBeTruthy())

    // input set is invalid should be flagged
    const allinvalidflags = queryAllByTestId('invalid-icon')

    // one for invalid input set and one forinvalid overlay set as per the mocked data
    expect(allinvalidflags.length).toBe(2)

    // Select the input set is1
    // This(is1) should not be selected as it is invalid
    act(() => {
      fireEvent.click(getByText('is1'))
    })
    // unselect is3
    act(() => {
      fireEvent.click(getByText('is3'))
    })

    // Apply the input set - As only one(is2) is selected because the other(is1) being invalid
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.applyInputSet'))
    })

    // Expect the merge APi to be called
    await waitFor(() =>
      expect(mockMergeInputSet).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inputSetReferences: ['inputset3']
        }),
        expect.any(Object)
      )
    )

    // Save the snapshot - value is present from merge input set API
    expect(container).toMatchSnapshot()
  })

  test('Valid input set enables Run button if it was disabled due to errors', async () => {
    // What to do -
    // 1. Apply input set so that all fields are filled
    // 2. Run button to be enabled

    const { container, getByText, findByTestId, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} source="executions" />
      </TestWrapper>
    )

    // Navigate to 'Provide Values'
    const selectExistingOrProvide = await findByTestId('selectExistingOrProvide')
    fireEvent.click(selectExistingOrProvide)
    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Navigate to 'Existing'
    fireEvent.click(selectExistingOrProvide)
    await waitFor(() => expect(queryByText('pipeline.inputSets.selectPlaceholder')).toBeTruthy())

    // Click on the Add input sets button
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    await waitFor(() => expect(queryByText('is2')).toBeTruthy())

    // Select the input sets - is2 and then is3
    act(() => {
      fireEvent.click(getByText('is2'))
    })
    act(() => {
      fireEvent.click(getByText('is3'))
    })

    // Wait for button to be there
    await waitFor(() => expect(queryByText('pipeline.inputSets.applyInputSets')).toBeTruthy())

    // Apply the input sets
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.applyInputSets'))
    })

    // Expect the merge APi to be called (this calls validation internally)
    await waitFor(() =>
      expect(mockMergeInputSet).toHaveBeenLastCalledWith(
        expect.objectContaining({
          inputSetReferences: ['inputset2', 'inputset3']
        }),
        expect.any(Object)
      )
    )

    // Check errors to go away
    await waitFor(() => expect(queryByText('common.errorCount')).toBeFalsy())

    // Check Run button to be enabled now
    await waitFor(() => expect(container.querySelector('button[type="submit"]')).not.toBeDisabled())
  })

  test('show warning for active deployment freeze', async () => {
    const useShouldDisableDeploymentMock = useShouldDisableDeployment as jest.MockedFunction<any>
    useShouldDisableDeploymentMock.mockImplementation(() => {
      return {
        data: {
          data: {
            shouldDisable: true,
            freezeReferences: [
              {
                freezeScope: 'account',
                identifier: '_GLOBAL_',
                type: 'GLOBAL'
              }
            ]
          }
        },
        refetch: jest.fn(),
        error: null
      }
    })

    render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} source="executions" />
      </TestWrapper>
    )
    expect(screen.getByText('pipeline.runDisabledOnFreeze')).toBeInTheDocument()
    useShouldDisableDeploymentMock.mockImplementation(() => {
      return {
        data: {},
        refetch: jest.fn(),
        error: null
      }
    })
  })

  test('should display the help text on hover disabled selectExistingOrProvide checkbox', async () => {
    ;(useGetTemplateFromPipeline as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn().mockResolvedValue({
        data: {
          inputSetTemplateYaml: `pipeline:
      identifier: "First"
      variables:
        - name: "checkVariable1"
          type: "String"
          value: "<+input>"
        - name: "checkVariable2"
          type: "String"
          value: "<+input>"`
        }
      })
    }))

    render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} source="executions" />
      </TestWrapper>
    )

    const selectExistingOrProvide = await screen.findByTestId('selectExistingOrProvide')
    fireEvent.mouseOver(selectExistingOrProvide)
    expect(await screen.findByText('pipeline.inputSets.noInputSetsCreated')).toBeInTheDocument()
  })
})

describe('STUDIO MODE - template API error', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should display template api error', async () => {
    ;(useGetPipeline as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(() => {
        throw new Error('Something went wrong!')
      })
    }))

    const { queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} source="executions" />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('error')).toBeTruthy())
  })
})

describe('RERUN MODE', () => {
  test('preflight api getting called if skipPreflight is unchecked', async () => {
    ;(useGetTemplateFromPipeline as jest.Mock).mockImplementation(() => getMockFor_useGetTemplateFromPipeline())

    const { container, getByText, findByTestId, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm {...commonProps} source="executions" />
      </TestWrapper>
    )

    // Navigate to 'Provide Values'
    const selectExistingOrProvide = await findByTestId('selectExistingOrProvide')
    fireEvent.click(selectExistingOrProvide)
    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Enter a value for the pipeline variable
    const variableInputElement = container.querySelector('input[name="variables[0].value"]')
    act(() => {
      fireEvent.change(variableInputElement!, { target: { value: 'enteredvalue' } })
    })

    // Preflight check is not skipped
    const skipPreflightButton = getByText('pre-flight-check.skipCheckBtn').querySelector(
      '[type=checkbox]'
    ) as HTMLInputElement
    expect(skipPreflightButton.checked).toBeFalsy()

    // Submit button click
    const runButton = container.querySelector('button[type="submit"]')
    await act(() => {
      fireEvent.click(runButton!)
    })

    // Check preflight functions called
    await waitFor(() => expect(useGetPreflightCheckResponse).toBeCalled())
    await waitFor(() => expect(startPreflightCheckPromise).toBeCalled())
  })

  test('should should have the values prefilled', async () => {
    const inputSetYaml = `pipeline:
  identifier: "First"
  variables:
  - name: "checkVariable1"
    type: "String"
    value: "variablevalue"`
    mockMergeInputSet.mockReset().mockImplementation(
      jest.fn().mockResolvedValue({
        data: {
          pipelineYaml: inputSetYaml
        }
      })
    )
    const { container, queryByText, queryByDisplayValue } = render(
      <TestWrapper>
        <RunPipelineForm
          {...commonProps}
          inputSetYAML={inputSetYaml}
          executionIdentifier={'execId'}
          source="executions"
        />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())

    // Check the prefilled value of the variable
    expect(queryByDisplayValue('variablevalue')).toBeTruthy()

    // Submit should call the preflight check API
    const runButton = container.querySelector('button[type="submit"]')
    act(() => {
      fireEvent.click(runButton!)
    })

    // Mocked preflight response is 'SUCCESS', so it will contine to execution and call the rerun API
    // Check if rerun API is called
    await waitFor(() => expect(mockRePostPipelineExecuteYaml).toHaveBeenCalled())
  })

  test('input set selection should not be visible', async () => {
    const inputSetYaml = `pipeline:
  identifier: "First"
  variables:
  - name: "checkVariable1"
    type: "String"
    value: "variablevalue"`
    mockMergeInputSet.mockReset().mockImplementation(
      jest.fn().mockResolvedValue({
        data: {
          pipelineYaml: inputSetYaml
        }
      })
    )
    const { queryByText, queryAllByText } = render(
      <TestWrapper>
        <RunPipelineForm
          {...commonProps}
          inputSetYAML={inputSetYaml}
          executionIdentifier={'execId'}
          source="executions"
        />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())
    expect(screen.queryByTestId('selectExistingOrProvide')).not.toBeInTheDocument()
    expect(screen.queryByTestId('inputSetFormDivider')).not.toBeInTheDocument()

    // Expect header and the submit button to show rerun pipeline
    expect(queryAllByText('pipeline.execution.actions.rerunPipeline')).toHaveLength(2)
  })
})

describe('EXECUTION VIEW', () => {
  test('should should have the values prefilled and fields as disabled', async () => {
    const executionInputSetTemplateYaml = `pipeline:
  identifier: "First"
  variables:
  - name: "checkVariable1"
    type: "String"
    value: "<+input>"`
    const inputSetYaml = `pipeline:
  identifier: "First"
  variables:
  - name: "checkVariable1"
    type: "String"
    value: "variablevalue"`

    const { container, queryByText } = render(
      <TestWrapper>
        <RunPipelineForm
          {...commonProps}
          inputSetYAML={inputSetYaml}
          executionView={true}
          executionInputSetTemplateYaml={executionInputSetTemplateYaml}
          source="executions"
        />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('customVariables.pipelineVariablesTitle')).toBeTruthy())
    expect(screen.queryByTestId('selectExistingOrProvide')).not.toBeInTheDocument()
    expect(screen.queryByTestId('inputSetFormDivider')).not.toBeInTheDocument()

    expect(container).toMatchSnapshot('disabled view in execution inputs')
  })
})
