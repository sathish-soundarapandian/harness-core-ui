/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as uuid from 'uuid'
import { queryByAttribute, render, waitFor, getByText as getElementByText } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import HelmWithHarnessStore from '../HelmWithHarnessStore'

jest.mock('uuid')
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest
    .fn()
    .mockImplementation(() => ['delegate-selector', 'delegate1', 'delegate2'])
}))
jest.mock('services/cd-ng', () => ({
  useHelmCmdFlags: jest.fn().mockImplementation(() => ({ data: { data: ['Template', 'Pull'] }, refetch: jest.fn() }))
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
  selectedManifest: 'HelmChart' as ManifestTypes,
  manifestIdsList: [],
  isReadonly: false,
  prevStepData: {}
}
const initialValues = {
  identifier: '',
  spec: {},
  type: ManifestDataType.HelmChart,
  files: [],
  skipResourceVersioning: false,
  helmVersion: 'V2',
  valuesPaths: []
}

describe('Harness File Store with HelmChart Manifest tests', () => {
  beforeEach(() => jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID'))

  test('initial rendering', () => {
    const { container } = render(
      <TestWrapper>
        <HelmWithHarnessStore {...props} initialValues={initialValues} />
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
        files: RUNTIME_INPUT_VALUE,
        valuesPaths: RUNTIME_INPUT_VALUE,
        skipResourceVersioning: RUNTIME_INPUT_VALUE,
        helmVersion: 'V2'
      },
      prevStepData: {
        store: 'Harness'
      },
      handleSubmit: jest.fn()
    }
    const { container, getByText, getAllByText } = render(
      <TestWrapper>
        <HelmWithHarnessStore {...defaultProps} initialValues={initialValues} />
      </TestWrapper>
    )
    const filePaths = getAllByText('fileFolderPathText')[0]
    expect(filePaths).toBeDefined()
    const helmVersion = getByText('helmVersion')
    expect(helmVersion).toBeDefined()
    expect(container).toMatchSnapshot()
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
        type: ManifestDataType.HelmChart,
        spec: {
          skipResourceVersioning: false,
          valuesPaths: ['test-path'],
          commandFlags: [{ commandType: 'Template', flag: 'flag' }],
          helmVersion: 'V2',
          store: {
            spec: {
              files: ['file path']
            },
            type: undefined
          }
        }
      },
      prevStepData: {
        store: 'Harness'
      },
      selectedManifest: 'HelmChart' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { getByText } = render(
      <TestWrapper>
        <HelmWithHarnessStore {...defaultProps} />
      </TestWrapper>
    )
    const backButton = getByText('back').parentElement
    userEvent.click(backButton!)
    await waitFor(() => expect(defaultProps.previousStep).toBeCalled())
    expect(defaultProps.previousStep).toHaveBeenCalledWith(defaultProps.prevStepData)
  })

  test('when files, skipResourceVersioning and manifestScope runtime input', async () => {
    const defaultProps = {
      ...props,
      stepName: 'Manifest details',
      expressions: [],
      initialValues: {
        identifier: 'test',
        spec: {
          valuesPaths: RUNTIME_INPUT_VALUE,
          skipResourceVersioning: RUNTIME_INPUT_VALUE,
          helmVersion: 'V2',
          store: {
            spec: {
              files: RUNTIME_INPUT_VALUE
            }
          }
        },
        type: ManifestDataType.HelmChart
      },
      prevStepData: {
        store: 'Harness'
      },
      handleSubmit: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <HelmWithHarnessStore {...defaultProps} />
      </TestWrapper>
    )

    const filesInput = queryByAttribute('name', container, 'files') as HTMLInputElement
    expect(filesInput.value).toBe('<+input>')

    const skipResourceVersioningField = queryByAttribute(
      'name',
      container,
      'skipResourceVersioning'
    ) as HTMLInputElement
    expect(skipResourceVersioningField.value).toBe('<+input>')
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
        type: ManifestDataType.HelmChart,
        spec: {
          valuesPaths: ['values-path'],
          skipResourceVersioning: true,
          manifestScope: 'manifest-scope',
          helmVersion: 'V2',
          store: {
            spec: {
              files: RUNTIME_INPUT_VALUE
            }
          }
        }
      },
      prevStepData: {
        store: 'Harness'
      },
      selectedManifest: 'HelmChart' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <HelmWithHarnessStore {...defaultProps} />
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
})
