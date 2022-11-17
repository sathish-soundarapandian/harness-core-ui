/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findAllByText, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import connectorsData from '@pipeline/components/ManifestSelection/__tests__/connectors_mock.json'
import { fetchConnectors, mockErrorHandler, onUpdate, propListView } from './ApplicationConfigTestUtils'
import ApplicationConfigListView from '../ApplicationConfigListView/ApplicationConfigListView'
import { ApplicationConfigSelectionTypes } from '../ApplicationConfig.types'

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

const connectionStrings = {
  store: {
    type: 'Github',
    spec: {
      connectorRef: 'GithubConnection',
      gitFetchType: 'Branch',
      paths: ['filePath'],
      branch: 'branch'
    }
  }
}

describe('ApplicationConfigListView', () => {
  test(`renders ApplicationConfigListView`, () => {
    const { container } = render(
      <TestWrapper>
        <ApplicationConfigListView {...propListView} selectionType={ApplicationConfigSelectionTypes.PIPELINE} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`should delete correctly`, async () => {
    propListView.isPropagating = false
    const { container } = render(
      <TestWrapper>
        <ApplicationConfigListView {...propListView} />
      </TestWrapper>
    )
    const gitConnector = await findAllByText(container, 'Github2')
    expect(gitConnector).toBeTruthy()
    const deleteBtn = container.querySelector('[data-icon="main-trash"]') as Element
    expect(deleteBtn).toBeDefined()
    fireEvent.click(deleteBtn)

    waitFor(() => expect(onUpdate).toBeCalled())
  })

  test(`should edit correctly and delete connectionString`, async () => {
    propListView.isPropagating = false
    const { container } = render(
      <TestWrapper>
        <ApplicationConfigListView
          {...propListView}
          connectionStrings={connectionStrings}
          selectedOption={''}
          selectionType={ApplicationConfigSelectionTypes.PIPELINE}
        />
      </TestWrapper>
    )
    const gitConnector = await findAllByText(container, 'Github2')
    expect(gitConnector).toBeTruthy()
    const editBtn = container.querySelectorAll('[data-icon="Edit"]')[0]
    expect(editBtn).toBeDefined()
    fireEvent.click(editBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0]

    const closeButton = portal.querySelector("button[class*='crossIcon']") as Element
    fireEvent.click(closeButton)

    const githubConnection = await findAllByText(container, 'GithubConnection')
    expect(githubConnection).toBeTruthy()

    const deleteBtn = container.querySelectorAll('[data-icon="main-trash"]')
    expect(deleteBtn[1]).toBeDefined()
    fireEvent.click(deleteBtn[1])

    waitFor(() => expect(onUpdate).toBeCalled())
  })

  test(`renders empty`, () => {
    const { container } = render(
      <TestWrapper>
        <ApplicationConfigListView
          {...propListView}
          applicationSettings={{} as any}
          connectionStrings={{} as any}
          selectionType={ApplicationConfigSelectionTypes.PIPELINE}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
