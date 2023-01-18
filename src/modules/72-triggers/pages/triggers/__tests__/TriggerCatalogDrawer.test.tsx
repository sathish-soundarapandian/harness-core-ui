/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as pipelineNg from 'services/pipeline-ng'
import TriggerCatalogDrawer from '../views/TriggerCatalogDrawer'
import { triggerCatalogSuccessResponse } from './TriggerCatalogResponseMockData'

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper>
      <TriggerCatalogDrawer hideDrawer={jest.fn()} onSelect={jest.fn()} />
    </TestWrapper>
  )
}

describe('TriggerCatalogDrawer tests', () => {
  test('TriggerCatalogDrawer Data Loading', async () => {
    jest.spyOn(pipelineNg, 'useGetTriggerCatalog').mockReturnValue({ loading: true } as any)
    const { container } = render(<WrapperComponent />)
    expect(container).toMatchSnapshot()
  })

  test('TriggerCatalogDrawer Data with Status: Success', async () => {
    jest
      .spyOn(pipelineNg, 'useGetTriggerCatalog')
      .mockReturnValue({ data: triggerCatalogSuccessResponse, loading: false } as any)
    render(<WrapperComponent />)

    const portal = document.getElementsByClassName('bp3-portal')[0]

    expect(portal).toMatchSnapshot()
  })

  test('TriggerCatalogDrawer Data Loading Error', () => {
    const errorMessage = 'ERROR: Something went wrong'
    jest.spyOn(pipelineNg, 'useGetTriggerCatalog').mockReturnValue({ error: { message: errorMessage } } as any)
    render(<WrapperComponent />)
    const errorToastElem = document.getElementsByClassName('bp3-toast-message')[0]

    expect(errorToastElem.textContent).toBe(errorMessage)
  })
})
