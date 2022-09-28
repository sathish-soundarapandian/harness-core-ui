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
  getByText as getElementByText
} from '@testing-library/react'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import KustomizeWithHarnessStore from '../KustomizeWithHarnessStore'

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
  selectedManifest: 'Kustomize' as ManifestTypes,
  manifestIdsList: [],
  isReadonly: false,
  prevStepData: {}
}
const initialValues = {
  identifier: '',
  spec: {},
  type: ManifestDataType.Kustomize,
  files: [],
  overlayConfiguration: '',
  skipResourceVersioning: false,
  patchesPaths: [],
  pluginPath: ''
}

describe('Harness File Store with Kustomize Manifest tests', () => {
  beforeEach(() => jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID'))

  test('initial rendering', () => {
    const { container } = render(
      <TestWrapper>
        <KustomizeWithHarnessStore {...props} initialValues={initialValues} />
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
        overlayConfiguration: RUNTIME_INPUT_VALUE,
        patchesPaths: RUNTIME_INPUT_VALUE,
        skipResourceVersioning: RUNTIME_INPUT_VALUE,
        pluginPath: RUNTIME_INPUT_VALUE
      },
      prevStepData: {
        store: 'Harness'
      },
      handleSubmit: jest.fn()
    }
    const { container, getByText, getAllByText } = render(
      <TestWrapper>
        <KustomizeWithHarnessStore {...defaultProps} initialValues={initialValues} />
      </TestWrapper>
    )
    const filePaths = getAllByText('pipeline.manifestType.kustomizeFolderPath')[0]
    expect(filePaths).toBeDefined()
    const overlayConfiguration = getByText('pipeline.manifestType.kustomizeYamlFolderPath')
    expect(overlayConfiguration).toBeDefined()
    expect(container).toMatchSnapshot()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('submits with right payload', async () => {
    const prevStepData = {
      store: 'Harness'
    }
    const { container } = render(
      <TestWrapper>
        <KustomizeWithHarnessStore {...props} prevStepData={prevStepData} initialValues={initialValues} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    await act(async () => {
      fireEvent.change(queryByNameAttribute('identifier')!, { target: { value: 'test-identifier' } })
      fireEvent.change(queryByNameAttribute('overlayConfiguration')!, { target: { value: 'scope' } })
      fireEvent.change(queryByNameAttribute('pluginPath')!, { target: { value: 'pluginPath' } })
    })

    fireEvent.click(container.querySelector('button[type="submit"]')!)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledTimes(1)
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
        type: ManifestDataType.Kustomize,
        spec: {
          skipResourceVersioning: false,
          overlayConfiguration: 'scope',
          patchesPaths: ['test-path'],
          pluginPath: 'pluginPath',
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
      selectedManifest: 'Kustomize' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { getByText } = render(
      <TestWrapper>
        <KustomizeWithHarnessStore {...defaultProps} />
      </TestWrapper>
    )
    const backButton = getByText('back').parentElement
    userEvent.click(backButton!)
    await waitFor(() => expect(defaultProps.previousStep).toBeCalled())
    expect(defaultProps.previousStep).toHaveBeenCalledWith(defaultProps.prevStepData)
  })

  test('when files, skipResourceVersioning and overlayConfiguration runtime input', async () => {
    const defaultProps = {
      ...props,
      stepName: 'Manifest details',
      expressions: [],
      initialValues: {
        identifier: 'test',
        spec: {
          patchesPaths: RUNTIME_INPUT_VALUE,
          overlayConfiguration: RUNTIME_INPUT_VALUE,
          skipResourceVersioning: RUNTIME_INPUT_VALUE,
          pluginPath: RUNTIME_INPUT_VALUE,
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
        <KustomizeWithHarnessStore {...defaultProps} />
      </TestWrapper>
    )

    const filesInput = queryByAttribute('name', container, 'files') as HTMLInputElement
    expect(filesInput.value).toBe('<+input>')

    const overlayConfiguration = queryByAttribute('name', container, 'overlayConfiguration') as HTMLInputElement
    expect(overlayConfiguration.value).toBe('')
    const pluginPath = queryByAttribute('name', container, 'pluginPath') as HTMLInputElement
    expect(pluginPath.value).toBe('<+input>')

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
        type: ManifestDataType.Kustomize,
        spec: {
          patchesPaths: ['values-path'],
          skipResourceVersioning: true,
          overlayConfiguration: 'overlay-config',
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
      selectedManifest: 'Kustomize' as ManifestTypes,
      handleSubmit: jest.fn(),
      previousStep: jest.fn()
    }
    const { container, getByText } = render(
      <TestWrapper>
        <KustomizeWithHarnessStore {...defaultProps} />
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
