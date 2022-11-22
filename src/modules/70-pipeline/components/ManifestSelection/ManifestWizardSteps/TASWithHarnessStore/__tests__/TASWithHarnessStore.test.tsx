/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as uuid from 'uuid'
import { queryByAttribute, render, waitFor, getByText as getElementByText } from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import TASWithHarnessStore from '../TASWithHarnessStore'

jest.mock('uuid')
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest
    .fn()
    .mockImplementation(() => ['delegate-selector', 'delegate1', 'delegate2'])
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
  selectedManifest: 'TasManifest' as ManifestTypes,
  manifestIdsList: [],
  isReadonly: false,
  prevStepData: {}
}
const initialValues = {
  identifier: '',
  spec: {},
  type: ManifestDataType.TasManifest,
  files: [],
  varsPaths: [''],
  autoScalerPath: ['']
}

describe('Harness File Store with TAS Manifest tests', () => {
  beforeEach(() => jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID'))

  test('initial rendering', () => {
    const { container } = render(
      <TestWrapper>
        <TASWithHarnessStore {...props} initialValues={initialValues} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('In edit mode form renders and going prev step and submitting to next step works', async () => {
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
          varsPaths: ['vars path'],
          autoScalerPath: ['autoScaler path'],
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
      selectedManifest: 'TasManifest' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <TASWithHarnessStore {...defaultProps} />
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

  test('when files, varsPath and autoScalerPath runtime input', async () => {
    const defaultProps = {
      ...props,
      stepName: 'Manifest details',
      expressions: [],
      initialValues: {
        identifier: 'test',
        spec: {
          varsPaths: RUNTIME_INPUT_VALUE,
          autoScalerPath: RUNTIME_INPUT_VALUE,
          store: {
            spec: {
              files: RUNTIME_INPUT_VALUE
            }
          }
        },
        type: ManifestDataType.TasManifest
      },
      prevStepData: {
        store: 'Harness'
      },
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { container, getByText, getAllByText } = render(
      <TestWrapper>
        <TASWithHarnessStore {...defaultProps} />
      </TestWrapper>
    )

    const filesInput = queryByAttribute('name', container, 'files') as HTMLInputElement
    expect(filesInput.value).toBe('<+input>')

    const varsPath = queryByAttribute('name', container, 'varsPaths') as HTMLInputElement
    expect(varsPath.value).toBe('<+input>')
    const autoScalerPath = queryByAttribute('name', container, 'autoScalerPath') as HTMLInputElement

    const filePaths = getAllByText('fileFolderPathText')[0]
    expect(filePaths).toBeDefined()
    const varsPathLabel = getByText('pipeline.manifestType.varsYAMLPath')
    expect(varsPathLabel).toBeDefined()
    const autoScalerPathLabel = getByText('pipeline.manifestType.autoScalerYAMLPath')
    expect(autoScalerPathLabel).toBeDefined()

    expect(autoScalerPath.value).toBe('<+input>')
    const backButton = getByText('back').parentElement
    userEvent.click(backButton!)
    await waitFor(() => expect(defaultProps.previousStep).toBeCalled())
    const submitButton = getElementByText(container, 'submit')
    userEvent.click(submitButton!)
  })
})
