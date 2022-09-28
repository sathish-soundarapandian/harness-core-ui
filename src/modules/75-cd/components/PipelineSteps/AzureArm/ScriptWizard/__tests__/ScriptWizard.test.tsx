/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { render, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ScriptWizard } from '../ScriptWizard'

const renderComponent = (props: any, isParam = false) => {
  return render(
    <TestWrapper>
      <ScriptWizard
        isParam={isParam}
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
    const props = {
      initialValues: {
        type: StepType.CreateAzureARMResource,
        name: '',
        identifier: '',
        timeout: '10m',
        spec: {
          provisionerIdentifier: '',
          configuration: {
            connectorRef: '',
            template: {},
            scope: {
              type: 'ResourceGroup',
              spec: {
                subscription: '',
                resourceGroup: '',
                mode: ''
              }
            }
          }
        }
      }
    }
    const { getByText, getByTestId } = renderComponent(props)

    const gitConnector = await getByText('Git')
    expect(gitConnector).toBeDefined()
    act(() => userEvent.click(gitConnector))

    const newConnectorLabel = await getByText('newLabel pipeline.manifestType.gitConnectorLabel connector')
    expect(newConnectorLabel).toBeDefined()
    const newConnectorBtn = getByTestId('newConnectorButton')
    expect(newConnectorBtn).toBeDefined()

    const continueButton = await getByText('continue')
    expect(continueButton).toBeDefined()
  })

  test('runtime stepOne', async () => {
    const props = {
      initialValues: {
        type: 'AzureCreateBPResource',
        name: 'azure blueprint',
        identifier: 'azure_blueprint',
        timeout: '10m',
        spec: {
          provisionerIdentifier: 'azureBlueprint',
          configuration: {
            connectorRef: '',
            assignmentName: 'azureBlueprint',
            scope: 'SUBSCRIPTIOIN',
            template: {
              store: {
                type: 'Github',
                spec: {
                  connectorRef: RUNTIME_INPUT_VALUE,
                  gitFetchType: 'Branch',
                  paths: ['filePath'],
                  branch: 'branch'
                }
              }
            }
          }
        }
      },
      store: 'Github',
      connectorRef: RUNTIME_INPUT_VALUE
    }
    const { getByText } = renderComponent(props, true)
    const continueBtn = getByText('continue')
    expect(continueBtn).toBeDefined()
  })
})
