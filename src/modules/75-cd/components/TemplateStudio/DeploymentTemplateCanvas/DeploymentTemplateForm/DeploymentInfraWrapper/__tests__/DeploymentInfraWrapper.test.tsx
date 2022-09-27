/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  fireEvent,
  render,
  waitFor,
  findAllByText,
  findByText as findByTextGlobal,
  queryByAttribute
} from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { DeploymentContextProvider } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { DeploymentInfraWrapperWithRef } from '../DeploymentInfraWrapper'
import { initialValues, defaultInitialValues, defaultInitialValuesWithFileStore } from './mocks'

jest.mock('@connectors/pages/connectors/hooks/useGetConnectorsListHook/useGetConectorsListHook', () => ({
  useGetConnectorsListHook: jest.fn().mockReturnValue({
    loading: false,
    categoriesMap: {},
    connectorsList: ['K8sCluster'],
    connectorCatalogueOrder: ['CLOUD_PROVIDER']
  })
}))

const DeploymentContextWrapper = ({
  initialValue,
  children
}: React.PropsWithChildren<{ initialValue: any }>): JSX.Element => (
  <DeploymentContextProvider
    deploymentConfigInitialValues={initialValue}
    onDeploymentConfigUpdate={jest.fn()}
    isReadOnly={false}
    gitDetails={{}}
    queryParams={{ accountIdentifier: 'accountId', orgIdentifier: '', projectIdentifier: '' }}
    stepsFactory={{} as AbstractStepFactory}
  >
    {children}
  </DeploymentContextProvider>
)

describe('Test DeploymentInfraWrapperWithRef', () => {
  test('initial render', async () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentContextWrapper initialValue={defaultInitialValues}>
          <DeploymentInfraWrapperWithRef />
        </DeploymentContextWrapper>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('initial render with data - inline script', async () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentContextWrapper initialValue={initialValues}>
          <DeploymentInfraWrapperWithRef />
        </DeploymentContextWrapper>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('initial render with data - file store script', async () => {
    const { container: fileStoreContainer } = render(
      <TestWrapper>
        <DeploymentContextWrapper initialValue={defaultInitialValuesWithFileStore}>
          <DeploymentInfraWrapperWithRef />
        </DeploymentContextWrapper>
      </TestWrapper>
    )
    expect(fileStoreContainer).toMatchSnapshot()
  })

  test('default hostname always present field assertion', async () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentContextWrapper initialValue={defaultInitialValues}>
          <DeploymentInfraWrapperWithRef />
        </DeploymentContextWrapper>
      </TestWrapper>
    )
    const hotNameInput = container.querySelector('input[value="hostname"]') as HTMLInputElement
    expect(hotNameInput).toBeDefined()
  })

  test('should match inputs and labels for DeploymentInfraWrapperWithRef with initial values', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentContextWrapper initialValue={initialValues}>
          <DeploymentInfraWrapperWithRef />
        </DeploymentContextWrapper>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    // Title label assertions
    expect(() => getByText('common.variables')).toBeDefined()
    expect(() => getByText('pipeline.customDeployment.fetchInstancesScript')).toBeDefined()
    expect(() => getByText('pipeline.customDeployment.hostObjectArrayPath')).toBeDefined()
    expect(() => getByText('pipeline.customDeployment.hostAttributes')).toBeDefined()

    expect(container.querySelector('input[name="variables[0].name"]')).toHaveValue('clusterUrl')
    await waitFor(() => getByText('URL to connect to cluster'))
    expect(container.querySelector('input[name="instancesListPath"]')).toHaveValue('instances')
    expect(container.querySelector('input[name="instanceAttributes[0].description"]')).toHaveValue(
      'IP address of the host'
    )

    await waitFor(() => getByText('echo test'))
  })

  test('should be able to add delete variables and instanceAttributes', async () => {
    const { container, getByTestId, findByText } = render(
      <TestWrapper>
        <DeploymentContextWrapper
          initialValue={{
            ...defaultInitialValues,
            infrastructure: {
              ...defaultInitialValues.infrastructure,
              fetchInstancesScript: {
                store: {
                  type: 'Harness',
                  spec: {
                    files: ['org:/file']
                  }
                }
              }
            }
          }}
        ></DeploymentContextWrapper>
        <DeploymentInfraWrapperWithRef />
      </TestWrapper>
    )

    // addition and removal of infra variables
    const add = await findByText('variables.newVariable')
    act(() => {
      fireEvent.click(add)
    })
    await waitFor(() => findAllByText(document.body, 'variables.newVariable'))
    const name = queryByAttribute('name', document.body.querySelector('.bp3-dialog') as HTMLElement, 'name')
    act(() => {
      fireEvent.change(name!, { target: { value: 'stringVariable' } })
    })
    const saveButton = await findByTextGlobal(document.body.querySelector('.bp3-dialog')!, 'save')
    await act(async () => {
      fireEvent.click(saveButton!)
    })

    const variableNameField = await container.querySelector('input[name="variables[0].name"]')
    const variableValueField = await container.querySelector('input[name="variables[0].value"]')
    await waitFor(() => expect(variableNameField).toHaveAttribute('value', 'stringVariable'))

    const value = queryByAttribute('name', container, 'variables[0].value')
    await act(async () => {
      fireEvent.change(value!, { target: { value: 'myVarValue' } })
    })
    await waitFor(() => expect(variableValueField).toHaveAttribute('value', 'myVarValue'))

    // Delete variable
    const del = await getByTestId('delete-variable-0')

    act(() => {
      fireEvent.click(del)
    })

    // addition and removal of host attributes
    const addHostAttributeVariable = getByTestId('add-instanceAttriburteVar')
    fireEvent.click(addHostAttributeVariable!)
    expect(getByTestId('remove-instanceAttriburteVar-1')).toBeDefined()
    const deleteHostAttributeVariable = getByTestId('remove-instanceAttriburteVar-1')
    fireEvent.click(deleteHostAttributeVariable!)
  })
})
