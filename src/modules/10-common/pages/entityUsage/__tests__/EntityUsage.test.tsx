/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, queryByText, screen, within } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, connectorPathProps, projectPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import EntityUsage from '../EntityUsage'
import referencedData from './entity-usage-data.json'
import referencedDataWithGit from './entity-usage-data-with-git.json'
import referencedDataWithDetails from './entity-usage-connector-data.json'

describe('Entity Usage', () => {
  test('render for no data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <EntityUsage
          mockData={{
            data: {} as any,
            loading: false
          }}
          entityIdentifier="secretId"
          entityType="Secrets"
        />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'entityReference.noRecordFound'))
    expect(container).toMatchSnapshot()
  })
  test('render for data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <EntityUsage
          mockData={{
            data: referencedData as any,
            loading: false
          }}
          entityIdentifier="secretId"
          entityType="Secrets"
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render for connector data with gitSync', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toConnectorDetails({ ...projectPathProps, ...connectorPathProps })}
        pathParams={{
          accountId: 'dummy',
          projectIdentifier: 'projectIdentifier',
          orgIdentifier: 'orgIdentifier',
          connectorId: 'connectorId'
        }}
        queryParams={{ repoIdentifier: 'firstRepo', branch: 'master' }}
        defaultAppStoreValues={{ isGitSyncEnabled: true }}
      >
        <EntityUsage
          mockData={{
            data: referencedDataWithGit as any,
            loading: false
          }}
          entityIdentifier="connectorId"
          entityType="Connectors"
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render for connector data with details', async () => {
    render(
      <TestWrapper
        path={routes.toConnectorDetails({ ...projectPathProps, ...connectorPathProps })}
        pathParams={{
          accountId: 'dummy',
          projectIdentifier: 'projectIdentifier',
          orgIdentifier: 'orgIdentifier',
          connectorId: 'connectorId'
        }}
      >
        <EntityUsage
          mockData={{
            data: referencedDataWithDetails as any,
            loading: false
          }}
          entityIdentifier="connectorId"
          entityType="Connectors"
        />
      </TestWrapper>
    )
    const cell1 = await screen.findByRole('row', {
      name: 'infraTest Infrastructure delegateInfra1'
    })
    expect(within(cell1).getByText('delegateInfra1')).toBeInTheDocument()

    const cell2 = await screen.findByRole('row', {
      name: 'inf Infrastructure e1'
    })
    expect(within(cell2).getByText('e1')).toBeInTheDocument()
  })
})
