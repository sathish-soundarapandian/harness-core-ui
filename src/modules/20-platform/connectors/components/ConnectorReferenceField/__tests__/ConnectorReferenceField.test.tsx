/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByAttribute, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { catalogueData } from '@connectors/pages/connectors/__tests__/mockData'
import { ConnectorReferenceField } from '../ConnectorReferenceField'
import { githubConnectorMock } from './mockData'

const clearSelectionHandler = jest.fn()
const onChangeHandler = jest.fn()
const getGitConnector = jest.fn(() => Promise.resolve(githubConnectorMock))
const placeholderText = 'Select a connector'

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: githubConnectorMock, refetch: getGitConnector, loading: false }
  }),
  useGetConnectorCatalogue: jest.fn().mockImplementation(() => {
    return { data: catalogueData, loading: false }
  })
}))
jest.mock('@connectors/pages/connectors/hooks/useGetConnectorsListHook/useGetConectorsListHook', () => ({
  useGetConnectorsListHook: jest.fn().mockReturnValue({
    loading: false,
    categoriesMap: { drawerLabel: 'Connectors', categories: [] },
    connectorsList: ['K8sCluster'],
    connectorCatalogueOrder: ['CLOUD_PROVIDER']
  })
}))

describe('ConnectorReferenceField tests', () => {
  test('Clear button should work with selected value', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ConnectorReferenceField
          name={'testConnector'}
          width={350}
          type={'Github'}
          selected={'mockConnector'}
          label={''}
          placeholder={placeholderText}
          clearSelection={clearSelectionHandler}
          accountIdentifier={'dummy'}
          projectIdentifier={'dummy'}
          orgIdentifier={'dummy'}
          onChange={onChangeHandler}
          disabled={false}
        />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(getByText(githubConnectorMock.data.connector.name)).toBeInTheDocument()
    })

    const clearSelectionIcon = queryByAttribute('data-icon', container, 'main-delete')
    expect(clearSelectionIcon).toBeInTheDocument()
    userEvent.click(clearSelectionIcon!)
    expect(clearSelectionHandler).toBeCalledTimes(1)
    expect(getByText(placeholderText)).toBeInTheDocument()
    expect(clearSelectionIcon).not.toBeInTheDocument()
  })

  test('Clear button should not be availble with selected value in disbled state', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ConnectorReferenceField
          name={'testConnector'}
          width={350}
          type={'Github'}
          selected={'mockConnector'}
          label={''}
          placeholder={placeholderText}
          clearSelection={clearSelectionHandler}
          accountIdentifier={'dummy'}
          projectIdentifier={'dummy'}
          orgIdentifier={'dummy'}
          onChange={onChangeHandler}
          disabled={true}
        />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(getByText(githubConnectorMock.data.connector.name)).toBeInTheDocument()
    })

    const clearSelectionIcon = queryByAttribute('data-icon', container, 'main-delete')
    expect(clearSelectionIcon).not.toBeInTheDocument()
  })
})
