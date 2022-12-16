/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as uuid from 'uuid'
import {
  act,
  fireEvent,
  queryByAttribute,
  render,
  waitFor,
  getByText as getElementByText,
  queryByText
} from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { omit } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import CustomRemoteManifest from '../CustomRemoteManifest'

jest.mock('uuid')
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest
    .fn()
    .mockImplementation(() => ['delegate-selector', 'delegate1', 'delegate2']),
  useGetDelegateSelectorsUpTheHierarchyV2: jest.fn().mockImplementation(() => [
    { name: 'delegate-selector', connected: false },
    { name: 'delegate1', connected: true },
    { name: 'delegate2', connected: false }
  ])
}))

jest.mock('services/cd-ng', () => ({
  useHelmCmdFlags: jest.fn().mockImplementation(() => ({ data: { data: ['Template', 'Fetch'] }, refetch: jest.fn() }))
}))

const props = {
  stepName: 'Manifest details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  handleSubmit: jest.fn(),
  selectedManifest: 'K8sManifest' as ManifestTypes,
  manifestIdsList: [],
  isReadonly: false,
  prevStepData: {}
}
const initialValues = {
  identifier: '',
  spec: {},
  type: ManifestDataType.K8sManifest,
  filePath: '',
  extractionScript: '',
  skipResourceVersioning: false,
  valuesPaths: [],
  delegateSelectors: [],
  helmVersion: 'V2',
  commandFlags: [{ commandType: undefined, flag: undefined, id: 'id' }]
}

describe('Custom remote tests', () => {
  beforeEach(() => jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID'))

  test('initial rendering', () => {
    const { container } = render(
      <TestWrapper>
        <CustomRemoteManifest {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('when fields are runtime input', () => {
    const defaultProps = {
      ...props,
      stepName: 'Manifest details',
      expressions: [],
      initialValues: {
        identifier: 'test',
        filePath: RUNTIME_INPUT_VALUE,
        extractionScript: RUNTIME_INPUT_VALUE,
        valuesPaths: ['test'],
        delegateSelectors: ['test']
      },
      prevStepData: {
        store: 'CustomRemote'
      },
      handleSubmit: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <CustomRemoteManifest {...defaultProps} initialValues={initialValues} />
      </TestWrapper>
    )
    const valuesPaths = getByText('pipeline.manifestType.valuesYamlPath')
    expect(valuesPaths).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('submits with right payload', async () => {
    const prevStepData = {
      store: 'CustomRemote'
    }
    const { container, getByText } = render(
      <TestWrapper>
        <CustomRemoteManifest {...props} prevStepData={prevStepData} initialValues={initialValues} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'testidentifier' } })
      fireEvent.change(queryByNameAttribute('filePath')!, { target: { value: 'file path' } })
      fireEvent.change(queryByNameAttribute('extractionScript')!, { target: { value: 'script' } })
      fireEvent.change(queryByNameAttribute('valuesPaths[0].path')!, { target: { value: 'test-path' } })
    })

    userEvent.click(getByText('advancedTitle'))
    const skipResourceVersioningCheckbox = queryByNameAttribute('skipResourceVersioning')
    expect(skipResourceVersioningCheckbox).toBeTruthy()
    userEvent.click(skipResourceVersioningCheckbox!)

    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledTimes(1)
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: 'K8sManifest',
          spec: {
            skipResourceVersioning: true,
            valuesPaths: ['test-path'],
            store: {
              spec: {
                filePath: 'file path',
                extractionScript: 'script',
                delegateSelectors: []
              },
              type: 'CustomRemote'
            }
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
        type: ManifestDataType.K8sManifest,
        spec: {
          skipResourceVersioning: false,
          helmVersion: 'V2',
          commandFlags: [{ commandType: undefined, flag: undefined, id: 'id' }],
          valuesPaths: ['test-path'],
          store: {
            spec: {
              filePath: 'file path',
              extractionScript: 'script',
              delegateSelectors: ['delegate-selector']
            },
            type: undefined
          }
        }
      },
      prevStepData: {
        store: 'CustomRemote'
      },
      selectedManifest: 'K8sManifest' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { getByText } = render(
      <TestWrapper>
        <CustomRemoteManifest {...defaultProps} />
      </TestWrapper>
    )
    const backButton = getByText('back').parentElement
    userEvent.click(backButton!)
    await waitFor(() => expect(defaultProps.previousStep).toBeCalled())
    expect(defaultProps.previousStep).toHaveBeenCalledWith(defaultProps.prevStepData)
  })

  test('when extractionScript, skipResourceVersioning and file path is runtime input', async () => {
    const defaultProps = {
      ...props,
      stepName: 'Manifest details',
      expressions: [],
      initialValues: {
        identifier: 'test',
        spec: {
          skipResourceVersioning: RUNTIME_INPUT_VALUE,
          commandFlags: [{ commandType: undefined, flag: undefined, id: 'id' }],
          helmVersion: 'V2',
          valuesPaths: ['values-path'],
          store: {
            spec: {
              filePath: RUNTIME_INPUT_VALUE,
              extractionScript: RUNTIME_INPUT_VALUE,
              delegateSelectors: ['delegate-selector']
            }
          }
        },
        type: ManifestDataType.HelmChart
      },
      prevStepData: {
        store: 'CustomRemote'
      },
      handleSubmit: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <CustomRemoteManifest {...defaultProps} />
      </TestWrapper>
    )

    const extractionScriptInput = queryByAttribute('name', container, 'extractionScript') as HTMLInputElement
    expect(extractionScriptInput.value).toBe('<+input>')
    const filePathInput = queryByAttribute('name', container, 'filePath') as HTMLInputElement
    expect(filePathInput.value).toBe('<+input>')

    userEvent.click(getByText('advancedTitle'))

    const skipResourceVersioning = queryByAttribute('name', container, 'skipResourceVersioning') as HTMLInputElement
    expect(skipResourceVersioning.value).toBe('<+input>')
  })

  test('expand advanced section - when type is HelmChart', async () => {
    const defaultProps = {
      ...props,
      prevStepData: {
        store: 'CustomRemote'
      },
      initialValues,
      selectedManifest: 'HelmChart' as ManifestTypes,
      handleSubmit: jest.fn()
    }

    const { container, getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <CustomRemoteManifest {...defaultProps} />
      </TestWrapper>
    )
    const valuesPathsText = queryByText(container, 'pipeline.manifestType.valuesYamlPath')
    expect(valuesPathsText).toBeDefined()
    userEvent.click(getByText('advancedTitle'))

    //check command flag dropdown
    const defaultSelectDropdown = getByPlaceholderText('- pipeline.fieldPlaceholders.commandType -')
    await waitFor(() => expect(defaultSelectDropdown).toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })

  test('going back to prev step and submitting to next step works as expected', async () => {
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
        type: ManifestDataType.K8sManifest,
        spec: {
          skipResourceVersioning: RUNTIME_INPUT_VALUE,
          valuesPaths: ['values-path'],
          store: {
            spec: {
              filePath: RUNTIME_INPUT_VALUE,
              extractionScript: RUNTIME_INPUT_VALUE,
              delegateSelectors: ['delegate-selector']
            }
          }
        }
      },
      prevStepData: {
        store: 'CustomRemote'
      },
      selectedManifest: 'K8sManifest' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <CustomRemoteManifest {...defaultProps} />
      </TestWrapper>
    )
    const backButton = getByText('back').parentElement
    userEvent.click(backButton!)
    await waitFor(() => expect(defaultProps.previousStep).toBeCalled())
    expect(defaultProps.previousStep).toHaveBeenCalledWith(defaultProps.prevStepData)
    const submitButton = getElementByText(container, 'submit')
    userEvent.click(submitButton!)
    const titleText = getElementByText(container, 'Manifest details')
    expect(titleText).toBeDefined()
  })

  test('valuesPaths is not present when selected manifest is of type Values', () => {
    const manifestProps = {
      stepName: 'Manifest details',
      expressions: [],
      allowableTypes: [
        MultiTypeInputType.FIXED,
        MultiTypeInputType.RUNTIME,
        MultiTypeInputType.EXPRESSION
      ] as AllowedTypesWithRunTime[],
      handleSubmit: jest.fn(),
      selectedManifest: 'Values' as ManifestTypes,
      manifestIdsList: [],
      isReadonly: false,
      prevStepData: {}
    }
    const defaultProps = {
      ...manifestProps,
      prevStepData: {
        store: 'CustomRemote'
      },
      initialValues: { ...omit(initialValues, 'type', 'valuesPaths'), type: ManifestDataType.Values },
      handleSubmit: jest.fn()
    }

    const { container } = render(
      <TestWrapper>
        <CustomRemoteManifest {...defaultProps} />
      </TestWrapper>
    )
    const valuesPathsText = queryByText(container, 'pipeline.manifestType.valuesYamlPath')
    expect(valuesPathsText).toBeNull()
  })

  test('varsYAMLPath is not present when selected manifest is of type TASVars', () => {
    const manifestProps = {
      stepName: 'Manifest details',
      expressions: [],
      allowableTypes: [
        MultiTypeInputType.FIXED,
        MultiTypeInputType.RUNTIME,
        MultiTypeInputType.EXPRESSION
      ] as AllowedTypesWithRunTime[],
      handleSubmit: jest.fn(),
      selectedManifest: 'TasVars' as ManifestTypes,
      manifestIdsList: [],
      isReadonly: false,
      prevStepData: {}
    }
    const defaultProps = {
      ...manifestProps,
      prevStepData: {
        store: 'CustomRemote'
      },
      initialValues: { ...omit(initialValues, 'type', 'valuesPaths'), type: ManifestDataType.TasVars },
      handleSubmit: jest.fn()
    }

    const { container } = render(
      <TestWrapper>
        <CustomRemoteManifest {...defaultProps} />
      </TestWrapper>
    )
    const valuesPathsText = queryByText(container, 'pipeline.manifestType.varsYAMLPath')
    expect(valuesPathsText).toBeNull()
  })

  test('varsYAMLPath is not present when selected manifest is of type TasAutoScaler', () => {
    const manifestProps = {
      stepName: 'Manifest details',
      expressions: [],
      allowableTypes: [
        MultiTypeInputType.FIXED,
        MultiTypeInputType.RUNTIME,
        MultiTypeInputType.EXPRESSION
      ] as AllowedTypesWithRunTime[],
      handleSubmit: jest.fn(),
      selectedManifest: 'TasAutoScaler' as ManifestTypes,
      manifestIdsList: [],
      isReadonly: false,
      prevStepData: {}
    }
    const defaultProps = {
      ...manifestProps,
      prevStepData: {
        store: 'CustomRemote'
      },
      initialValues: { ...omit(initialValues, 'type', 'valuesPaths'), type: ManifestDataType.TasAutoScaler },
      handleSubmit: jest.fn()
    }

    const { container } = render(
      <TestWrapper>
        <CustomRemoteManifest {...defaultProps} />
      </TestWrapper>
    )
    const valuesPathsText = queryByText(container, 'pipeline.manifestType.autoScalerYAMLPath')
    expect(valuesPathsText).toBeNull()
  })

  test('customRemoteManifest for TasManifest with fixed, runtime, expressions values', async () => {
    const TasInitialValues = {
      identifier: 'TasManifest',
      type: ManifestDataType.TasManifest,
      spec: {
        store: {
          type: 'CustomRemote',
          spec: {
            filePath: 'testPath',
            extractionScript: 'custom script',
            delegateSelectors: []
          }
        },
        varsPaths: ['varsPath'],
        autoScalerPath: ['autoScalerPath'],
        cfCliVersion: 'V7'
      }
    }
    const TasRuntimeValuesSpec = {
      identifier: 'TasManifest',
      type: ManifestDataType.TasManifest,
      spec: {
        store: {
          type: 'CustomRemote',
          spec: {
            filePath: RUNTIME_INPUT_VALUE,
            extractionScript: RUNTIME_INPUT_VALUE,
            delegateSelectors: []
          }
        },
        varsPaths: RUNTIME_INPUT_VALUE,
        autoScalerPath: RUNTIME_INPUT_VALUE,
        cfCliVersion: 'V7'
      }
    }
    const TasExpressionsSpec = {
      identifier: 'TasManifest',
      type: ManifestDataType.TasManifest,
      spec: {
        store: {
          type: 'CustomRemote',
          spec: {
            filePath: '<+tas.filePath>',
            extractionScript: '<+tas.script>',
            delegateSelectors: []
          }
        },
        varsPaths: ['<+tas.varsPath>'],
        autoScalerPath: ['<+tas.autoScalerPath>'],
        cfCliVersion: 'V7'
      }
    }
    const defaultProps = {
      ...props,
      selectedManifest: 'TasManifest' as ManifestTypes,
      prevStepData: {
        store: 'CustomRemote'
      },
      initialValues: TasInitialValues
    }
    const runtimeProps = {
      ...defaultProps,
      initialValues: TasRuntimeValuesSpec
    }
    const expressionProps = {
      ...defaultProps,
      initialValues: TasExpressionsSpec
    }
    const { container: runtimeValueContainer } = render(
      <TestWrapper>
        <CustomRemoteManifest {...runtimeProps} />
      </TestWrapper>
    )
    expect(queryByAttribute('name', runtimeValueContainer, 'filePath')!).toHaveValue(RUNTIME_INPUT_VALUE)
    expect(queryByAttribute('name', runtimeValueContainer, 'varsPaths')!).toHaveValue(RUNTIME_INPUT_VALUE)
    expect(queryByAttribute('name', runtimeValueContainer, 'autoScalerPath')!).toHaveValue(RUNTIME_INPUT_VALUE)

    const { container: expressionValueContainer } = render(
      <TestWrapper>
        <CustomRemoteManifest {...expressionProps} />
      </TestWrapper>
    )

    expect(queryByAttribute('name', expressionValueContainer, 'filePath')!).toHaveValue('<+tas.filePath>')
    expect(queryByAttribute('name', expressionValueContainer, 'varsPaths[0].path')!).toHaveValue('<+tas.varsPath>')
    expect(queryByAttribute('name', expressionValueContainer, 'autoScalerPath[0].path')!).toHaveValue(
      '<+tas.autoScalerPath>'
    )

    const { container } = render(
      <TestWrapper>
        <CustomRemoteManifest {...defaultProps} />
      </TestWrapper>
    )

    expect(queryByAttribute('name', container, 'cfCliVersion')!).toHaveValue('CLI Version 7.0')
    expect(queryByAttribute('name', container, 'filePath')!).toHaveValue('testPath')
    expect(queryByAttribute('name', container, 'varsPaths[0].path')!).toHaveValue('varsPath')
    expect(queryByAttribute('name', container, 'autoScalerPath[0].path')!).toHaveValue('autoScalerPath')
    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(2)
      expect(defaultProps.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'TasManifest',
          type: ManifestDataType.TasManifest,
          spec: {
            varsPaths: ['varsPath'],
            autoScalerPath: ['autoScalerPath'],
            cfCliVersion: 'V7',
            store: {
              spec: {
                delegateSelectors: [],
                extractionScript: 'custom script',
                filePath: 'testPath'
              },
              type: 'CustomRemote'
            }
          }
        }
      })
    })
  })
})
