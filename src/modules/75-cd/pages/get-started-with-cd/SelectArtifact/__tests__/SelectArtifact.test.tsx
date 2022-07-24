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
import { SelectArtifact } from '../SelectArtifact'
import { ArtifactProviders, DeployProvisiongWizardStepId } from '../../DeployProvisioningWizard/Constants'
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
      <SelectArtifact enableNextBtn={jest.fn()} disableNextBtn={jest.fn()} onSuccess={jest.fn()} />
    </TestWrapper>
  )
}
describe('Test SelectArtifact component', () => {
  test('Initial render', async () => {
    const { container } = render(renderComponent())
    const artifactTypes = Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[]
    expect(artifactTypes.length).toBe(ArtifactProviders.length)
  })

  test('Shows error if no artifcat type is chosen', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toGetStartedWithCD({ ...pathParams, module: 'cd' })} pathParams={pathParams}>
        <DeployProvisioningWizard lastConfiguredWizardStepId={DeployProvisiongWizardStepId.SelectArtifact} />
      </TestWrapper>
    )

    const nextBtn = getByText('cd.getStartedWithCD.manifestFile')
    await act(async () => {
      fireEvent.click(nextBtn)
    })
    expect(container.querySelector('span[class*="FormError--error"]')).toBeInTheDocument()
    expect(getByText('common.getStarted.plsChoose')).toBeTruthy()
  })

  test('Renders accordion on selecting artifact', () => {
    const { container } = render(renderComponent())
    const artifactTypes = Array.from(container.querySelectorAll('div[class*="bp3-card"]')) as HTMLElement[]
    expect(artifactTypes.length).toBe(ArtifactProviders.length)

    //Selecting artifact deployment type
    fireEvent.click(artifactTypes[0])

    //On selecting artifact deployment type, getting accordions
    expect(container.querySelector("div[class*='Accordion--accordion']")).toBeDefined()
  })
})
