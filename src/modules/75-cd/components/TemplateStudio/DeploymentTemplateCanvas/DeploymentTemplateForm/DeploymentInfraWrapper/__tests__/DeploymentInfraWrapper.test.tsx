/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { DeploymentContextProvider } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { DeploymentInfraWrapperWithRef } from '../DeploymentInfraWrapper'
import { initialValues, defaultInitialValues, defaultInitialValuesWithFileStore } from './mocks'

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
  test('initial render and default hostName field assertion', async () => {
    const { container } = render(
      <TestWrapper>
        <DeploymentContextWrapper initialValue={defaultInitialValues}>
          <DeploymentInfraWrapperWithRef />
        </DeploymentContextWrapper>
      </TestWrapper>
    )
    const hotNameInput = container.querySelector('input[value="hostName"]') as HTMLInputElement
    expect(hotNameInput).toBeDefined()
    expect(container).toMatchSnapshot()

    const { container: fileStoreContainer } = render(
      <TestWrapper>
        <DeploymentContextWrapper initialValue={defaultInitialValuesWithFileStore}>
          <DeploymentInfraWrapperWithRef />
        </DeploymentContextWrapper>
      </TestWrapper>
    )
    expect(fileStoreContainer).toMatchSnapshot()
  })

  test('should match snapshot for DeploymentInfraWrapperWithRef with initial values', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentContextWrapper initialValue={initialValues}>
          <DeploymentInfraWrapperWithRef />
        </DeploymentContextWrapper>
      </TestWrapper>
    )
    expect(container.querySelector('input[name="variables[0].name"]')).toHaveValue('clusterUrl')
    expect(getByText('URL to connect to cluster')).toBeTruthy()
    expect(container.querySelector('input[name="instancesListPath"]')).toHaveValue('instances')
    expect(container.querySelector('input[name="instanceAttributes[0].description"]')).toHaveValue(
      'IP address of the host'
    )

    await waitFor(() => getByText('echo test'))
    expect(container).toMatchSnapshot()
  })

  test('adding new deploymentInfraVariables and instanceAttriburteVariables ', async () => {
    const { container, getByTestId } = render(
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
    // TODO: Test needs to be updated as per new changes in form
    // const addInraVariable = getByTestId('add-deploymentInfraVar')
    // fireEvent.click(addInraVariable!)
    // const deleteInraVariable = getByTestId('remove-deploymentInfraVar-0')
    //
    // expect(container.querySelector('input[name="variables[0].name"]')).toBeInTheDocument()
    // expect(deleteInraVariable).toBeDefined()
    // fireEvent.click(deleteInraVariable!)
    // expect(deleteInraVariable).not.toBeInTheDocument()

    // addition and removal of host attributes
    const addHostAttributeVariable = getByTestId('add-instanceAttriburteVar')
    fireEvent.click(addHostAttributeVariable!)
    expect(getByTestId('remove-instanceAttriburteVar-1')).toBeDefined()
    const deleteHostAttributeVariable = getByTestId('remove-instanceAttriburteVar-1')
    fireEvent.click(deleteHostAttributeVariable!)
    expect(container).toMatchSnapshot()
  })
})
