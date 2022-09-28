/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, queryByAttribute, render, RenderResult, screen } from '@testing-library/react'
import { act } from 'react-test-renderer'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { getResourceTypeHandlerMock } from '@rbac/utils/RbacFactoryMockData'
import ResourcesCard from '../ResourcesCard'

jest.mock('@rbac/factories/RbacFactory', () => ({
  getResourceTypeHandler: jest.fn().mockImplementation(resource => getResourceTypeHandlerMock(resource))
}))
describe('Resource Card', () => {
  let renderObj: RenderResult
  test('it should render attribute selection option if required methods are provided', async () => {
    renderObj = render(
      <TestWrapper pathParams={{ accountId: 'dummy' }}>
        <ResourcesCard
          resourceType={ResourceType.ENVIRONMENT}
          resourceValues={{ attributeName: 'test', attributeValues: ['testVal', 'testVal2'] }}
          onResourceSelectionChange={jest.fn()}
          disableSpecificResourcesSelection={false}
        />
      </TestWrapper>
    )

    const { container } = renderObj
    expect(queryByAttribute('data-testid', container, 'attr-ENVIRONMENT')).not.toBeNull()
    const addResources = queryByAttribute('data-testid', container, 'addResources-ENVIRONMENT')
    await act(async () => {
      addResources && fireEvent.click(addResources)
    })
    const wizardDialog = findDialogContainer()
    expect(wizardDialog).toMatchSnapshot()
  })

  test('it should render attribute selection option with singular labels in AddResourceModal', async () => {
    renderObj = render(
      <TestWrapper pathParams={{ accountId: 'dummy' }}>
        <ResourcesCard
          resourceType={ResourceType.CONNECTOR}
          resourceValues={{ attributeName: 'test', attributeValues: ['testVal'] }}
          onResourceSelectionChange={jest.fn()}
          disableSpecificResourcesSelection={false}
        />
      </TestWrapper>
    )

    const { getByTestId } = renderObj
    const addResources = getByTestId('addResources-CONNECTOR')
    addResources && fireEvent.click(addResources)
    expect(await screen.findByText('rbac.addResourceModal.modalCtaLabelSingular')).toBeInTheDocument()
  })
})
