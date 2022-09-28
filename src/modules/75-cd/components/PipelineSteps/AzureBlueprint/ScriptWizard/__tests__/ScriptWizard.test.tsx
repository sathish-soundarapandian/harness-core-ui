/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import connectorsData from '@pipeline/components/ManifestSelection/__tests__/connectors_mock.json'
import { ScriptWizard } from '../ScriptWizard'

const mockFunc = jest.fn()

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest
    .fn()
    .mockImplementation(() => ({ mutate: (): Promise<unknown> => Promise.resolve(connectorsData) })),
  useGetConnector: () => {
    return {
      data: connectorsData,
      refetch: mockFunc
    }
  }
}))

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showSuccess: mockFunc,
    showError: mockFunc
  })
}))

const defaultStore = {
  store: {
    type: 'Github',
    spec: {
      connectorRef: 'Github2',
      gitFetchType: 'Branch',
      folderPath: 'filePath',
      branch: 'branch'
    }
  }
}

const propWizard = {
  newConnectorView: false,
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  handleConnectorViewChange: jest.fn(),
  initialValues: {
    type: 'AzureCreateBPResource',
    name: 'azure blueprint',
    identifier: 'azure_blueprint',
    timeout: '10m',
    spec: {
      configuration: {
        connectorRef: 'testRef',
        assignmentName: '',
        scope: 'SUBSCRIPTIOIN',
        template: defaultStore
      }
    }
  },
  isReadonly: false,
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn()
}

const renderComponent = (props: any) => {
  return render(
    <TestWrapper>
      <ScriptWizard
        newConnectorView={true}
        expressions={[]}
        allowableTypes={
          [
            MultiTypeInputType.FIXED,
            MultiTypeInputType.RUNTIME,
            MultiTypeInputType.EXPRESSION
          ] as AllowedTypesWithRunTime[]
        }
        handleConnectorViewChange={jest.fn()}
        isReadonly={false}
        isOpen={true}
        onClose={jest.fn()}
        onSubmit={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )
}

describe('ScriptWizard & stepOne', () => {
  test('initial render with stepOne', async () => {
    const { getByText, getByTestId } = renderComponent(propWizard)

    const changeText = getByText('Change')
    userEvent.click(changeText)

    //connector change
    const gitConnector = getByText('Git')
    expect(gitConnector).toBeDefined()
    userEvent.click(gitConnector)

    const newConnectorLabel = getByText('newLabel pipeline.manifestType.gitConnectorLabel connector')
    expect(newConnectorLabel).toBeDefined()
    const newConnectorBtn = getByTestId('newConnectorButton')
    expect(newConnectorBtn).toBeDefined()

    const continueButton = getByText('continue')
    expect(continueButton).toBeDefined()
  })

  test('render with stepOne and open new connector component', async () => {
    const { getByText, getByTestId } = renderComponent({ ...propWizard, newConnectorView: true })

    const changeText = getByText('Change')
    userEvent.click(changeText)

    //connector change
    const gitConnector = getByText('Git')
    expect(gitConnector).toBeDefined()
    userEvent.click(gitConnector)

    const newConnectorLabel = getByText('newLabel pipeline.manifestType.gitConnectorLabel connector')
    expect(newConnectorLabel).toBeDefined()

    const newConnectorBtn = getByTestId('newConnectorButton')
    expect(newConnectorBtn).toBeDefined()
    userEvent.click(newConnectorBtn)

    const createNewConnectorLabel = getByText('connectors.createNewConnector')
    expect(createNewConnectorLabel).toBeDefined()
  })

  test('runtime stepOne', async () => {
    const props = {
      initialValues: {
        type: 'AzureCreateBPResource',
        name: 'azure blueprint',
        identifier: 'azure_blueprint',
        timeout: '10m',
        spec: {
          configuration: {
            connectorRef: '',
            assignmentName: 'azureBlueprint',
            scope: 'SUBSCRIPTION',
            template: {
              store: {
                type: 'Github',
                spec: {
                  connectorRef: RUNTIME_INPUT_VALUE,
                  gitFetchType: 'Branch',
                  paths: 'filePath',
                  branch: 'branch'
                }
              }
            }
          }
        }
      },
      store: 'Git',
      connectorRef: RUNTIME_INPUT_VALUE
    }
    const { getByText } = renderComponent({ propWizard, ...props })
    const continueBtn = getByText('continue')
    expect(continueBtn).toBeDefined()
    userEvent.click(continueBtn)

    await waitFor(() => {
      expect(getByText('back')).toBeDefined()
    })
    expect(continueBtn).toBeDefined()
  })
})
