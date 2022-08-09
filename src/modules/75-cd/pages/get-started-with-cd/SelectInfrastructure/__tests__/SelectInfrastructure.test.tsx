/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { SelectInfrastructure } from '../SelectInfrastructure'
import { DeployProvisiongWizardStepId, InfrastructureTypes } from '../../DeployProvisioningWizard/Constants'
import { DeployProvisioningWizard } from '../../DeployProvisioningWizard/DeployProvisioningWizard'

const pathParams = { accountId: 'accountId', orgIdentifier: 'orgId', projectIdentifier: 'projectId' }

const renderComponent = () => {
  return (
    <TestWrapper
      path={routes.toGetStartedWithCD({
        ...pathParams,
        module: 'cd'
      })}
      pathParams={{
        ...pathParams,
        module: 'cd'
      }}
    >
      <SelectInfrastructure enableNextBtn={jest.fn()} disableNextBtn={jest.fn()} onSuccess={jest.fn()} />
    </TestWrapper>
  )
}
describe('Test SelectInfrastructure component', () => {
  test('Initial render', () => {
    const { container } = render(renderComponent())
    const infraTypes = Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[]
    expect(infraTypes.length).toBe(InfrastructureTypes.length)
    expect(container.querySelector('span[data-tooltip-id="specifyYourEnvironment"]')).toBeDefined()
    expect(container.querySelector('input[name="infraId"]')).toBeDefined()
    expect(container.querySelector('span[data-tooltip-id="gcpInfraNamespace"]')).toBeDefined()
  })

  test('Shows error if no infra type is chosen', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCD({ ...pathParams, module: 'cd' })} pathParams={pathParams}>
        <DeployProvisioningWizard lastConfiguredWizardStepId={DeployProvisiongWizardStepId.SelectInfrastructure} />
      </TestWrapper>
    )

    const nextBtn = getByText('next: common.createPipeline')
    await act(async () => {
      fireEvent.click(nextBtn)
    })
    expect(container.querySelector('span[class*="FormError--errorTextIcon"]')).toBeInTheDocument()
    expect(getByText('common.getStarted.plsChoose')).toBeTruthy()

    expect(container.querySelector('div[class*="FormError--errorDiv"][data-name="namespace"]')).toBeInTheDocument()
    expect(getByText('common.validation.fieldIsRequired')).toBeTruthy()
  })

  test('Renders accordion on selecting infraType and entering namespace', () => {
    const { container } = render(renderComponent())
    const infraTypes = Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[]
    expect(infraTypes.length).toBe(InfrastructureTypes.length)

    //Selecting Infrastructure type
    fireEvent.click(infraTypes[0])

    //entering namespace value
    fireEvent.change(container.querySelector('input[name="namespace"]')!, {
      target: { value: 'dummy name' }
    })

    //opens accordion
    expect(container.querySelector("div[class*='Accordion--accordion']")).toBeDefined()
  })
})
