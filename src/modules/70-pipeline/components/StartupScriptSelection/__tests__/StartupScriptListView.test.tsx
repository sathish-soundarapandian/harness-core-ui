/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import connectorsData from '@pipeline/components/ManifestSelection/__tests__/connectors_mock.json'
import StartupScriptListView from '../StartupScriptListView'
import { fetchConnectors, mockErrorHandler, propListView } from './StartupScriptTestUtils'

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: () => {
    return {
      data: connectorsData,
      refetch: jest.fn()
    }
  }
}))

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: () => ({
    showSuccess: jest.fn(),
    showError: mockErrorHandler
  })
}))

describe('StartupScriptListView', () => {
  test(`renders StartupListview`, () => {
    const { container } = render(
      <TestWrapper>
        <StartupScriptListView {...propListView} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`should delete correctly`, async () => {
    propListView.isPropagating = true
    const { container } = render(
      <TestWrapper>
        <StartupScriptListView {...propListView} />
      </TestWrapper>
    )
    let gitConnector = await findByText(container, 'Github2')
    expect(gitConnector).toBeTruthy()
    const deleteBtn = container.querySelector('[data-icon="main-trash"]') as Element
    expect(deleteBtn).toBeDefined()
    fireEvent.click(deleteBtn)

    //should be closed
    gitConnector = await findByText(container, 'Github2')
    waitFor(() => expect(gitConnector).not.toBeTruthy())
  })

  test(`should edit correctly`, async () => {
    propListView.isPropagating = false
    const { container, getByText } = render(
      <TestWrapper>
        <StartupScriptListView {...propListView} />
      </TestWrapper>
    )
    const gitConnector = await findByText(container, 'Github2')
    expect(gitConnector).toBeTruthy()
    const editBtn = container.querySelectorAll('[data-icon="Edit"]')[0]
    expect(editBtn).toBeDefined()
    fireEvent.click(editBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0]

    const closeButton = portal.querySelector("button[class*='crossIcon']") as Element
    fireEvent.click(closeButton)

    //should be closed
    waitFor(() => expect(getByText('pipeline.startupScript.fileSource')).not.toBeTruthy())
  })

  test(`renders empty`, () => {
    const { container } = render(
      <TestWrapper>
        <StartupScriptListView {...propListView} startupScript={{} as any} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
